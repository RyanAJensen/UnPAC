import AddressInput from '@/components/AddressInput';

const FEATURES = [
  { icon: '🗳', label: 'Voting Record', desc: 'Bills sponsored across 8 issue categories' },
  { icon: '💰', label: 'Who Funds Them', desc: 'Campaign donations by industry' },
  { icon: '📊', label: 'Influence Scores', desc: 'Legislative & voting alignment with donors' },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(150deg, #0d1f36 0%, #1a3356 45%, #7f1d1d 100%)' }}>

      {/* Nav */}
      <nav className="shrink-0 border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <span className="text-lg font-black tracking-tight text-white">
          Rep<span style={{ color: '#e03040' }}>Watch</span>
        </span>
        <span className="text-xs text-white/35 font-medium tracking-widest uppercase hidden sm:block">
          Civic Transparency Tool
        </span>
      </nav>

      {/* Body */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: hero */}
          <div>
            <div className="inline-flex items-center gap-2 border border-white/20 rounded-full px-3 py-1 mb-6" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-white/80 font-medium">Free · No account required</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-5">
              Know who really<br />
              <span style={{ color: '#e03040' }}>represents you.</span>
            </h1>

            <p className="text-white/65 text-base sm:text-lg leading-relaxed mb-8">
              Enter your address to see every federal, state, and local representative — what they vote for, and who pays them to do it.
            </p>

            {/* Feature list */}
            <div className="space-y-3">
              {FEATURES.map(f => (
                <div key={f.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                    {f.icon}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white">{f.label}</span>
                    <span className="text-white/45 text-sm"> — {f.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-2">
              <div className="w-5 h-px bg-white/20" />
              <p className="text-xs text-white/30">
                Congress.gov · FEC · OpenStates · US Census Bureau
              </p>
            </div>
          </div>

          {/* Right: form card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8" style={{ borderTop: '3px solid #cc2936' }}>
            <AddressInput />
          </div>

        </div>
      </div>

    </main>
  );
}
