// Industries where a legislator has direct regulatory power
const HIGH_INFLUENCE_SECTORS = ['Finance', 'Health', 'Energy', 'Defense', 'Agriculture'];

// Map donor sector names → bill categories
const SECTOR_TO_CATEGORY = {
  'health':       'Healthcare',
  'healthcare':   'Healthcare',
  'energy':       'Energy',
  'oil':          'Energy',
  'defense':      'Defense',
  'military':     'Defense',
  'education':    'Education',
  'immigration':  'Immigration',
  'finance':      'Economy',
  'banking':      'Economy',
  'real estate':  'Economy',
  'technology':   'Economy',
  'agriculture':  'Economy',
  'labor':        'Economy',
  'manufacturing':'Economy',
  'construction': 'Economy',
  'legal':        'Economy',
};

/**
 * Legislative Influence Score — how concentrated funding is in
 * industries the legislator has regulatory power over.
 */
export function computeInfluenceScore(sectors = []) {
  if (sectors.length === 0) return null;

  const highInfluenceTotal = sectors
    .filter(s => HIGH_INFLUENCE_SECTORS.some(h => s.sector.toLowerCase().includes(h.toLowerCase())))
    .reduce((sum, s) => sum + s.pct, 0);

  const topPct = sectors[0]?.pct ?? 0;
  const concentrationBonus = topPct > 50 ? 15 : topPct > 30 ? 8 : 0;

  return Math.min(100, Math.round(highInfluenceTotal * 0.85 + concentrationBonus));
}

/**
 * Voting Influence Score — how much of the rep's sponsored legislation
 * aligns with the categories of their top donor industries.
 * 0 = no alignment, 100 = all legislation serves donor interests.
 */
export function computeVotingInfluenceScore(votes = [], sectors = []) {
  if (!votes.length || !sectors.length) return null;

  // Count bills per category
  const billsByCat = {};
  votes.forEach(v => {
    const cat = v.category ?? 'Other';
    billsByCat[cat] = (billsByCat[cat] ?? 0) + 1;
  });
  const totalBills = votes.length;

  let weightedAlignment = 0;
  let totalWeight = 0;

  sectors.forEach(s => {
    const sectorLower = s.sector.toLowerCase();
    // Find the first matching category for this sector
    const mappedCat = Object.entries(SECTOR_TO_CATEGORY).find(
      ([key]) => sectorLower.includes(key)
    )?.[1];
    if (!mappedCat) return;

    const billsInCat = billsByCat[mappedCat] ?? 0;
    const alignment = billsInCat / totalBills; // 0–1
    weightedAlignment += alignment * s.pct;
    totalWeight += s.pct;
  });

  if (totalWeight === 0) return null;

  // Raw: weighted average alignment fraction × 100 (e.g. 27 means 27%)
  // Scale ×2.5 so moderate alignment (~27%) reads as ~67 (moderate risk band)
  const raw = (weightedAlignment / totalWeight) * 100;
  return Math.min(100, Math.round(raw * 2.5));
}
