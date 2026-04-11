'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RepCard from '@/components/RepCard';
import RepDetailPanel from '@/components/RepDetailPanel';
import LoadingSkeleton from '@/components/LoadingSkeleton';

const LEVEL_ORDER = ['federal', 'state', 'local'];
const LEVEL_LABELS = { federal: 'Federal', state: 'State', local: 'Local' };

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('repsResult');
    if (!stored) { router.replace('/'); return; }
    const data = JSON.parse(stored);
    setResult(data);
    const firstFederal = data.reps?.find(r => r.level === 'federal');
    if (firstFederal) setExpandedId(repKey(firstFederal));
  }, [router]);

  function repKey(rep) {
    return rep.bioguideId ?? rep.name;
  }

  function toggleExpand(rep) {
    const key = repKey(rep);
    setExpandedId(prev => prev === key ? null : key);
  }

  if (!result) return (
    <main className="min-h-screen bg-page">
      <nav className="border-b border-navy-700" style={{ backgroundColor: '#0d1f36' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <span className="text-lg font-extrabold text-white tracking-tight">RepWatch</span>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <LoadingSkeleton count={6} />
      </div>
    </main>
  );

  const repsByLevel = LEVEL_ORDER.reduce((acc, level) => {
    acc[level] = result.reps.filter(r => r.level === level);
    return acc;
  }, {});

  const expandedRep = result.reps.find(r => repKey(r) === expandedId);

  return (
    <main className="min-h-screen bg-page">

      {/* Sticky nav */}
      <nav className="border-b border-navy-700 sticky top-0 z-10" style={{ backgroundColor: '#0d1f36' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-5">
          <button
            onClick={() => router.push('/')}
            className="text-base font-extrabold text-white tracking-tight shrink-0 hover:text-navy-100 transition-colors"
          >
            RepWatch
          </button>

          <span className="text-navy-700 hidden sm:block select-none">|</span>

          <button
            onClick={() => router.push('/')}
            className="hidden sm:flex items-center gap-1 text-sm text-navy-200 hover:text-white transition-colors shrink-0"
          >
            ← New address
          </button>

          <div className="flex-1 min-w-0 hidden md:block">
            <p className="text-xs text-navy-200 truncate">{result.address}</p>
          </div>

          <span className="text-xs text-navy-200 shrink-0 ml-auto">
            {result.reps.length} representatives
          </span>
        </div>
      </nav>

      {/* Mobile sub-bar */}
      <div className="sm:hidden bg-navy-800 px-4 py-2 border-b border-navy-700">
        <button
          onClick={() => router.push('/')}
          className="text-xs text-navy-100 hover:text-white flex items-center gap-1 mb-0.5"
        >
          ← New address
        </button>
        <p className="text-xs text-navy-200 truncate">{result.address}</p>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-6 items-start">

          {/* Rep list */}
          <div className="space-y-6">
            {LEVEL_ORDER.map(level => {
              const reps = repsByLevel[level];
              if (!reps?.length) return null;
              return (
                <div key={level}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest shrink-0">
                      {LEVEL_LABELS[level]}
                    </h2>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <div className="space-y-2">
                    {reps.map(rep => (
                      <RepCard
                        key={repKey(rep)}
                        rep={rep}
                        onClick={() => toggleExpand(rep)}
                        isExpanded={repKey(rep) === expandedId}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail panel */}
          <div>
            {expandedRep ? (
              <RepDetailPanel key={repKey(expandedRep)} rep={expandedRep} />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                <div className="text-3xl mb-2">👆</div>
                <p className="text-sm">Select a representative to view their details</p>
              </div>
            )}
          </div>

        </div>
      </div>

    </main>
  );
}
