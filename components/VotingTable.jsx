import DataGapBanner from './DataGapBanner';

const CATEGORY_COLORS = {
  Healthcare:  'bg-pink-50   text-pink-700   border-pink-200',
  Environment: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Economy:     'bg-blue-50   text-blue-700   border-blue-200',
  Defense:     'bg-slate-50  text-slate-700  border-slate-200',
  Immigration: 'bg-orange-50 text-orange-700 border-orange-200',
  Education:   'bg-purple-50 text-purple-700 border-purple-200',
  Energy:      'bg-yellow-50 text-yellow-700 border-yellow-200',
  Other:       'bg-gray-50   text-gray-600   border-gray-200',
};

const VOTE_STYLES = {
  Sponsored:    'text-navy-700 font-bold',
  Cosponsored:  'text-blue-700 font-semibold',
  Yes:          'text-green-700 font-semibold',
  No:           'text-red-700 font-semibold',
  'Not Voting': 'text-gray-400',
  Present:      'text-gray-500',
};

export default function VotingTable({ votes, dataSource }) {
  if (!votes || votes.length === 0) {
    return (
      <DataGapBanner
        source="Voting/sponsorship"
        reason="no data available from this source"
      />
    );
  }

  const categories = [...new Set(votes.map(v => v.category))];

  return (
    <div>
      {/* Category pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {categories.map(cat => (
          <span
            key={cat}
            className={`text-xs px-2 py-0.5 rounded-full font-medium border ${CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.Other}`}
          >
            {cat} ({votes.filter(v => v.category === cat).length})
          </span>
        ))}
      </div>

      {/* Bill rows */}
      <div className="divide-y divide-gray-100">
        {votes.map((v, i) => (
          <div key={i} className="py-3 flex items-start gap-3">
            <span
              className={`shrink-0 text-xs px-1.5 py-0.5 rounded border font-medium mt-0.5 ${CATEGORY_COLORS[v.category] ?? CATEGORY_COLORS.Other}`}
            >
              {v.category}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 leading-snug">{v.billTitle}</p>
              {v.date && (
                <p className="text-xs text-gray-400 mt-0.5">{v.date}</p>
              )}
            </div>
            <span className={`shrink-0 text-xs ${VOTE_STYLES[v.vote] ?? 'text-gray-500'}`}>
              {v.vote}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="text-xs text-gray-400">Weight:</span>
        <span className="text-xs text-navy-700 font-bold">Sponsored</span>
        <span className="text-xs text-blue-700 font-semibold">Cosponsored</span>
        <span className="text-xs text-green-700 font-semibold">Yes</span>
        <span className="text-xs text-red-700 font-semibold">No</span>
        <span className="text-xs text-gray-400">Not Voting</span>
        {dataSource && (
          <span className="text-xs text-gray-400 ml-auto">
            Source: {dataSource === 'congress.gov' ? 'Congress.gov + GovTrack' : 'OpenStates'}
          </span>
        )}
      </div>
    </div>
  );
}
