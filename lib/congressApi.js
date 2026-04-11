/**
 * Congress.gov API v3
 * Sign up: https://api.congress.gov/sign-up/
 */

const BASE = 'https://api.congress.gov/v3';

async function congressFetch(path) {
  const sep = path.includes('?') ? '&' : '?';
  const key = process.env.CONGRESS_API_KEY;
  const effectiveKey = (key && key !== 'your_congress_api_key_here') ? key : 'DEMO_KEY';
  const keyParam = `&api_key=${effectiveKey}`;
  const url = `${BASE}${path}${sep}format=json${keyParam}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Congress.gov API error ${res.status}: ${path}`);
  return res.json();
}

export async function getMemberDetail(bioguideId) {
  const data = await congressFetch(`/member/${bioguideId}`);
  const m = data.member ?? {};
  // Use the LAST term to get current chamber (terms are chronological, oldest first)
  const terms = Array.isArray(m.terms?.item) ? m.terms.item
              : m.terms?.item ? [m.terms.item] : [];
  const currentTerm = terms.at(-1) ?? {};
  const chamberRaw = currentTerm.chamber ?? '';
  const chamber = chamberRaw.toLowerCase().includes('senate') ? 'senate'
                : chamberRaw.toLowerCase().includes('house')  ? 'house'
                : null;
  return {
    bioguideId,
    name: m.directOrderName ?? m.invertedOrderName ?? null,
    party: m.partyHistory?.[0]?.partyAbbreviation ?? null,
    state: m.state ?? null,
    photoUrl: m.depiction?.imageUrl ?? null,
    website: m.officialWebsiteUrl ?? null,
    currentRole: currentTerm,
    chamber,
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
// Landmark votes — official House Clerk XML + Senate.gov XML
// ============================================================

/**
 * Landmark bills to look up for every federal member.
 * houseOnly: true means this bill was only voted on in the House (e.g. impeachments).
 */
const LANDMARK_BILLS = [
  { displayName: 'CHIPS and Science Act',               congress: 117, type: 'hr',   number: 4346, category: 'Economy', date: '2022-07-28' },
  // Ukraine Aid is the base bill that became the Senate's combined foreign-aid vehicle.
  // Its actions contain both the House passage vote and the Senate passage vote.
  { displayName: 'Ukraine Aid Supplemental (2024)',      congress: 118, type: 'hr',   number: 8035, category: 'Defense', date: '2024-04-20' },
  { displayName: 'Big Beautiful Bill',                  congress: 119, type: 'hr',   number: 1,    category: 'Economy', date: '2025-05-22' },
  // Israel Aid (H.R.8034) and Taiwan Aid (H.R.8036) each passed the House separately,
  // but the Senate never voted on them as stand-alone bills — it voted on a single
  // combined package carried by H.R.8035.  For Senate members we must look up the
  // Senate recorded vote under H.R.8035 (senatePackage), not the individual bill.
  { displayName: 'Israel Aid Supplemental (2024)',       congress: 118, type: 'hr',   number: 8034, category: 'Defense', date: '2024-04-20',
    senatePackage: { congress: 118, type: 'hr', number: 8035 } },
  { displayName: 'Taiwan Aid Supplemental (2024)',       congress: 118, type: 'hr',   number: 8036, category: 'Defense', date: '2024-04-20',
    senatePackage: { congress: 118, type: 'hr', number: 8035 } },
  { displayName: 'Impeachment of Trump (Jan. 6, 2021)', congress: 117, type: 'hres', number: 24,   category: 'Other',  date: '2021-01-13', houseOnly: true },
  { displayName: 'Impeachment of Trump (Ukraine, 2019)', congress: 116, type: 'hres', number: 755,  category: 'Other',  date: '2019-12-18', houseOnly: true },
];

// Module-level caches — persist within a Node.js server instance
const _rollCallUrlCache = new Map(); // "congress/type/number" → [{chamber, url, date, actionText}]
const _xmlCache = new Map();         // url → xml string | null

/**
 * Fetch Congress.gov bill actions and extract all recorded vote URLs.
 * Returns [{ chamber: 'house'|'senate', url, date, actionText }]
 */
async function getBillRecordedVoteUrls(congress, type, number) {
  const key = `${congress}/${type}/${number}`;
  if (_rollCallUrlCache.has(key)) return _rollCallUrlCache.get(key);

  try {
    const data = await congressFetch(`/bill/${congress}/${type}/${number}/actions?limit=250`);
    const actions = data.actions ?? [];
    const votes = [];
    for (const action of actions) {
      if (!action.recordedVotes?.length) continue;
      for (const rv of action.recordedVotes) {
        if (!rv.url) continue;
        const chamber = rv.chamber?.toLowerCase().includes('senate') ? 'senate' : 'house';
        votes.push({
          chamber,
          url: rv.url,
          date: rv.date?.split('T')[0] ?? null,
          actionText: action.text ?? '',
        });
      }
    }
    _rollCallUrlCache.set(key, votes);
    return votes;
  } catch {
    _rollCallUrlCache.set(key, []);
    return [];
  }
}

async function fetchXml(url) {
  if (_xmlCache.has(url)) return _xmlCache.get(url);
  try {
    const res = await fetch(url, { headers: { Accept: 'text/xml,application/xml,*/*' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    _xmlCache.set(url, text);
    return text;
  } catch {
    _xmlCache.set(url, null);
    return null;
  }
}

/**
 * Parse House Clerk XML (clerk.house.gov) to find how bioguideId voted.
 * Matches on the bioguid attribute of the <legislator> element.
 *
 * Example block:
 *   <recorded-vote>
 *     <legislator bioguid="S000033" ...>Sanders</legislator>
 *     <vote>Yea</vote>
 *   </recorded-vote>
 */
function parseHouseClerkXml(xml, bioguideId) {
  const blockRe = /<recorded-vote>([\s\S]*?)<\/recorded-vote>/g;
  let m;
  while ((m = blockRe.exec(xml)) !== null) {
    const block = m[1];
    if (block.includes(`bioguid="${bioguideId}"`)) {
      const vm = block.match(/<vote>(.*?)<\/vote>/);
      if (vm) return normalizePosition(vm[1].trim());
    }
  }
  return null;
}

/**
 * Parse Senate.gov LIS XML to find how bioguideId voted.
 * Primary match: <bioguide_id> element inside each <member> block.
 * Fallback match: <last_name> + <state> (for older XML that may lack bioguide_id).
 *
 * Example block:
 *   <member>
 *     <bioguide_id>S000033</bioguide_id>
 *     <last_name>Sanders</last_name>
 *     <state>VT</state>
 *     <vote_cast>Yea</vote_cast>
 *   </member>
 */
function parseSenateXml(xml, bioguideId, lastName, stateCode) {
  const blockRe = /<member>([\s\S]*?)<\/member>/g;
  let m;
  while ((m = blockRe.exec(xml)) !== null) {
    const block = m[1];

    // Primary: match by bioguide_id
    const bioM = block.match(/<bioguide_id>(.*?)<\/bioguide_id>/);
    if (bioM && bioM[1].trim().toUpperCase() === bioguideId.toUpperCase()) {
      const vm = block.match(/<vote_cast>(.*?)<\/vote_cast>/);
      if (vm) return normalizePosition(vm[1].trim());
    }

    // Fallback: match by last name + state abbreviation
    if (lastName && stateCode) {
      const lnM  = block.match(/<last_name>(.*?)<\/last_name>/);
      const stM  = block.match(/<state>(.*?)<\/state>/);
      if (lnM && stM &&
          lnM[1].trim().toLowerCase() === lastName.toLowerCase() &&
          stM[1].trim().toUpperCase() === stateCode.toUpperCase()) {
        const vm = block.match(/<vote_cast>(.*?)<\/vote_cast>/);
        if (vm) return normalizePosition(vm[1].trim());
      }
    }
  }
  return null;
}

/**
 * Look up how one member voted on one landmark bill.
 * Returns { position, date } or null if the member was not present / bill doesn't apply.
 */
async function getMemberPositionOnLandmark(bill, bioguideId, chamber, lastName, stateCode) {
  // Impeachments only happen in the House
  if (bill.houseOnly && chamber === 'senate') return null;

  // For bills where the Senate voted on a combined package vehicle rather than the
  // individual bill, look up recorded votes under the package bill for Senate members.
  const lookupBill = (chamber === 'senate' && bill.senatePackage) ? bill.senatePackage : bill;

  const allVoteUrls = await getBillRecordedVoteUrls(lookupBill.congress, lookupBill.type, lookupBill.number);

  // Filter to this member's chamber
  const chamberVotes = allVoteUrls.filter(v => v.chamber === chamber);
  if (chamberVotes.length === 0) return null;

  // Prefer final-passage votes; fall back to the last roll call in this chamber
  const passageVotes = chamberVotes.filter(v => /passage|passed|impeach/i.test(v.actionText));
  const target = passageVotes.at(-1) ?? chamberVotes.at(-1);

  const xml = await fetchXml(target.url);
  if (!xml) return null;

  const position = chamber === 'senate'
    ? parseSenateXml(xml, bioguideId, lastName, stateCode)
    : parseHouseClerkXml(xml, bioguideId);

  if (!position) return null;
  return { position, date: target.date ?? bill.date };
}

/**
 * Fetch how a federal member voted on all landmark bills.
 *
 * @param {{ bioguideId: string, chamber: 'house'|'senate'|null, lastName?: string, state?: string }} opts
 * @returns {Promise<Array>}
 */
export async function getLandmarkVotes({ bioguideId, chamber, lastName = '', state = '' }) {
  if (!chamber) return [];

  const results = await Promise.allSettled(
    LANDMARK_BILLS.map(async (bill) => {
      const result = await getMemberPositionOnLandmark(bill, bioguideId, chamber, lastName, state);
      if (!result) return null;
      return {
        billTitle:  bill.displayName,
        category:   bill.category,
        date:       result.date,
        position:   result.position,
        isLandmark: true,
      };
    })
  );

  return results
    .filter(r => r.status === 'fulfilled' && r.value !== null)
    .map(r => r.value);
}

// ============================================================
// Recent floor votes — GovTrack (non-landmark, best-effort)
// ============================================================

/**
 * Fetch the 20 most recent general floor votes via GovTrack.
 * These are supplementary; landmark accuracy comes from official XML above.
 */
export async function getRecentFloorVotes(bioguideId) {
  try {
    const personRes = await fetch(
      `https://www.govtrack.us/api/v2/person?bioguideid=${bioguideId}&format=json`
    );
    if (!personRes.ok) return [];
    const personData = await personRes.json();
    const govtrackId = personData.objects?.[0]?.id;
    if (!govtrackId) return [];

    const voteRes = await fetch(
      `https://www.govtrack.us/api/v2/vote_voter?person=${govtrackId}&limit=20&order_by=-created&format=json`
    );
    if (!voteRes.ok) return [];
    const voteData = await voteRes.json();

    return (voteData.objects ?? []).map(vv => ({
      billTitle:  vv.vote?.related_bill?.title ?? vv.vote?.question ?? 'Floor Vote',
      date:       vv.created?.split('T')[0] ?? null,
      position:   normalizePosition(vv.option?.value ?? ''),
      isLandmark: false,
    }));
  } catch {
    return [];
  }
}

function normalizePosition(value) {
  const v = value.toLowerCase();
  if (v === 'yea' || v === 'yes' || v === 'aye') return 'Yes';
  if (v === 'nay' || v === 'no') return 'No';
  if (v.includes('not voting') || v.includes('absent')) return 'Not Voting';
  if (v === 'present') return 'Present';
  return value;
}
