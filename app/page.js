import AddressInput from '@/components/AddressInput';

const FEATURES = [
  {
    icon: '🗳',
    label: 'Voting Record',
    desc: 'Bills sponsored across 8 issue categories.',
  },
  {
    icon: '💰',
    label: 'Who Funds Them',
    desc: 'Campaign donations broken down by industry.',
  },
  {
    icon: '📊',
    label: 'Influence Score',
    desc: 'How much donors may shape their votes.',
  },
];

export default function Home() {
  return (
    <main className="h-screen flex flex-col overflow-hidden bg-navy-900">

      {/* Top nav */}
      <nav className="shrink-0 border-b border-navy-700 px-4 sm:px-6 py-3 flex items-center gap-3">
        <span className="text-lg font-extrabold text-white tracking-tight">RepWatch</span>
        <span className="hidden sm:block text-navy-300 text-xs font-medium">Civic Transparency Tool</span>
      </nav>

      {/* Main content — vertically centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">

        {/* Hero text */}
        <div className="text-center mb-8 max-w-lg">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
            Know who really<br />represents you.
          </h1>
          <p className="text-navy-200 text-sm sm:text-base leading-relaxed">
            Enter your address to see every representative — what they vote for, and who pays them.
          </p>
        </div>

        {/* Address form */}
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-5 sm:p-7">
          <AddressInput />
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-7">
          {FEATURES.map(f => (
            <div key={f.label} className="flex items-center gap-2 bg-navy-800 border border-navy-700 rounded-full px-4 py-1.5">
              <span className="text-base">{f.icon}</span>
              <span className="text-xs font-semibold text-navy-100">{f.label}</span>
            </div>
          ))}
        </div>

        {/* Data sources */}
        <p className="mt-5 text-xs text-navy-400 text-center">
          Data from Congress.gov · FEC · OpenStates · US Census
        </p>
      </div>

    </main>
  );
}
