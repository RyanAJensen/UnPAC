const PARTY_STYLES = {
  D: 'bg-blue-100 text-blue-800 border-blue-200',
  R: 'bg-red-100 text-red-800 border-red-200',
  I: 'bg-gray-100 text-gray-700 border-gray-200',
  L: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  '?': 'bg-gray-100 text-gray-500 border-gray-200',
};

const PARTY_LABELS = { D: 'Democrat', R: 'Republican', I: 'Independent', L: 'Libertarian', '?': 'Unknown' };

export default function PartyBadge({ party }) {
  const style = PARTY_STYLES[party] ?? PARTY_STYLES['?'];
  const label = PARTY_LABELS[party] ?? party;
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${style}`}>
      {label}
    </span>
  );
}
