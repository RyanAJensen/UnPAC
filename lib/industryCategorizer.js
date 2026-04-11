import Anthropic from '@anthropic-ai/sdk';

export async function categorizeEmployers(contributions) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY?.trim() });
  if (contributions.length === 0) return {};

  // Get unique non-empty employers
  const employers = [...new Set(
    contributions
      .map(c => c.employer)
      .filter(e => e && e.trim().length > 0)
  )].slice(0, 60);

  if (employers.length === 0) return {};

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Categorize each employer name into exactly one industry sector. Return ONLY a JSON object mapping employer name to sector.

Sector options: Finance, Health, Energy, Defense, Technology, Legal, Real Estate, Agriculture, Media, Other

Employers to categorize:
${employers.join('\n')}

Return ONLY the JSON object, no explanation. Example:
{"Goldman Sachs": "Finance", "Pfizer": "Health"}`,
    }],
  });

  const text = response.content[0].text.trim().replace(/^```json?\n?/, '').replace(/\n?```$/, '');
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export function aggregateBySector(contributions, employerToSector) {
  const sectorTotals = {};
  let totalAmount = 0;

  for (const c of contributions) {
    const sector = employerToSector[c.employer] ?? (c.isPAC || c.isSuperPAC ? 'PAC/Dark Money' : 'Other');
    sectorTotals[sector] = (sectorTotals[sector] ?? 0) + c.amount;
    totalAmount += c.amount;
  }

  if (totalAmount === 0) return [];

  return Object.entries(sectorTotals)
    .map(([sector, amount]) => ({
      sector,
      amount,
      pct: Math.round((amount / totalAmount) * 1000) / 10,
    }))
    .sort((a, b) => b.amount - a.amount);
}
