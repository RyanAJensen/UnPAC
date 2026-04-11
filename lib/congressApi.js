/**
 * Congress.gov API v3
 * Sign up: https://api.congress.gov/sign-up/
 */

const BASE = 'https://api.congress.gov/v3';

async function congressFetch(path) {
  const sep = path.includes('?') ? '&' : '?';
  const key = process.env.CONGRESS_API_KEY;
  const keyParam = key && key !== 'b864a243-33ad-49c5-92ff-77a9ad18bafc' ? `&api_key=${key}` : '';
  const url = `${BASE}${path}${sep}format=json${keyParam}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Congress.gov API error ${res.status}: ${path}`);
  return res.json();
}

export async function getMemberDetail(bioguideId) {
  const data = await congressFetch(`/member/${bioguideId}`);
  const m = data.member ?? {};
  return {
    bioguideId,
    name: m.directOrderName ?? m.invertedOrderName ?? null,
    party: m.partyHistory?.[0]?.partyAbbreviation ?? null,
    state: m.state ?? null,
    photoUrl: m.depiction?.imageUrl ?? null,
    website: m.officialWebsiteUrl ?? null,
    currentRole: m.terms?.item?.[0] ?? null,
  };
}

export async function getSponsoredLegislation(bioguideId) {
  const data = await congressFetch(`/member/${bioguideId}/sponsored-legislation?limit=20`);
  const bills = data.sponsoredLegislation ?? [];
  return bills.map(bill => ({
    billId: bill.number ? `${bill.type}${bill.number}` : bill.url,
    billTitle: bill.title ?? 'Untitled Bill',
    date: bill.introducedDate ?? null,
    congress: bill.congress ?? null,
    url: bill.url ?? null,
  }));
}

export async function getCosponsoredLegislation(bioguideId) {
  const data = await congressFetch(`/member/${bioguideId}/cosponsored-legislation?limit=20`);
  const bills = data.cosponsoredLegislation ?? [];
  return bills.map(bill => ({
    billId: bill.number ? `${bill.type}${bill.number}` : bill.url,
    billTitle: bill.title ?? 'Untitled Bill',
    date: bill.introducedDate ?? null,
    congress: bill.congress ?? null,
    url: bill.url ?? null,
  }));
}

// ============================================================
// GovTrack — floor votes (free API, no key required)
// ============================================================

/**
 * Landmark bills to track for every member.
 * billType matches GovTrack's bill_type parameter.
 */
const LANDMARK_BILLS = [
  {
    displayName: 'CHIPS and Science Act',
    congress: 117, billType: 'house_bill', number: 4346,
  },
  {
    displayName: 'Ukraine Aid Supplemental (2024)',
    congress: 118, billType: 'house_bill', number: 8035,
  },
  {
    displayName: 'Big Beautiful Bill',
    congress: 119, billType: 'house_bill', number: 1,
  },
  {
    displayName: 'Israel Aid Supplemental (2024)',
    congress: 118, billType: 'house_bill', number: 8034,
  },
  {
    displayName: 'Taiwan Aid Supplemental (2024)',
    congress: 118, billType: 'house_bill', number: 8036,
  },
  {
    displayName: 'Impeachment of Trump (Jan. 6, 2021)',
    congress: 117, billType: 'house_resolution', number: 24,
  },
  {
    displayName: 'Impeachment of Trump (Ukraine, 2019)',
    congress: 116, billType: 'house_resolution', number: 755,
  },
];

// Module-level caches persist within a Node.js server instance.
// Key: "congress/billType/number" → GovTrack vote objects[]
const _billVotesCache = new Map();

async function govtrackFetch(path) {
  const res = await fetch(`https://www.govtrack.us/api/v2${path}`);
  if (!res.ok) throw new Error(`GovTrack API error ${res.status}: ${path}`);
  return res.json();
}

/**
 * Returns GovTrack vote objects associated with a landmark bill.
 * Results are cached so parallel member lookups only pay this cost once.
 */
