import { findStateLegislator, getSponsoredBills } from '@/lib/openStatesApi';
import { categorize } from '@/lib/voteCategories';
import { MOCK_OPENSTATES_BILLS } from '@/lib/mockData';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') ?? '';
  const state = searchParams.get('state') ?? '';

  if (!name || !state) {
    return Response.json({ error: 'name and state are required' }, { status: 400 });
  }

  const useMock = !process.env.OPENSTATES_API_KEY || process.env.OPENSTATES_API_KEY === 'your_openstates_api_key_here';
  if (useMock) {
    return Response.json({
      openStatesId: null,
      votes: buildVotes(MOCK_OPENSTATES_BILLS),
      votesDataSource: 'openstates',
      errors: [{ source: 'openstates', message: 'Using mock data — set OPENSTATES_API_KEY' }],
    });
  }

  const errors = [];
  let openStatesId = null;
  let votes = null;

  try {
    const person = await findStateLegislator(name, state);
    if (!person) {
      return Response.json({
        openStatesId: null,
        votes: null,
        votesDataSource: null,
        errors: [{ source: 'openstates', message: `Could not find "${name}" in ${state}` }],
      });
    }
    openStatesId = person.id;
    const bills = await getSponsoredBills(person.id);
    votes = buildVotes(bills);
  } catch (err) {
    errors.push({ source: 'openstates', message: err.message });
    votes = buildVotes(MOCK_OPENSTATES_BILLS);
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
