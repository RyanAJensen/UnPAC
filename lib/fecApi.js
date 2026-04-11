/**
 * Federal Election Commission (FEC) API
 * No signup needed — uses DEMO_KEY for hackathon (30 req/min)
 * Docs: https://api.open.fec.gov/developers/
 */

const BASE = 'https://api.open.fec.gov/v1';
const API_KEY = 'DEMO_KEY';

async function fecFetch(path) {
  const sep = path.includes('?') ? '&' : '?';
  const url = `${BASE}${path}${sep}api_key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FEC API error ${res.status}: ${path}`);
  return res.json();
}

export async function findCandidate(name, state, office) {
  // office: 'S' = Senate, 'H' = House, 'P' = President
  const params = new URLSearchParams({ name, state, office: office ?? '' });
  const data = await fecFetch(`/candidates/?${params}&sort=-receipts&per_page=5`);
  const results = data.results ?? [];
  // Prefer active candidates (has_raised_funds and recent cycle)
  const best = results.find(c => c.has_raised_funds) ?? results[0];
  return best ?? null;
}

export async function getPrincipalCommittee(candidateId) {
  const data = await fecFetch(`/candidate/${candidateId}/committees/?designation=P`);
  const committees = data.results ?? [];
  return committees[0] ?? null;
}

export async function getContributions(committeeId, cycle = '2024') {
  const params = new URLSearchParams({
    committee_id: committeeId,
    two_year_transaction_period: cycle,
    per_page: '100',
    sort: '-contribution_receipt_amount',
  });
  const data = await fecFetch(`/schedules/schedule_a/?${params}`);
  return (data.results ?? []).map(c => ({
    name: c.contributor_name ?? 'Unknown',
    employer: c.contributor_employer ?? '',
    amount: c.contribution_receipt_amount ?? 0,
    entityType: c.entity_type ?? '',
    isPAC: isPAC(c),
    isSuperPAC: isSuperPAC(c),
  }));
}

export async function getTotalRaised(committeeId, cycle = '2024') {
  const data = await fecFetch(`/committee/${committeeId}/totals/?cycle=${cycle}`);
  const totals = data.results ?? [];
  return totals[0]?.receipts ?? 0;
}

function isPAC(contribution) {
  const type = (contribution.entity_type ?? '').toUpperCase();
  const name = (contribution.contributor_name ?? '').toUpperCase();
  return type === 'PAC' || name.includes(' PAC') || name.endsWith('PAC');
}

function isSuperPAC(contribution) {
  const type = (contribution.entity_type ?? '').toUpperCase();
  const name = (contribution.contributor_name ?? '').toUpperCase();
  return type.includes('SUPER PAC') || name.includes('SUPER PAC');
}

// Map FEC office code from Google Civic office title
export function inferFECOffice(officeTitle = '') {
  const t = officeTitle.toLowerCase();
  if (t.includes('senator') || t.includes('senate')) return 'S';
  if (t.includes('representative') || t.includes('house')) return 'H';
  return 'S'; // default to Senate for demo
}
