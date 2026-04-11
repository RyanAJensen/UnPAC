export async function GET() {
  return Response.json({
    anthropic_key_length: process.env.ANTHROPIC_API_KEY?.trim()?.length ?? 0,
    anthropic_key_prefix: process.env.ANTHROPIC_API_KEY?.trim()?.slice(0, 10) ?? '(missing)',
    openstates_key_set: !!process.env.OPENSTATES_API_KEY?.trim(),
    congress_key_set: !!process.env.CONGRESS_API_KEY?.trim(),
  });
}
