import { getMemberDetail, getSponsoredLegislation, getCosponsoredLegislation, getLandmarkVotes, getRecentFloorVotes } from '@/lib/congressApi';
import { findCandidate, getPrincipalCommittee, getContributions, getTotalRaised, inferFECOffice } from '@/lib/fecApi';
import { categorizeEmployers, aggregateBySector } from '@/lib/industryCategorizer';
import { computeInfluenceScore } from '@/lib/influenceScore';
import { categorize } from '@/lib/voteCategories';
import { generateMockForRep } from '@/lib/mockData';

export async function GET(request, { params }) {
  const { bioguide_id } = await params;
  const { searchParams } = new URL(request.url);
  const repName   = searchParams.get('name')   ?? '';
  const stateCode = searchParams.get('state')  ?? '';
  const officeTitle = searchParams.get('office') ?? '';
  const fecId     = searchParams.get('fecId')  ?? null;

  const errors = [];
  let memberDetail  = null;
  let votes         = null;
  let finance       = null;
  let influenceScore = null;

  // Run Congress.gov and FEC in parallel
  const [congressResult, fecResult] = await Promise.allSettled([
    fetchCongressData(bioguide_id),
    fetchFECData(repName, stateCode, officeTitle, fecId),
  ]);

  // Seeded mock as fallback (deterministic per rep so demo data looks varied)
  const mock = generateMockForRep(bioguide_id);

  // Congress.gov results
  if (congressResult.status === 'fulfilled') {
    memberDetail = congressResult.value.memberDetail;
    votes        = congressResult.value.votes;
  } else {
    errors.push({ source: 'congress.gov', message: congressResult.reason?.message ?? 'Unknown error' });
    memberDetail = null;
    votes        = mock.bills;
  }

  // FEC results
  if (fecResult.status === 'fulfilled') {
    finance        = fecResult.value;
    influenceScore = computeInfluenceScore(finance?.sectors ?? []);
  } else {
    errors.push({ source: 'fec', message: fecResult.reason?.message ?? 'Unknown error' });
    finance        = mock.finance;
    influenceScore = computeInfluenceScore(mock.finance.sectors);
  }

  return Response.json({
    bioguideId: bioguide_id,
    memberDetail,
    votes,
    votesDataSource: 'congress.gov',
    finance,
    influenceScore,
    errors,
  });
}

async function fetchCongressData(bioguideId) {
  // Fetch member detail first — we need chamber to route landmark vote lookups correctly.
  const memberDetail = await getMemberDetail(bioguideId);
  const { chamber, state } = memberDetail;

  // Extract last name for Senate XML fallback matching
  // directOrderName is "FirstName LastName"; take the last token
  const nameParts = (memberDetail.name ?? '').trim().split(/\s+/);
  const lastName  = nameParts.at(-1) ?? '';

  // Fetch everything else in parallel.
  // Landmark votes use official House Clerk / Senate.gov XML (accurate).
  // Recent floor votes use GovTrack (best-effort, non-landmark).
  const [sponsored, cosponsored, landmarkVotes, recentVotes] = await Promise.all([
    getSponsoredLegislation(bioguideId),
    getCosponsoredLegislation(bioguideId).catch(() => []),
    getLandmarkVotes({ bioguideId, chamber, lastName, state }).catch(() => []),
    getRecentFloorVotes(bioguideId).catch(() => []),
  ]);

  return {
    memberDetail,
    votes: buildVoteRecords(sponsored, cosponsored, landmarkVotes, recentVotes),
  };
}

async function fetchFECData(repName, stateCode, officeTitle, fecId) {
  if (!repName) return null;

  let candidateId = fecId;
  if (!candidateId) {
    const candidate = await findCandidate(repName, stateCode, inferFECOffice(officeTitle));
    if (!candidate) return null;
    candidateId = candidate.candidate_id;
  }

  const committee = await getPrincipalCommittee(candidateId);
  if (!committee) return null;

  const [contributions, totalRaised] = await Promise.all([
    getContributions(committee.committee_id),
    getTotalRaised(committee.committee_id),
  ]);

  const employerToSector = await categorizeEmployers(contributions);
  const sectors = aggregateBySector(contributions, employerToSector);

  return {
    cycle: '2024',
    totalRaised,
    sectors,
    topContributors: aggregateTopContributors(contributions),
  };
}

/**
 * Aggregate individual schedule A transactions into top organizations.
 * PACs/SuperPACs group by their own name; individuals group by employer.
 * Returns top 10 by total dollars contributed.
 */
function aggregateTopContributors(contributions) {
  const byOrg = {};
  for (const c of contributions) {
    // PAC/SuperPAC: the contributor name IS the organization
    // Individual: group by employer to see which companies donate most
    const key = (c.isPAC || c.isSuperPAC) ? c.name : (c.employer?.trim() || c.name);
    if (!key) continue;
    if (!byOrg[key]) {
      byOrg[key] = { name: key, amount: 0, isPAC: false, isSuperPAC: false };
    }
    byOrg[key].amount += c.amount;
    if (c.isSuperPAC) byOrg[key].isSuperPAC = true;
    else if (c.isPAC) byOrg[key].isPAC = true;
  }
  return Object.values(byOrg)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);
}

/**
 * Merge all legislative activity into one sorted list.
 *
 * Weights:
 *   Sponsored   = 1.0  — authored and introduced (strongest signal)
 *   Cosponsored = 0.5  — explicit co-author support
 *   Yes / No    = 0.3  — floor vote
 *   Not Voting  = 0.1  — abstained
 *   Present     = 0.1  — present but did not vote
 */
function buildVoteRecords(sponsored, cosponsored, landmarkVotes, recentVotes) {
  const sponsoredEntries = sponsored.map(bill => ({
    billId:     bill.billId ?? '',
    billTitle:  bill.billTitle ?? 'Untitled',
    category:   categorize(bill.billTitle ?? ''),
    vote:       'Sponsored',
    weight:     1.0,
    date:       bill.date ?? null,
    isLandmark: false,
  }));

  const cosponsoredEntries = cosponsored.map(bill => ({
    billId:     bill.billId ?? '',
    billTitle:  bill.billTitle ?? 'Untitled',
    category:   categorize(bill.billTitle ?? ''),
    vote:       'Cosponsored',
    weight:     0.5,
    date:       bill.date ?? null,
    isLandmark: false,
  }));

  const landmarkEntries = landmarkVotes.map(v => ({
    billId:     null,
    billTitle:  v.billTitle,
    category:   v.category,
    vote:       v.position,
    weight:     (v.position === 'Yes' || v.position === 'No') ? 0.3 : 0.1,
    date:       v.date ?? null,
    isLandmark: true,
  }));

  // Drop any recent floor votes whose title duplicates a landmark
  const landmarkTitles = new Set(landmarkVotes.map(v => v.billTitle));
  const recentEntries = recentVotes
    .filter(v => !landmarkTitles.has(v.billTitle))
    .map(v => ({
      billId:     null,
      billTitle:  v.billTitle ?? 'Floor Vote',
      category:   categorize(v.billTitle ?? ''),
      vote:       v.position,
      weight:     (v.position === 'Yes' || v.position === 'No') ? 0.3 : 0.1,
      date:       v.date ?? null,
      isLandmark: false,
    }));

  return [
    ...sponsoredEntries,
    ...cosponsoredEntries,
    ...landmarkEntries,
    ...recentEntries,
  ].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
}
