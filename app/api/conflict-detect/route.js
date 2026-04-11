import Anthropic from '@anthropic-ai/sdk';

export async function POST(request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (!apiKey) {
      return Response.json({ error: 'ANTHROPIC_API_KEY not configured — restart the dev server after editing .env.local' }, { status: 503 });
    }
    const client = new Anthropic({ apiKey });
    const { repName, votes, finance } = await request.json();

    if (!votes?.length) {
      return Response.json({ error: 'votes are required' }, { status: 400 });
    }

    const hasSectors = finance?.sectors?.length > 0;

    const sectorsText = hasSectors
      ? finance.sectors.slice(0, 8).map(s => `- ${s.sector}: $${s.amount.toLocaleString()} (${s.pct}%)`).join('\n')
      : '(No campaign finance data available for this representative)';

    // Sort by weight descending so the strongest signals appear first in the prompt
    const sortedVotes = [...votes].sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
    const votesText = sortedVotes.slice(0, 30)
      .map(v => {
        const weightLabel =
          v.vote === 'Sponsored'   ? '★★★ Sponsored'   :
          v.vote === 'Cosponsored' ? '★★  Cosponsored' :
          v.vote === 'Yes'         ? '★   Voted Yes'    :
          v.vote === 'No'          ? '★   Voted No'     :
                                     '·   ' + (v.vote ?? 'Unknown');
        return `- [${v.category}] ${v.date ?? 'n/d'}: "${v.billTitle}" — ${weightLabel}`;
      })
      .join('\n');

    const donorInstruction = hasSectors
      ? 'Identify factual misalignments between a legislator\'s legislative record and their campaign donor industries. Records are weighted: Sponsored bills (★★★) carry the most weight, Cosponsored (★★) less so, and floor votes (★) the least — weight this accordingly when assessing conflicts. Only flag conflicts you can tie to specific legislation AND specific donor sectors.'
      : 'Analyze this legislator\'s legislative record for notable patterns, ideological consistency, or policy priorities. Records are weighted: Sponsored (★★★) > Cosponsored (★★) > floor votes (★). Note that no donor data is available.';

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 768,
      messages: [{
        role: 'user',
        content: `You are a nonpartisan political analyst. ${donorInstruction} Do not express political opinions.

LEGISLATOR: ${repName}

TOP DONOR SECTORS (2024 cycle):
${sectorsText}

LEGISLATIVE RECORD:
${votesText}

Return ONLY this JSON object (no markdown, no explanation):
{
  "overallTension": "High" or "Medium" or "Low" or "None",
  "summary": "<2-3 plain English sentences for a general audience>",
  "conflicts": [
    {
      "donorIndustry": "<sector name or policy area>",
      "relevantVotes": ["<bill title>"],
      "tension": "Supports donors" or "Votes against donors" or "Mixed" or "Notable pattern",
      "explanation": "<one specific sentence>"
    }
  ]
}`,
      }],
    });

    const text = response.content[0].text.trim().replace(/^```json?\n?/, '').replace(/\n?```$/, '');
    const report = JSON.parse(text);
    return Response.json(report);
  } catch (err) {
    console.error('Conflict detect error:', err);
    return Response.json({ error: err.message || 'Analysis failed' }, { status: 500 });
  }
}
