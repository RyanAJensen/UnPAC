import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request) {
  try {
    const { repName, votes, finance } = await request.json();

    if (!votes?.length) {
      return Response.json({ error: 'votes are required' }, { status: 400 });
    }

    const hasSectors = finance?.sectors?.length > 0;

    const sectorsText = hasSectors
      ? finance.sectors.slice(0, 8).map(s => `- ${s.sector}: $${s.amount.toLocaleString()} (${s.pct}%)`).join('\n')
      : '(No campaign finance data available for this representative)';

    const votesText = votes.slice(0, 20)
      .map(v => `- [${v.category}] ${v.date ?? 'n/d'}: "${v.billTitle}" — ${v.vote}`)
      .join('\n');

    const donorInstruction = hasSectors
      ? 'Identify factual misalignments between a legislator\'s voting/sponsorship record and their campaign donor industries. Only flag conflicts you can tie to specific legislation AND specific donor sectors.'
      : 'Analyze this legislator\'s voting/sponsorship record for notable patterns, ideological consistency, or policy priorities. Note that no donor data is available.';

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
