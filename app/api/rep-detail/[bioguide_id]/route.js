import { getMemberDetail, getSponsoredLegislation } from '@/lib/congressApi';
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
  const fecId = searchParams.get('fecId') ?? null; // passed directly from OpenStates

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

  const mock = generateMockForRep(bioguide_id);

  // Congress.gov results
  if (congressResult.status === 'fulfilled') {
    memberDetail = congressResult.value.memberDetail;
    votes = congressResult.value.votes;
  } else {
    errors.push({ source: 'congress.gov', message: congressResult.reason?.message ?? 'Unknown error' });
    memberDetail = null;
    votes = mock.bills; // seeded per rep
  }

  // FEC results
  if (fecResult.status === 'fulfilled') {
    finance = fecResult.value;
    influenceScore = computeInfluenceScore(finance?.sectors ?? []);
  } else {
    errors.push({ source: 'fec', message: fecResult.reason?.message ?? 'Unknown error' });
    finance = mock.finance; // seeded per rep
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
  const [memberDetail, bills] = await Promise.all([
    getMemberDetail(bioguideId),
    getSponsoredLegislation(bioguideId),
  ]);

  return {
    memberDetail,
    votes: buildVoteRecords(bills),
  };
}

async function fetchFECData(repName, stateCode, officeTitle, fecId) {
  if (!repName) return null;

  // Use FEC ID directly from OpenStates if available (faster, more reliable)
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

function buildVoteRecords(bills) {
  return bills.map(bill => ({
    billId: bill.billId ?? bill.identifier ?? bill.number ?? '',
    billTitle: bill.billTitle ?? bill.title ?? 'Untitled',
    category: categorize(bill.billTitle ?? bill.title ?? ''),
    vote: 'Sponsored',
    date: bill.date ?? bill.introducedDate ?? null,
    description: null,
  }));
}
