import { getRepresentatives } from '@/lib/civicApi';
import { FALLBACK_REPS } from '@/lib/fallbackReps';

export async function POST(request) {
  try {
    const { address } = await request.json();
    if (!address?.trim()) {
      return Response.json({ error: 'Address is required' }, { status: 400 });
    }
    if (!process.env.OPENSTATES_API_KEY || process.env.OPENSTATES_API_KEY === 'your_openstates_api_key_here') {
      return Response.json({ error: 'OPENSTATES_API_KEY not configured.' }, { status: 503 });
    }
    try {
      const result = await getRepresentatives(address);
      return Response.json(result);
    } catch (err) {
      // OpenStates geo is down — return fallback demo reps so the app still works
      console.error('OpenStates unavailable, using fallback:', err.message);
      return Response.json({
        address,
        reps: FALLBACK_REPS,
        fallback: true,
      });
    }
  } catch (err) {
    console.error('Representatives lookup error:', err);
    return Response.json({ error: err.message || 'Could not look up address' }, { status: 503 });
  }
}
