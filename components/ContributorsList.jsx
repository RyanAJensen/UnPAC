import DataGapBanner from './DataGapBanner';

function formatAmount(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export default function ContributorsList({ contributors }) {
  if (!contributors || contributors.length === 0) {
    return (
      <DataGapBanner
        source="Contributor"
        reason="only available for federal representatives"
      />
    );
  }

  const sorted = [...contributors].sort((a, b) => b.amount - a.amount);
  const maxAmount = sorted[0]?.amount ?? 1;

  return (
    <div className="space-y-3">
      {sorted.map((c, i) => (
        <div key={i}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-gray-400 w-5 shrink-0 font-mono">{i + 1}.</span>
              <span className="text-sm text-gray-800 truncate">{c.name}</span>
              {c.isSuperPAC && (
                <span className="shrink-0 text-xs bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded-full font-medium">
                  Super PAC
                </span>
              )}
              {!c.isSuperPAC && c.isPAC && (
                <span className="shrink-0 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full font-medium">
                  PAC
                </span>
              )}
            </div>
            <span className="text-sm font-semibold text-gray-700 shrink-0">
              {formatAmount(c.amount)}
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-navy-700 rounded-full"
              style={{ width: `${(c.amount / maxAmount) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
