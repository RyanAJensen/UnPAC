'use client';

const TENSION_CONFIG = {
  High:   { wrap: 'bg-red-50 border-red-200',     body: 'text-red-900',    icon: '🚨' },
  Medium: { wrap: 'bg-amber-50 border-amber-200', body: 'text-amber-900',  icon: '⚠️' },
  Low:    { wrap: 'bg-yellow-50 border-yellow-200', body: 'text-yellow-900', icon: '🔍' },
  None:   { wrap: 'bg-green-50 border-green-200', body: 'text-green-900',  icon: '✅' },
};

const TENSION_LABEL = {
  'Supports donors':      { cls: 'bg-orange-100 text-orange-800', label: 'Votes with donors' },
  'Votes against donors': { cls: 'bg-green-100 text-green-800',   label: 'Votes against donors' },
  Mixed:                  { cls: 'bg-gray-100 text-gray-700',     label: 'Mixed' },
};

export default function ConflictReport({ report, loading, onAnalyze, hasData }) {
  if (!hasData) return null;

  if (!report && !loading) {
    return (
      <button
        onClick={onAnalyze}
        className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-navy-200 text-navy-700 text-sm font-semibold hover:border-navy-400 hover:bg-navy-50 transition-all"
      >
        🧠 Analyze Conflicts of Interest
      </button>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl bg-navy-50 border border-navy-200 p-4 text-sm text-navy-700 animate-pulse flex items-center gap-2">
        <span>🧠</span>
        <span>Claude is analyzing voting record vs. donor industries…</span>
      </div>
    );
  }

  const cfg = TENSION_CONFIG[report.overallTension] ?? TENSION_CONFIG.None;

  return (
    <div className={`rounded-xl border p-4 ${cfg.wrap}`}>
      <div className="flex items-start gap-2 mb-3">
        <span className="text-xl shrink-0">{cfg.icon}</span>
        <p className={`text-sm leading-relaxed ${cfg.body}`}>{report.summary}</p>
      </div>

      {report.conflicts?.length > 0 && (
        <div className="space-y-2 mt-3">
          {report.conflicts.map((c, i) => {
            const t = TENSION_LABEL[c.tension] ?? TENSION_LABEL.Mixed;
            return (
              <div key={i} className="bg-white/70 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-semibold text-gray-700">{c.donorIndustry}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${t.cls}`}>
                    {t.label}
                  </span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">{c.explanation}</p>
                {c.relevantVotes?.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1 italic">
                    re: {c.relevantVotes.join(', ')}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
