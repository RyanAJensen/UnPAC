'use client';

const TENSION_STYLES = {
  High:   { banner: 'bg-red-50 border-red-200 text-red-900', icon: '🚨', badge: 'bg-red-100 text-red-700' },
  Medium: { banner: 'bg-amber-50 border-amber-200 text-amber-900', icon: '⚠️', badge: 'bg-amber-100 text-amber-700' },
  Low:    { banner: 'bg-yellow-50 border-yellow-200 text-yellow-900', icon: '🔍', badge: 'bg-yellow-100 text-yellow-700' },
  None:   { banner: 'bg-green-50 border-green-200 text-green-900', icon: '✅', badge: 'bg-green-100 text-green-700' },
};

const TENSION_LABEL = {
  'Supports donors': { color: 'bg-orange-100 text-orange-800', label: 'Votes with donors' },
  'Votes against donors': { color: 'bg-green-100 text-green-800', label: 'Votes against donors' },
  Mixed: { color: 'bg-gray-100 text-gray-700', label: 'Mixed' },
};

export default function ConflictReport({ report, loading, onAnalyze, hasData }) {
  if (!hasData) return null;

  if (!report && !loading) {
    return (
      <button
        onClick={onAnalyze}
        className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-indigo-300 text-indigo-600 text-sm font-semibold hover:border-indigo-400 hover:bg-indigo-50 transition-all"
      >
        🧠 Analyze Conflicts of Interest
      </button>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4 text-sm text-indigo-700 animate-pulse flex items-center gap-2">
        <span>🧠</span> Claude is analyzing voting record vs. donor industries...
      </div>
    );
  }

  const styles = TENSION_STYLES[report.overallTension] ?? TENSION_STYLES.None;

  return (
    <div className={`rounded-xl border p-4 ${styles.banner}`}>
      <div className="flex items-start gap-2 mb-3">
        <span className="text-xl">{styles.icon}</span>
        <p className="text-sm leading-relaxed">{report.summary}</p>
      </div>

      {report.conflicts?.length > 0 && (
        <div className="space-y-2 mt-3">
          {report.conflicts.map((c, i) => {
            const t = TENSION_LABEL[c.tension] ?? TENSION_LABEL.Mixed;
            return (
              <div key={i} className="bg-white/60 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-700">{c.donorIndustry}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${t.color}`}>{t.label}</span>
                </div>
                <p className="text-xs text-gray-700">{c.explanation}</p>
                {c.relevantVotes?.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">re: {c.relevantVotes.join(', ')}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
