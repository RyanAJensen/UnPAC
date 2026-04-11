import { useState } from 'react';
import PartyBadge from './PartyBadge';

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

export default function RepCard({ rep, onClick, isExpanded }) {
  const [imgError, setImgError] = useState(false);
  const leftBorder = PARTY_BORDER[rep.party] ?? 'border-l-gray-300';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg border border-l-4 transition-all
        ${leftBorder}
        ${isExpanded
          ? 'border-navy-600 bg-navy-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }`}
    >
      <div className="flex items-center gap-3 px-3 py-3">
        {rep.photoUrl && !imgError ? (
          <img
            src={rep.photoUrl}
            alt={rep.name}
            className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy-700 to-navy-800 flex items-center justify-center shrink-0 text-white font-bold text-xs select-none">
            {getInitials(rep.name)}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm leading-tight">{rep.name}</span>
            <PartyBadge party={rep.party} />
          </div>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug truncate">{rep.office}</p>
        </div>

        <span className="text-gray-400 text-xs shrink-0">{isExpanded ? '▲' : '▼'}</span>
      </div>
    </button>
  );
}
