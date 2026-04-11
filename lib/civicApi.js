/**
 * Address → Representatives pipeline (no Google required)
 *
 * 1. US Census Bureau Geocoder (free, no key) → lat/lng
 * 2. OpenStates people.geo (existing key) → all legislators with bioguide + FEC IDs
 */

const CENSUS_BASE = 'https://geocoding.geo.census.gov/geocoder/geographies/address';
const OPENSTATES_BASE = 'https://v3.openstates.org';

export async function getRepresentatives(address) {
  // Step 1: geocode
  const coords = await geocodeAddress(address);

  // Step 2: fetch all reps at that location
  const reps = await getRepsAtLocation(coords.lat, coords.lng);

  return {
    address: coords.matchedAddress,
    reps,
  };
}

async function geocodeAddress(address) {
  // Parse the address into components for Census geocoder
  // Accepts "350 Fifth Ave, New York, NY 10118" format
  const parts = address.split(',').map(s => s.trim());
  const street = parts[0] ?? address;
  const city = parts[1] ?? '';
  const stateZip = parts[2] ?? '';
  const [stateCode, zip] = stateZip.trim().split(/\s+/);

  const params = new URLSearchParams({
    street,
    city,
    state: stateCode ?? '',
    zip: zip ?? '',
    benchmark: 'Public_AR_Census2020',
    vintage: 'Census2020_Census2020',
    layers: 'all',
    format: 'json',
  });

  const res = await fetch(`${CENSUS_BASE}?${params}`);
  if (!res.ok) throw new Error(`Census geocoder error ${res.status}`);
  const data = await res.json();

  const matches = data.result?.addressMatches ?? [];
  if (matches.length === 0) {
    throw new Error('Address not found. Try a more specific US address (e.g. "350 Fifth Ave, New York, NY 10118").');
  }

  const match = matches[0];
  return {
    lat: match.coordinates.y,
    lng: match.coordinates.x,
    matchedAddress: match.matchedAddress ?? address,
  };
}

async function getRepsAtLocation(lat, lng) {
  const url = `${OPENSTATES_BASE}/people.geo?lat=${lat}&lng=${lng}&include=other_identifiers`;
  const res = await fetch(url, {
    headers: { 'X-API-KEY': process.env.OPENSTATES_API_KEY ?? '' },
  });
  if (!res.ok) throw new Error(`OpenStates geo error ${res.status}`);
  const data = await res.json();

  return (data.results ?? []).map(person => {
    const ids = person.other_identifiers ?? [];
    const bioguideId = ids.find(i => i.scheme === 'bioguide')?.identifier ?? null;
    const fecId = ids.find(i => i.scheme === 'fec')?.identifier ?? null;

    const jClass = person.jurisdiction?.classification ?? '';
    const level = jClass === 'country' ? 'federal' : jClass === 'state' ? 'state' : 'local';

    // Parse state code from division_id: "ocd-division/country:us/state:ny"
    const divisionId = person.current_role?.division_id ?? '';
    const stateMatch = divisionId.match(/state:([a-z]{2})/);
    const stateCode = stateMatch ? stateMatch[1].toUpperCase() : null;

    return {
      bioguideId,
      fecId,
      openStatesId: person.id ?? null,
      name: person.name ?? 'Unknown',
      party: normalizeParty(person.party ?? ''),
      office: buildOfficeTitle(person),
      level,
      stateCode,
      photoUrl: person.image ?? null,
      website: null,
      votes: null,
      votesDataSource: null,
      finance: null,
      conflict: null,
      influenceScore: null,
      errors: [],
    };
  });
}

function normalizeParty(party) {
  const p = party.toLowerCase();
  if (p.includes('democrat')) return 'D';
  if (p.includes('republican')) return 'R';
  if (p.includes('libertarian')) return 'L';
  if (p.includes('independent') || p.includes('nonpartisan')) return 'I';
  return '?';
}

function buildOfficeTitle(person) {
  const role = person.current_role;
  if (!role) return person.jurisdiction?.name ?? 'Unknown Office';
  const jName = person.jurisdiction?.name ?? '';
  const title = role.title ?? '';
  const district = role.district ?? '';
  if (district && district !== jName) return `${title}, ${district} (${jName})`;
  return `${title}, ${jName}`;
}
