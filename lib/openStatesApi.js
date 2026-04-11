/**
 * OpenStates API v3
 * Sign up: https://openstates.org/accounts/register/
 * Docs: https://docs.openstates.org/api-v3/
 */

const BASE = 'https://v3.openstates.org';

// Module-level cache to stay under 100 req/day free limit
const cache = new Map();

async function openStatesFetch(path) {
  if (cache.has(path)) return cache.get(path);
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'X-API-KEY': process.env.OPENSTATES_API_KEY ?? '' },
  });
  if (!res.ok) throw new Error(`OpenStates API error ${res.status}: ${path}`);
  const data = await res.json();
  cache.set(path, data);
  return data;
}

export async function findStateLegislator(name, stateCode) {
  const jurisdiction = stateCode.toLowerCase();
  const encodedName = encodeURIComponent(name);

  // Try exact name search first
  try {
    const data = await openStatesFetch(`/people?jurisdiction=${jurisdiction}&name=${encodedName}`);
    const results = data.results ?? [];
    if (results.length > 0) {
      // Prefer currently active member
      return results.find(p => p.current_role !== null) ?? results[0];
    }
  } catch { /* fall through to fuzzy */ }

  // Fuzzy: last name only, then score by word overlap
  const lastName = name.split(' ').slice(-1)[0];
  try {
    const data = await openStatesFetch(`/people?jurisdiction=${jurisdiction}&name=${encodeURIComponent(lastName)}`);
    const results = data.results ?? [];
    if (results.length === 0) return null;

    const civicWords = name.toLowerCase().split(' ');
    const scored = results.map(p => ({
      ...p,
      score: civicWords.filter(w => p.name.toLowerCase().includes(w)).length,
    }));
    const best = scored.sort((a, b) => b.score - a.score)[0];
    return best.score >= 2 ? best : null;
  } catch {
    return null;
  }
}

export async function getSponsoredBills(personId) {
  try {
    const data = await openStatesFetch(
      `/bills?sponsor_classification=primary&sponsor_id=${personId}&per_page=20`
    );
    return data.results ?? [];
  } catch {
    return [];
  }
}