async function getBillVotes(bill) {
  const key = `${bill.congress}/${bill.billType}/${bill.number}`;
  if (_billVotesCache.has(key)) return _billVotesCache.get(key);

  try {
    const billData = await govtrackFetch(
      `/bill?congress=${bill.congress}&bill_type=${bill.billType}&number=${bill.number}&format=json`
    );
    const billId = billData.objects?.[0]?.id;
    if (!billId) { _billVotesCache.set(key, []); return []; }

    const voteData = await govtrackFetch(`/vote?related_bill=${billId}&limit=10&format=json`);
    const votes = voteData.objects ?? [];
    _billVotesCache.set(key, votes);
    return votes;
  } catch {
    _billVotesCache.set(key, []);
    return [];
  }
}

/**
 * Checks how a specific GovTrack person voted on a specific landmark bill.
 * Returns { position, date } or null if they were not in Congress at the time.
 */
async function getMemberPositionOnBill(bill, govtrackPersonId) {
  const votes = await getBillVotes(bill);
  if (votes.length === 0) return null;

  // For each vote on this bill, check whether this member participated.
  // Run all checks in parallel; return the first match found.
  const checks = await Promise.all(
    votes.map(async (vote) => {
      try {
        const data = await govtrackFetch(
          `/vote_voter?vote=${vote.id}&person=${govtrackPersonId}&format=json`
        );
        const vv = data.objects?.[0];
        if (!vv) return null;
        return {
          position: normalizePosition(vv.option?.value ?? ''),
          date: vote.created?.split('T')[0] ?? null,
        };
      } catch {
        return null;
      }
    })
  );

  return checks.find(c => c !== null) ?? null;
}

/**
 * Fetches this member's positions on all landmark bills in parallel.
 * Returns only the bills they actually voted on (were in Congress for).
 */
async function fetchLandmarkVotes(govtrackPersonId) {
  const results = await Promise.allSettled(
    LANDMARK_BILLS.map(async (bill) => {
      const result = await getMemberPositionOnBill(bill, govtrackPersonId);
      if (!result) return null;
      return {
        billTitle: bill.displayName,
        date: result.date,
        position: result.position,
        isLandmark: true,
      };
    })
  );

  return results
    .filter(r => r.status === 'fulfilled' && r.value !== null)
    .map(r => r.value);
}

/** Fetches the 20 most recent general floor votes for a member. */
async function fetchRecentVotes(govtrackId) {
  try {
    const data = await govtrackFetch(
      `/vote_voter?person=${govtrackId}&limit=20&order_by=-created&format=json`
    );
    return (data.objects ?? []).map(vv => ({
      billTitle: vv.vote?.related_bill?.title ?? vv.vote?.question ?? 'Floor Vote',
      date: vv.created?.split('T')[0] ?? null,
      position: normalizePosition(vv.option?.value ?? ''),
      isLandmark: false,
    }));
  } catch {
    return [];
  }
}

/**
 * Main export: returns landmark votes (always included if the member participated)
 * followed by recent general floor votes, deduplicating by bill title.
 */
export async function getMemberVotes(bioguideId) {
  // Resolve GovTrack numeric ID from bioguide ID
  const personData = await govtrackFetch(
    `/person?bioguideid=${bioguideId}&format=json`
  );
  const govtrackId = personData.objects?.[0]?.id;
  if (!govtrackId) return [];

  // Landmark and recent votes run in parallel
  const [landmark, recentRaw] = await Promise.all([
    fetchLandmarkVotes(govtrackId),
    fetchRecentVotes(govtrackId),
  ]);

  // Landmark votes take precedence; drop recent duplicates
  const landmarkTitles = new Set(landmark.map(v => v.billTitle));
  const recent = recentRaw.filter(v => !landmarkTitles.has(v.billTitle));

  return [...landmark, ...recent];
}

function normalizePosition(value) {
  const v = value.toLowerCase();
  if (v === 'yea' || v === 'yes' || v === 'aye') return 'Yes';
  if (v === 'nay' || v === 'no') return 'No';
  if (v.includes('not voting') || v.includes('absent')) return 'Not Voting';
  if (v === 'present') return 'Present';
  return value;
}
