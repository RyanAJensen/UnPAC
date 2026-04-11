import PartyBadge from './PartyBadge';

export default function RepCard({ rep, onClick, isExpanded }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
        isExpanded
          ? 'border-indigo-400 bg-indigo-50'
          : 'border-gray-200 bg-white hover:border-indigo-300'
      }`}
    >
      <div className="flex items-start gap-3">
        {rep.photoUrl ? (
          <img
            src={rep.photoUrl}
            alt={rep.name}
            className="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0"
            onError={e => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center shrink-0 text-indigo-600 font-bold">
            {rep.name[0]}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{rep.name}</span>
            <PartyBadge party={rep.party} />
          </div>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug">{rep.office}</p>
        </div>
        <span className="text-gray-400 text-sm shrink-0 mt-1">{isExpanded ? '▲' : '▼'}</span>
      </div>
    </button>
  );
}
