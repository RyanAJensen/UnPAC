import { useState } from 'react';

function getInitials(name) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const PARTY_BORDER = {
  D: 'border-l-blue-600',
  R: 'border-l-red-600',
  I: 'border-l-gray-400',
  L: 'border-l-yellow-500',
};

const PARTY_BADGE = {
  D: { bg: '#1d4ed8', label: 'Dem' },
  R: { bg: '#dc2626', label: 'Rep' },
  I: { bg: '#6b7280', label: 'Ind' },
  L: { bg: '#ca8a04', label: 'Lib' },
};

export default function RepCard({ rep, onClick, isExpanded }) {
  const [imgError, setImgError] = useState(false);
  const leftBorder = PARTY_BORDER[rep.party] ?? 'border-l-gray-300';
  const badge = PARTY_BADGE[rep.party];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg border border-l-4 transition-all
        ${leftBorder}
        ${isExpanded
          ? 'border-gray-300 bg-indigo-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
        }`}
    >
      <div className="flex items-start gap-2.5 px-2.5 py-2.5">
        {/* Photo / initials */}
        {rep.photoUrl && !imgError ? (
          <img
            src={rep.photoUrl}
            alt={rep.name}
            className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0 mt-0.5"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs select-none mt-0.5" style={{ background: '#1a3356' }}>
            {getInitials(rep.name)}
          </div>
        )}

        {/* Text */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-1.5 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm leading-snug">{rep.name}</span>
            {badge && (
              <span
                className="shrink-0 text-[10px] font-bold text-white px-1 py-0.5 rounded leading-none mt-0.5"
                style={{ background: badge.bg }}
              >
                {badge.label}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug">{rep.office}</p>
        </div>
      </div>
    </button>
  );
}
