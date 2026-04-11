const PARTY_CONFIG = {
  D: { cls: 'bg-blue-700 text-white',    short: 'D', full: 'Democrat' },
  R: { cls: 'bg-red-700 text-white',     short: 'R', full: 'Republican' },
  I: { cls: 'bg-gray-500 text-white',    short: 'I', full: 'Independent' },
  L: { cls: 'bg-yellow-600 text-white',  short: 'L', full: 'Libertarian' },
};

export default function PartyBadge({ party }) {
  const config = PARTY_CONFIG[party];
  if (!config) {
    return (
      <span className="inline-block text-xs font-bold px-1.5 py-0.5 rounded bg-gray-200 text-gray-500">
        ?
      </span>
    );
  }
  return (
    <span
      className={`inline-block text-xs font-bold px-1.5 py-0.5 rounded ${config.cls}`}
      title={config.full}
    >
      {config.short}
    </span>
  );
}
