import { getMemberDetail, getSponsoredLegislation } from '@/lib/congressApi';
import { findCandidate, getPrincipalCommittee, getContributions, getTotalRaised, inferFECOffice } from '@/lib/fecApi';
import { categorizeEmployers, aggregateBySector } from '@/lib/industryCategorizer';
import { computeInfluenceScore } from '@/lib/influenceScore';
import { categorize } from '@/lib/voteCategories';
import {
  MOCK_SPONSORED_LEGISLATION,
  MOCK_FEC_SECTORS,
  MOCK_FEC_CONTRIBUTORS,
  MOCK_MEMBER_DETAIL,
} from '@/lib/mockData';

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

  // Congress.gov results
  if (congressResult.status === 'fulfilled') {
    memberDetail = congressResult.value.memberDetail;
    votes = congressResult.value.votes;
  } else {
    errors.push({ source: 'congress.gov', message: congressResult.reason?.message ?? 'Unknown error' });
    memberDetail = MOCK_MEMBER_DETAIL;
    votes = buildVoteRecords(MOCK_SPONSORED_LEGISLATION);
  }

  // FEC results
  if (fecResult.status === 'fulfilled') {
    finance = fecResult.value;
    influenceScore = computeInfluenceScore(finance?.sectors ?? []);
  } else {
    errors.push({ source: 'fec', message: fecResult.reason?.message ?? 'Unknown error' });
    finance = {
      cycle: '2024',
      totalRaised: MOCK_FEC_SECTORS.reduce((s, x) => s + x.amount, 0),
      sectors: MOCK_FEC_SECTORS,
      topContributors: MOCK_FEC_CONTRIBUTORS,
    };
    influenceScore = computeInfluenceScore(MOCK_FEC_SECTORS);
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
  const useMock = !process.env.CONGRESS_API_KEY || process.env.CONGRESS_API_KEY === 'your_congress_api_key_here';
  if (useMock) {
    return {
      memberDetail: MOCK_MEMBER_DETAIL,
      votes: buildVoteRecords(MOCK_SPONSORED_LEGISLATION),
    };
  }

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
