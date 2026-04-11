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

/**
 * GovTrack (free, no key needed) — fetch a member's 20 most recent floor votes.
 * Maps Congress.gov bioguide ID → GovTrack numeric ID → vote records.
 */
export async function getMemberVotes(bioguideId) {
  // Step 1: resolve GovTrack person ID from bioguide ID
  const personRes = await fetch(
    `https://www.govtrack.us/api/v2/person?bioguideid=${bioguideId}&format=json`,
    { next: { revalidate: 3600 } }
  );
  if (!personRes.ok) return [];
  const personData = await personRes.json();
  const govtrackId = personData.objects?.[0]?.id;
  if (!govtrackId) return [];

  // Step 2: get their recent votes
  const votesRes = await fetch(
    `https://www.govtrack.us/api/v2/vote_voter?person=${govtrackId}&limit=20&order_by=-created&format=json`,
    { next: { revalidate: 3600 } }
  );
  if (!votesRes.ok) return [];
  const votesData = await votesRes.json();

  return (votesData.objects ?? []).map(vv => ({
    billTitle: vv.vote?.related_bill?.title ?? vv.vote?.question ?? 'Floor Vote',
    date: vv.created ? vv.created.split('T')[0] : null,
    position: normalizePosition(vv.option?.value ?? ''),
  }));
}

function normalizePosition(value) {
  const v = value.toLowerCase();
  if (v === 'yea' || v === 'yes' || v === 'aye') return 'Yes';
  if (v === 'nay' || v === 'no') return 'No';
  if (v.includes('not voting') || v.includes('absent')) return 'Not Voting';
  if (v === 'present') return 'Present';
  return value;
}
