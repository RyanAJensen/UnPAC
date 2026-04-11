import RepDetailPanel from '@/components/RepDetailPanel';
import { getMemberDetail } from '@/lib/congressApi';

export default async function RepPage({ params }) {
  const { bioguide_id } = await params;

  // Try to get basic info server-side for SEO / initial render
  let repStub = {
    bioguideId: bioguide_id,
    name: 'Loading...',
    party: '?',
    office: 'U.S. Congress',
    level: 'federal',
    stateCode: null,
    photoUrl: null,
    website: null,
  };

  try {
    if (process.env.CONGRESS_API_KEY && process.env.CONGRESS_API_KEY !== 'your_congress_api_key_here') {
      const member = await getMemberDetail(bioguide_id);
      repStub = {
        ...repStub,
        name: member.name ?? repStub.name,
        party: member.party ?? '?',
        photoUrl: member.photoUrl,
        website: member.website,
      };
    }
  } catch { /* stub will be used */ }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <a href="/" className="text-sm text-indigo-600 hover:text-indigo-800 mb-6 flex items-center gap-1">
          ← RepWatch Home
        </a>
        <RepDetailPanel rep={repStub} />
      </div>
    </main>
  );
}
