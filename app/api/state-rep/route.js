import { findStateLegislator, getSponsoredBills, getCosponsoredBills } from '@/lib/openStatesApi';
import { categorize } from '@/lib/voteCategories';
import { generateMockForRep, MOCK_OPENSTATES_BILLS, MOCK_OPENSTATES_COSPONSORED } from '@/lib/mockData';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') ?? '';
  const state = searchParams.get('state') ?? '';
  const openStatesIdParam = searchParams.get('openStatesId') ?? null;

  if (!name && !openStatesIdParam) {
    return Response.json({ error: 'name or openStatesId is required' }, { status: 400 });
  }

  const useMock = !process.env.OPENSTATES_API_KEY || process.env.OPENSTATES_API_KEY === 'your_openstates_api_key_here';
  if (useMock) {
    return Response.json({
      openStatesId: openStatesIdParam,
      // State reps don't vote on federal landmark bills — suppress them
      votes: buildVotes(MOCK_OPENSTATES_BILLS, MOCK_OPENSTATES_COSPONSORED),
      votesDataSource: 'openstates',
      errors: [{ source: 'openstates', message: 'Using mock data — set OPENSTATES_API_KEY' }],
    });
  }

  const errors = [];
  let openStatesId = openStatesIdParam;
  let votes = null;

  try {
    if (!openStatesId) {
      const person = await findStateLegislator(name, state);
      if (!person) {
        return Response.json({
          openStatesId: null,
          votes: [],
          votesDataSource: null,
          errors: [{ source: 'openstates', message: `Could not find "${name}" in ${state}` }],
        });
      }
      openStatesId = person.id;
    }

    // Fetch sponsored and cosponsored bills in parallel
    const [sponsored, cosponsored] = await Promise.all([
      getSponsoredBills(openStatesId),
      getCosponsoredBills(openStatesId).catch(() => []),
    ]);

    if (sponsored.length === 0 && cosponsored.length === 0) {
      errors.push({ source: 'openstates', message: 'No bills found — showing representative sample' });
      // State reps don't vote on federal landmark bills
      votes = generateMockForRep(openStatesId, { includeLandmark: false }).bills;
    } else {
      votes = buildVotes(sponsored, cosponsored);
    }
  } catch (err) {
    errors.push({ source: 'openstates', message: err.message });
    // State reps don't vote on federal landmark bills
    votes = generateMockForRep(openStatesIdParam ?? name, { includeLandmark: false }).bills;
  }

  return Response.json({ openStatesId, votes, votesDataSource: 'openstates', errors });
}

/**
 * Weights:
 *   Sponsored   = 1.0  (primary author)
 *   Cosponsored = 0.5  (explicit support, lesser initiative)
 */
function buildVotes(sponsored, cosponsored = []) {
  const sponsoredEntries = sponsored.map(b => ({
    billId:    b.identifier ?? b.billId ?? '',
    billTitle: b.title ?? b.billTitle ?? 'Untitled',
    category:  categorize(b.title ?? b.billTitle ?? ''),
    vote:      'Sponsored',
    weight:    1.0,
    date:      b.first_action_date ?? b.date ?? null,
  }));

  const cosponsoredEntries = cosponsored.map(b => ({
    billId:    b.identifier ?? b.billId ?? '',
    billTitle: b.title ?? b.billTitle ?? 'Untitled',
    category:  categorize(b.title ?? b.billTitle ?? ''),
    vote:      'Cosponsored',
    weight:    0.5,
    date:      b.first_action_date ?? b.date ?? null,
  }));

  return [
    ...sponsoredEntries,
    ...cosponsoredEntries,
  ].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
}
