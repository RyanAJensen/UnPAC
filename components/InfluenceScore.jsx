'use client';

export default function InfluenceScore({ score }) {
  if (score == null) return null;

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;

  const color = score > 66 ? '#ef4444' : score > 33 ? '#f59e0b' : '#22c55e';
  const label = score > 66 ? 'High Industry Influence' : score > 33 ? 'Moderate Influence' : 'Low Influence';
  const bgColor = score > 66 ? 'bg-red-50' : score > 33 ? 'bg-amber-50' : 'bg-green-50';

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl ${bgColor}`}>
      <svg width="100" height="100" viewBox="0 0 100 100" className="shrink-0">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={radius}
          fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
        <text x="50" y="46" textAnchor="middle" style={{ fontSize: '20px', fontWeight: 700, fill: color }}>{score}</text>
        <text x="50" y="62" textAnchor="middle" style={{ fontSize: '9px', fill: '#6b7280' }}>/ 100</text>
      </svg>
      <div>
        <div className="text-sm font-bold text-gray-800">Influence Score</div>
        <div className="text-xs text-gray-500 mt-0.5 max-w-[160px]">{label} — measures how concentrated funding is in industries they legislate over</div>
      </div>
    </div>
  );
}
