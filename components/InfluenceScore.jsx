'use client';

function scoreStyle(score) {
  if (score > 66) return { stroke: '#dc2626', bg: 'bg-red-50',   border: 'border-red-100',   label: 'High',     labelCls: 'text-red-700' };
  if (score > 33) return { stroke: '#d97706', bg: 'bg-amber-50', border: 'border-amber-100', label: 'Moderate', labelCls: 'text-amber-700' };
  return           { stroke: '#16a34a', bg: 'bg-green-50', border: 'border-green-100', label: 'Low',      labelCls: 'text-green-700' };
}

export default function InfluenceScore({ score, title, description }) {
  if (score == null) return null;
  const { stroke, bg, border, label, labelCls } = scoreStyle(score);
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${bg} ${border}`}>
      <svg width="72" height="72" viewBox="0 0 100 100" className="shrink-0">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="11" />
        <circle
          cx="50" cy="50" r="40"
          fill="none" stroke={stroke} strokeWidth="11"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
        <text x="50" y="46" textAnchor="middle" style={{ fontSize: '22px', fontWeight: 700, fill: stroke }}>
          {score}
        </text>
        <text x="50" y="61" textAnchor="middle" style={{ fontSize: '9px', fill: '#9ca3af' }}>
          / 100
        </text>
      </svg>
      <div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">
          {title}
        </div>
        <div className={`text-sm font-semibold ${labelCls}`}>{label} Influence</div>
        <div className="text-xs text-gray-500 mt-0.5 leading-relaxed max-w-[150px]">
          {description}
        </div>
      </div>
    </div>
  );
}
