import AddressInput from '@/components/AddressInput';

const FEATURES = [
  {
    icon: '🗳',
    label: 'Voting Record',
    desc: 'Bills sponsored across 8 issue categories — healthcare, defense, economy, and more.',
  },
  {
    icon: '💰',
    label: 'Who Funds Them',
    desc: 'Campaign donations broken down by industry, sourced from FEC filings.',
  },
  {
    icon: '🧠',
    label: 'Conflict Detector',
    desc: 'AI cross-references votes against donor industries to surface conflicts of interest.',
  },
];

const DATA_SOURCES = ['Google Civic API', 'Congress.gov', 'FEC', 'OpenStates'];

export default function Home() {
  return (
    <main className="min-h-screen bg-page">

      {/* Top nav */}
      <nav className="bg-navy-900 border-b border-navy-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <span className="text-lg font-extrabold text-white tracking-tight">RepWatch</span>
          <span className="hidden sm:block text-navy-200 text-xs font-medium">
            Civic Transparency Tool
          </span>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-navy-800">
        <div className="max-w-xl mx-auto px-4 pt-14 pb-20 text-center">
          <p className="text-navy-100 text-xs font-bold uppercase tracking-widest mb-5">
            Free · No account required
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Know who really<br />represents you.
          </h1>
          <p className="text-navy-100 text-base sm:text-lg leading-relaxed mb-10">
            Enter your address to see every representative who speaks for you —
            what they vote for, and who pays them to do it.
          </p>

          {/* Address form card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-left">
            <AddressInput />
          </div>
        </div>
      </div>

      {/* Feature strip */}
      <div className="bg-page py-14">
        <div className="max-w-3xl mx-auto px-4">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-7">
            What you'll find
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <div
                key={f.label}
                className="bg-white rounded-xl border border-gray-200 p-5 text-center shadow-sm"
              >
                <div className="text-3xl mb-2">{f.icon}</div>
                <div className="text-sm font-bold text-gray-800 mb-1">{f.label}</div>
                <div className="text-xs text-gray-500 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-10">
            Data sourced from{' '}
            {DATA_SOURCES.map((s, i) => (
              <span key={s}>
                <span className="font-medium text-gray-500">{s}</span>
                {i < DATA_SOURCES.length - 1 && (
                  <span className="mx-1 text-gray-300">·</span>
                )}
              </span>
            ))}
          </p>
        </div>
      </div>

    </main>
  );
}
