import AddressInput from '@/components/AddressInput';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-2xl mx-auto px-4 py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            🏛 Civic Transparency Tool
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            RepWatch
          </h1>
          <p className="text-lg text-gray-500 max-w-lg mx-auto">
            Enter your address to see every representative who speaks for you — what they vote for, and who pays them to do it.
          </p>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { icon: '🗳', label: 'Voting Record', desc: 'Bills sponsored across 8 issue categories' },
            { icon: '💰', label: 'Who Funds Them', desc: 'Campaign donations by industry (FEC data)' },
            { icon: '🧠', label: 'Conflict Detector', desc: 'AI cross-references votes vs. donor industries' },
          ].map(f => (
            <div key={f.label} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
              <div className="text-2xl mb-1">{f.icon}</div>
              <div className="text-xs font-semibold text-gray-700">{f.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <AddressInput />
        </div>

        {/* Data sources */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Data from Google Civic API · Congress.gov · FEC · OpenStates
        </p>
      </div>
    </main>
  );
}
