// All industries with meaningful legislative interests (broader than before)
const HIGH_INFLUENCE_SECTORS = [
  'Finance', 'Health', 'Healthcare', 'Energy', 'Defense', 'Agriculture',
  'Technology', 'Legal', 'Real Estate', 'Insurance', 'Manufacturing',
  'Labor', 'Media', 'Transportation', 'Construction',
];

// Map donor sector names → bill categories
// Kept intentionally specific — broad catch-alls inflate the voting score artificially
const SECTOR_TO_CATEGORY = {
  'health':        'Healthcare',
  'healthcare':    'Healthcare',
  'pharma':        'Healthcare',
  'hospital':      'Healthcare',
  'energy':        'Energy',
  'oil':           'Energy',
  'gas':           'Energy',
  'electric':      'Energy',
  'utility':       'Energy',
  'defense':       'Defense',
  'military':      'Defense',
  'aerospace':     'Defense',
  'education':     'Education',
  'immigration':   'Immigration',
  'finance':       'Economy',
  'banking':       'Economy',
  'real estate':   'Economy',
  'agriculture':   'Economy',
  'manufacturing': 'Economy',
  'construction':  'Economy',
  'insurance':     'Economy',
  // Intentionally NOT mapping: Legal, Technology, Labor, Media, PAC/Dark Money
  // These are too broad to reliably predict a specific bill category
};

/**
 * Legislative Influence Score — how financially captured this legislator is
 * by industries with active legislative interests.
 *
 * Uses HHI-style concentration: a rep dominated by one sector scores higher
 * than one with the same total but spread across many donors.
 *
 * Range: 0 (clean/distributed) → 100 (heavily concentrated in one industry)
 */
export function computeInfluenceScore(sectors = []) {
  if (sectors.length === 0) return null;

  const total = sectors.reduce((sum, s) => sum + s.pct, 0);
  if (total === 0) return null;

  // Fraction from industries with regulatory exposure (0–1)
  const highPct = sectors
    .filter(s => HIGH_INFLUENCE_SECTORS.some(
      h => s.sector.toLowerCase().includes(h.toLowerCase())
    ))
    .reduce((sum, s) => sum + s.pct, 0) / total;

  // HHI concentration across ALL sectors (0=many equal donors, 1=one dominates)
  const hhi = sectors.reduce((sum, s) => sum + Math.pow(s.pct / total, 2), 0);
  const n = sectors.length;
  const minHhi = 1 / n;
  const normalizedConc = n > 1 ? (hhi - minHhi) / (1 - minHhi) : 1; // 0–1

  // Concentration multiplier: 1.0 (distributed) → 1.6 (one sector dominates)
  const concMultiplier = 1 + normalizedConc * 0.6;

  // Apply a power curve to push mid-range scores higher (x^0.6 expands the middle)
  const raw = highPct * 100 * concMultiplier;
  return Math.min(100, Math.round(Math.pow(raw / 100, 0.6) * 100));
}

/**
 * Voting Influence Score — do this rep's votes align with their donor industries?
 *
 * Signal weights (floor votes are primary, sponsorships are supporting):
 *   Yes        = +1.0  (voted for the bill)
 *   No         = −1.0  (voted against)
 *   Sponsored  = +0.4  (intent signal, not a floor vote)
 *   Cosponsored= +0.2  (weaker intent signal)
 *   Not Voting = 0     (no directional info)
 *
 * Score: 0 = consistently votes against donor interests
 *        50 = neutral or no clear pattern
 *        100 = consistently votes in favor of donor interests
 */
export function computeVotingInfluenceScore(votes = [], sectors = []) {
  if (!votes.length || !sectors.length) return null;

  const catSignalSum = {};
  const catWeight = {};

  for (const v of votes) {
    const cat = v.category ?? 'Other';
    if (cat === 'Other') continue;

    let signal = 0;
    let weight = 1;
    if (v.vote === 'Yes')         { signal = 1.0;  weight = 1.0; }
    else if (v.vote === 'No')     { signal = -1.0; weight = 1.0; }
    else if (v.vote === 'Sponsored')   { signal = 0.4; weight = 0.4; }
    else if (v.vote === 'Cosponsored') { signal = 0.2; weight = 0.2; }
    else continue; // Not Voting / Present — no directional info

    catSignalSum[cat] = (catSignalSum[cat] ?? 0) + signal * weight;
    catWeight[cat]    = (catWeight[cat] ?? 0) + weight;
  }

  if (Object.keys(catSignalSum).length === 0) return null;

  // Weighted average signal per category (−1 to +1)
  const catAvg = {};
  for (const cat of Object.keys(catSignalSum)) {
    catAvg[cat] = catSignalSum[cat] / catWeight[cat];
  }

  // Weight category alignments by donor sector percentage
  let weightedSum = 0;
  let totalWeight = 0;

  for (const s of sectors) {
    const sectorLower = s.sector.toLowerCase();
    const mappedCat = Object.entries(SECTOR_TO_CATEGORY).find(
      ([key]) => sectorLower.includes(key)
    )?.[1];

    if (!mappedCat || catAvg[mappedCat] === undefined) continue;

    weightedSum += catAvg[mappedCat] * s.pct;
    totalWeight += s.pct;
  }

  if (totalWeight === 0) return null;

  // Weighted alignment: −1 (opposes donors) → 0 (neutral) → +1 (aligned)
  const alignment = weightedSum / totalWeight;

  // Map (−1..+1) → (0..100), centered at 50
  return Math.min(100, Math.max(0, Math.round((alignment + 1) / 2 * 100)));
}
