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

function VoteRow({ v }) {
  const catCls = CATEGORY_COLORS[v.category] ?? CATEGORY_COLORS.Other;
  const voteCls = VOTE_STYLES[v.vote] ?? 'text-gray-500';

  return (
    <div className={`py-3 px-3 flex items-start gap-3 ${v.isLandmark ? 'bg-gold-50 rounded-lg' : ''}`}>
      <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded border font-medium mt-0.5 ${catCls}`}>
        {v.category}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          {v.isLandmark && (
            <span
              className="shrink-0 text-xs font-bold bg-gold-100 text-gold-700 border border-gold-400 px-1.5 py-0.5 rounded-full"
              title="Key tracked vote"
            >
              ★ Key Vote
            </span>
          )}
          <p className="text-sm text-gray-800 leading-snug">{v.billTitle}</p>
        </div>
        {v.date && <p className="text-xs text-gray-400 mt-0.5">{v.date}</p>}
      </div>
      <span className={`shrink-0 text-xs ${voteCls}`}>{v.vote}</span>
    </div>
  );
}

export default function VotingTable({ votes, dataSource, level }) {
  if (!votes || votes.length === 0) {
    const isFederal = level === 'federal';
    return (
      <DataGapBanner
        title={isFederal ? 'No sponsored legislation found' : 'No sponsored bills found'}
        reason={
          isFederal
            ? 'Congress.gov did not return any sponsored or co-sponsored legislation for this member.'
            : 'OpenStates did not return any sponsored bills for this state legislator.'
        }
        detail={
          isFederal
            ? 'This can happen for newly elected members, members who primarily vote on others\' bills, or when the Congress.gov API key has not yet activated (keys can take up to 24 hours). Data shown here is limited to the current and prior Congress.'
            : 'OpenStates aggregates bill data from all 50 state legislatures, but coverage varies by state and session. Some states have limited digital records, and newly introduced bills may not yet be indexed. Try again in a few minutes if this member was recently looked up.'
        }
      />
    );
  }

  // Pin landmark votes to the top, then sort the rest by date
  const landmark = votes.filter(v => v.isLandmark);
  const regular  = votes.filter(v => !v.isLandmark);
  const sorted   = [...landmark, ...regular];

  // Category summary pills (exclude landmark from count so it doesn't skew)
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

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 pb-3 border-b border-gray-100">
        <span className="text-xs text-gray-400 font-medium">Vote weight:</span>
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

      {/* Key Votes section header (if any) */}
      {landmark.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-gold-600 uppercase tracking-wider">Key Tracked Votes</span>
          <div className="flex-1 h-px bg-gold-100" />
        </div>
      )}

      {/* Bill rows */}
      <div className="divide-y divide-gray-100">
        {sorted.map((v, i) => {
          const isFirstRegular = landmark.length > 0 && i === landmark.length;
          return (
            <div key={i}>
              {isFirstRegular && (
                <div className="flex items-center gap-2 py-2 px-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">All Activity</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
              )}
              <VoteRow v={v} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
