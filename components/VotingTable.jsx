import DataGapBanner from './DataGapBanner';

const CATEGORY_COLORS = {
  Healthcare:  'bg-pink-100 text-pink-800',
  Environment: 'bg-green-100 text-green-800',
  Economy:     'bg-blue-100 text-blue-800',
  Defense:     'bg-slate-100 text-slate-800',
  Immigration: 'bg-orange-100 text-orange-800',
  Education:   'bg-purple-100 text-purple-800',
  Energy:      'bg-yellow-100 text-yellow-800',
  Other:       'bg-gray-100 text-gray-600',
};

const VOTE_STYLES = {
  Sponsored:   'text-indigo-700 font-semibold',
  Yes:         'text-green-700 font-semibold',
  No:          'text-red-700 font-semibold',
  'Not Voting':'text-gray-400',
  Present:     'text-gray-500',
};

export default function VotingTable({ votes, dataSource }) {
  if (!votes || votes.length === 0) {
    return <DataGapBanner source="Voting/sponsorship" reason="no data available from this source" />;
  }

  // Group by category for summary pills
  const categories = [...new Set(votes.map(v => v.category))];

  return (
    <div>
      {/* Category summary */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {categories.map(cat => (
          <span key={cat} className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.Other}`}>
            {cat} ({votes.filter(v => v.category === cat).length})
          </span>
        ))}
      </div>

      {/* Bill table */}
      <div className="divide-y divide-gray-100">
        {votes.map((v, i) => (
          <div key={i} className="py-2.5 flex items-start gap-3">
            <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded font-medium mt-0.5 ${CATEGORY_COLORS[v.category] ?? CATEGORY_COLORS.Other}`}>
              {v.category}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 leading-snug truncate">{v.billTitle}</p>
              {v.date && <p className="text-xs text-gray-400 mt-0.5">{v.date}</p>}
            </div>
            <span className={`shrink-0 text-xs ${VOTE_STYLES[v.vote] ?? 'text-gray-500'}`}>
              {v.vote}
            </span>
          </div>
        ))}
      </div>

      {dataSource && (
        <p className="text-xs text-gray-400 mt-3">
          Source: {dataSource === 'congress.gov' ? 'Congress.gov (sponsored legislation)' : 'OpenStates (sponsored bills)'}
        </p>
      )}
    </div>
  );
}
