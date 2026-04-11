const HIGH_INFLUENCE_SECTORS = ['Finance', 'Health', 'Energy', 'Defense', 'Agriculture'];

export function computeInfluenceScore(sectors = []) {
  if (sectors.length === 0) return null;

  let score = 0;
  for (const s of sectors.slice(0, 5)) {
    if (HIGH_INFLUENCE_SECTORS.some(h => s.sector.toLowerCase().includes(h.toLowerCase()))) {
      score += s.pct * 1.5;
    } else {
      score += s.pct * 0.5;
    }
  }

  // Concentration penalty: top sector > 30% = more concerning
  if (sectors[0]?.pct > 30) score += 20;

  return Math.min(100, Math.round(score));
}
