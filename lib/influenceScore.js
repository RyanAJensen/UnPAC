// Industries where a legislator has direct regulatory power
const HIGH_INFLUENCE_SECTORS = ['Finance', 'Health', 'Energy', 'Defense', 'Agriculture'];

export function computeInfluenceScore(sectors = []) {
  if (sectors.length === 0) return null;

  // Sum the percentage of total donations from high-influence sectors
  // pct is already in 0-100 range (e.g. 38.2 means 38.2%)
  const highInfluenceTotal = sectors
    .filter(s => HIGH_INFLUENCE_SECTORS.some(h => s.sector.toLowerCase().includes(h.toLowerCase())))
    .reduce((sum, s) => sum + s.pct, 0);

  // Concentration bonus: single sector dominating is more concerning
  const topPct = sectors[0]?.pct ?? 0;
  const concentrationBonus = topPct > 50 ? 15 : topPct > 30 ? 8 : 0;

  // Scale: 85% weight on high-influence share, 15% headroom for concentration
  return Math.min(100, Math.round(highInfluenceTotal * 0.85 + concentrationBonus));
}
