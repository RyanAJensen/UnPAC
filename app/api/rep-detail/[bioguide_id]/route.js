import { getMemberDetail, getSponsoredLegislation, getCosponsoredLegislation, getMemberVotes } from '@/lib/congressApi';
import { findCandidate, getPrincipalCommittee, getContributions, getTotalRaised, inferFECOffice } from '@/lib/fecApi';
import { categorizeEmployers, aggregateBySector } from '@/lib/industryCategorizer';
import { computeInfluenceScore } from '@/lib/influenceScore';
import { categorize } from '@/lib/voteCategories';
import { generateMockForRep } from '@/lib/mockData';

export async function GET(request, { params }) {
  const { bioguide_id } = await params;
  const { searchParams } = new URL(request.url);
  const repName = searchParams.get('name') ?? '';
  const stateCode = searchParams.get('state') ?? '';
  const officeTitle = searchParams.get('office') ?? '';
  const fecId = searchParams.get('fecId') ?? null;

  const errors = [];
  let memberDetail = null;
  let votes = null;
  let finance = null;
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
    votes = congressResult.value.votes;
  } else {
    errors.push({ source: 'congress.gov', message: congressResult.reason?.message ?? 'Unknown error' });
    memberDetail = null;
    votes = mock.bills;
  }

  // FEC results
  if (fecResult.status === 'fulfilled') {
    finance = fecResult.value;
    influenceScore = computeInfluenceScore(finance?.sectors ?? []);
  } else {
    errors.push({ source: 'fec', message: fecResult.reason?.message ?? 'Unknown error' });
    finance = mock.finance;
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
  // Fetch sponsored, cosponsored, and actual floor votes in parallel.
  // Cosponsored and votes use .catch(() => []) so a 404/timeout never breaks the whole request.
  const [memberDetail, sponsored, cosponsored, memberVotes] = await Promise.all([
    getMemberDetail(bioguideId),
    getSponsoredLegislation(bioguideId),
    getCosponsoredLegislation(bioguideId).catch(() => []),
    getMemberVotes(bioguideId).catch(() => []),
  ]);

  return {
    memberDetail,
    votes: buildVoteRecords(sponsored, cosponsored, memberVotes),
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
    topContributors: contributions.slice(0, 10),
  };
}

/**
 * Merge all three legislative activity types into one sorted list.
 *
 * Weights (carried through to conflict detection):
 *   Sponsored   = 1.0  — authored and introduced the bill (strongest signal)
 *   Cosponsored = 0.5  — explicitly added their name in support
 *   Yes / No    = 0.3  — floor vote (meaningful but applies to all members)
 *   Not Voting  = 0.1  — abstained
 *   Present     = 0.1  — present but did not vote
 */
function buildVoteRecords(sponsored, cosponsored, memberVotes) {
  const sponsoredEntries = sponsored.map(bill => ({
    billId:    bill.billId ?? '',
    billTitle: bill.billTitle ?? 'Untitled',
    category:  categorize(bill.billTitle ?? ''),
    vote:      'Sponsored',
    weight:    1.0,
    date:      bill.date ?? null,
  }));

  const cosponsoredEntries = cosponsored.map(bill => ({
    billId:    bill.billId ?? '',
    billTitle: bill.billTitle ?? 'Untitled',
    category:  categorize(bill.billTitle ?? ''),
    vote:      'Cosponsored',
    weight:    0.5,
    date:      bill.date ?? null,
  }));

  const voteEntries = memberVotes.map(v => ({
    billId:    null,
    billTitle: v.billTitle ?? 'Floor Vote',
    category:  categorize(v.billTitle ?? ''),
    vote:      v.position,
    weight:    (v.position === 'Yes' || v.position === 'No') ? 0.3 : 0.1,
    date:      v.date ?? null,
  }));

  return [
    ...sponsoredEntries,
    ...cosponsoredEntries,
    ...voteEntries,
  ].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
}
