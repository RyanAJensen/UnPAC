/**
 * Congress.gov API v3
 * Sign up: https://api.congress.gov/sign-up/
 */

const BASE = 'https://api.congress.gov/v3';

async function congressFetch(path) {
  const sep = path.includes('?') ? '&' : '?';
  const url = `${BASE}${path}${sep}api_key=${process.env.CONGRESS_API_KEY}&format=json`;
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
