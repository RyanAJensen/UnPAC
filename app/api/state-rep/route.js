import { findStateLegislator, getSponsoredBills } from '@/lib/openStatesApi';
import { categorize } from '@/lib/voteCategories';
import { generateMockForRep } from '@/lib/mockData';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') ?? '';
  const state = searchParams.get('state') ?? '';
  // openStatesId is passed directly from the geo lookup — skip the name search if present
  const openStatesIdParam = searchParams.get('openStatesId') ?? null;

  if (!name && !openStatesIdParam) {
    return Response.json({ error: 'name or openStatesId is required' }, { status: 400 });
  }

  const errors = [];
  let openStatesId = openStatesIdParam;
  let votes = null;

  try {
    // If we don't already have the ID, look it up by name
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

    const bills = await getSponsoredBills(openStatesId);
    if (bills.length === 0) {
      errors.push({ source: 'openstates', message: 'No sponsored bills found — showing representative sample' });
      votes = generateMockForRep(openStatesId).bills;
    } else {
      votes = buildVotes(bills);
    }
  } catch (err) {
    errors.push({ source: 'openstates', message: err.message });
    votes = generateMockForRep(openStatesIdParam ?? name).bills;
  }

  return Response.json({ openStatesId, votes, votesDataSource: 'openstates', errors });
}

function buildVotes(bills) {
  return bills.map(b => ({
    billId: b.identifier ?? b.billId ?? '',
    billTitle: b.title ?? b.billTitle ?? 'Untitled',
    category: categorize(b.title ?? b.billTitle ?? ''),
    vote: 'Sponsored',
    date: b.first_action_date ?? b.date ?? null,
    description: null,
  }));
}
