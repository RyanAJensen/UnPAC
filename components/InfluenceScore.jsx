'use client';
import { useState } from 'react';

const EXPLANATIONS = {
  'Legislative Influence': {
    what: 'How concentrated this representative\'s campaign funding is in industries they have direct regulatory power over.',
    how: [
      'Identifies donations from high-influence sectors: Finance, Health, Energy, Defense, and Agriculture.',
      'Sums their percentage of total donations (e.g. Finance 38% + Health 17% = 55%).',
      'Adds a concentration bonus if a single sector dominates (>30% or >50%).',
      'Scale: 0–33 Low · 34–66 Moderate · 67–100 High.',
    ],
  },
  'Voting Influence': {
    what: 'How often this representative sponsors legislation that directly benefits their top donor industries.',
    how: [
      'Maps each donor sector to a bill category (e.g. Finance → Economy, Health → Healthcare).',
      'For each funded sector, calculates what fraction of the rep\'s bills fall in that category.',
      'Weights each fraction by that sector\'s share of total donations.',
      'Scale: 0–33 Low · 34–66 Moderate · 67–100 High.',
    ],
  },
};

function scoreStyle(score) {
  if (score > 66) return { stroke: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'High',     labelColor: '#b91c1c' };
  if (score > 33) return { stroke: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Moderate', labelColor: '#b45309' };
  return           { stroke: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Low',      labelColor: '#15803d' };
}

export default function InfluenceScore({ score, title }) {
  const [open, setOpen] = useState(false);
  if (score == null) return null;

  const { stroke, bg, border, label, labelColor } = scoreStyle(score);
  const circumference = 2 * Math.PI * 32;
  const offset = circumference - (score / 100) * circumference;
  const info = EXPLANATIONS[title];

  return (
    <div className="flex-1 min-w-0">
      {/* Card */}
      <div className="rounded-xl border p-3" style={{ backgroundColor: bg, borderColor: border }}>
        <div className="flex items-center gap-3">
          {/* Ring */}
          <svg width="58" height="58" viewBox="0 0 80 80" className="shrink-0">
            <circle cx="40" cy="40" r="32" fill="none" stroke="#e5e7eb" strokeWidth="9" />
            <circle
              cx="40" cy="40" r="32"
              fill="none" stroke={stroke} strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
            />
            <text x="40" y="36" textAnchor="middle" style={{ fontSize: '17px', fontWeight: 700, fill: stroke }}>{score}</text>
            <text x="40" y="49" textAnchor="middle" style={{ fontSize: '8px', fill: '#9ca3af' }}>/100</text>
          </svg>

          {/* Labels */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide leading-tight">{title}</span>
              <button
                onClick={() => setOpen(v => !v)}
                className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 transition-colors"
                style={{ backgroundColor: open ? stroke : '#d1d5db', color: 'white' }}
                title="How is this calculated?"
              >
                ?
              </button>
            </div>
            <div className="text-sm font-semibold mt-0.5" style={{ color: labelColor }}>{label}</div>
          </div>
        </div>

        {/* Explainer — toggled */}
        {open && info && (
          <div className="mt-2.5 pt-2.5 border-t space-y-1.5" style={{ borderColor: border }}>
            <p className="text-xs text-gray-600 leading-relaxed">{info.what}</p>
            <ul className="space-y-1">
              {info.how.map((step, i) => (
                <li key={i} className="flex gap-1.5 text-xs text-gray-500 leading-relaxed">
                  <span className="shrink-0 font-bold" style={{ color: stroke }}>{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
