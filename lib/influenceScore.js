// Industries where a legislator has direct regulatory power
const HIGH_INFLUENCE_SECTORS = ['Finance', 'Health', 'Energy', 'Defense', 'Agriculture'];

// Map donor sector names → bill categories
const SECTOR_TO_CATEGORY = {
  'health':       'Healthcare',
  'healthcare':   'Healthcare',
  'pharma':       'Healthcare',
  'energy':       'Energy',
  'oil':          'Energy',
  'gas':          'Energy',
  'defense':      'Defense',
  'military':     'Defense',
  'aerospace':    'Defense',
  'education':    'Education',
  'finance':      'Economy',
  'banking':      'Economy',
  'real estate':  'Economy',
  'agriculture':  'Economy',
  'labor':        'Economy',
  'manufacturing':'Economy',
  'construction': 'Economy',
  'insurance':    'Economy',
  'immigration':  'Immigration',
};

/**
 * Legislative Influence Score — how financially captured this legislator is
 * by industries they have regulatory power over.
 *
 * Factors:
 *  1. What fraction of donations come from high-influence regulated industries
 *  2. How concentrated those donations are (HHI-style — one dominant donor = higher risk)
 *
 * Previous version: summed high-influence % × 0.85 + flat concentration bonus.
 * Problem: ignored whether donations were spread across many donors or dominated by one.
 */
export function computeInfluenceScore(sectors = []) {
  if (sectors.length === 0) return null;

  const total = sectors.reduce((sum, s) => sum + s.pct, 0);
  if (total === 0) return null;

  // Fraction from high-influence regulated industries (0–1)
  const highPct = sectors
    .filter(s => HIGH_INFLUENCE_SECTORS.some(h => s.sector.toLowerCase().includes(h.toLowerCase())))
    .reduce((sum, s) => sum + s.pct, 0) / total;

  // Herfindahl-Hirschman Index — measures concentration (0=many equal donors, 1=one donor)
  const hhi = sectors.reduce((sum, s) => sum + Math.pow(s.pct / total, 2), 0);
  const n = sectors.length;
  const minHhi = 1 / n; // theoretical minimum (all sectors equal)
  const normalizedConc = n > 1 ? (hhi - minHhi) / (1 - minHhi) : 1; // 0–1

  // Concentration multiplier: 1.0 (perfectly distributed) → 1.5 (one sector dominates)
  const concMultiplier = 1 + normalizedConc * 0.5;

  return Math.min(100, Math.round(highPct * 100 * concMultiplier));
}

/**
 * Voting Influence Score — how closely this rep's legislative activity
 * aligns with the interests of their top donor industries.
 *
 * Key improvement over previous version:
 *  - Vote DIRECTION matters: sponsoring/voting Yes = pro-industry signal (+)
 *    Voting No = counter-industry signal (−). Previously, all votes counted equally.
 *  - Weighted by vote strength: Sponsored > Cosponsored > Yes > No
 *  - Per-category average normalized before weighting by donor %
 *
 * Score: 0 = consistently votes against donors, 50 = neutral/mixed, 100 = fully aligned
 */
export function computeVotingInfluenceScore(votes = [], sectors = []) {
  if (!votes.length || !sectors.length) return null;

  // Build directional signal per bill category
  // Sponsored=+1.0, Cosponsored=+0.6, Yes=+0.4, No=−0.4, Not Voting=0
  const catSignalSum = {};
  const catCount = {};

  for (const v of votes) {
    const cat = v.category ?? 'Other';
    if (cat === 'Other') continue; // too vague to be meaningful

    let signal = 0;
    if (v.vote === 'Sponsored')   signal = 1.0;
    else if (v.vote === 'Cosponsored') signal = 0.6;
    else if (v.vote === 'Yes')    signal = 0.4;
    else if (v.vote === 'No')     signal = -0.4;
    // Not Voting / Present = 0 (no signal)

    catSignalSum[cat] = (catSignalSum[cat] ?? 0) + signal;
    catCount[cat]     = (catCount[cat] ?? 0) + 1;
  }

  // Normalize each category to an average signal (−1 to +1)
  const catAvg = {};
  for (const cat of Object.keys(catSignalSum)) {
    catAvg[cat] = catSignalSum[cat] / catCount[cat];
  }

  // Weight category signals by donor sector percentages
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

  // Weighted avg alignment: −1 (opposes donors) → 0 (neutral) → +1 (fully aligned)
  const alignment = weightedSum / totalWeight;

  // Map (−1..+1) → (0..100), centered at 50
  return Math.min(100, Math.max(0, Math.round((alignment + 1) / 2 * 100)));
}
