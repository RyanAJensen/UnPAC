'use client';

export default function InfluenceScore({ score }) {
  if (score == null) return null;

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const { stroke, bg, border, label, labelCls } =
    score > 66
      ? { stroke: '#dc2626', bg: 'bg-red-50',   border: 'border-red-100',   label: 'High Industry Influence', labelCls: 'text-red-700' }
      : score > 33
      ? { stroke: '#d97706', bg: 'bg-amber-50', border: 'border-amber-100', label: 'Moderate Influence',       labelCls: 'text-amber-700' }
      : { stroke: '#16a34a', bg: 'bg-green-50', border: 'border-green-100', label: 'Low Influence',            labelCls: 'text-green-700' };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${bg} ${border}`}>
      <svg width="76" height="76" viewBox="0 0 100 100" className="shrink-0">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="11" />
        <circle
          cx="50" cy="50" r={radius}
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
          Influence Score
        </div>
        <div className={`text-sm font-semibold ${labelCls}`}>{label}</div>
        <div className="text-xs text-gray-500 mt-0.5 leading-relaxed max-w-[140px]">
          Measures how concentrated funding is in industries they legislate over
        </div>
      </div>
    </div>
  );
}
