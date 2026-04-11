'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RepCard from '@/components/RepCard';
import RepDetailPanel from '@/components/RepDetailPanel';
import LoadingSkeleton from '@/components/LoadingSkeleton';

const LEVEL_ORDER = ['federal', 'state', 'local'];
const LEVEL_LABELS = { federal: '🏛 Federal', state: '🏛 State', local: '🏙 Local' };

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('repsResult');
    if (!stored) { router.replace('/'); return; }
    const data = JSON.parse(stored);
    setResult(data);
    // Auto-expand first federal rep
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <LoadingSkeleton count={6} />
    </main>
  );

  const repsByLevel = LEVEL_ORDER.reduce((acc, level) => {
    acc[level] = result.reps.filter(r => r.level === level);
    return acc;
  }, {});

  const expandedRep = result.reps.find(r => repKey(r) === expandedId);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <button onClick={() => router.push('/')} className="text-sm text-indigo-600 hover:text-indigo-800 mb-1 flex items-center gap-1">
              ← New address
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              Representatives for <span className="text-indigo-700">{result.address}</span>
            </h1>
            <p className="text-sm text-gray-500">{result.reps.length} representatives found</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: rep list by level */}
          <div className="lg:col-span-1 space-y-6">
            {LEVEL_ORDER.map(level => {
              const reps = repsByLevel[level];
              if (!reps?.length) return null;
              return (
                <div key={level}>
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    {LEVEL_LABELS[level]}
                  </h2>
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

          {/* Right: expanded detail */}
          <div className="lg:col-span-2">
            {expandedRep ? (
              <RepDetailPanel key={repKey(expandedRep)} rep={expandedRep} />
            ) : (
              <div className="flex items-center justify-center h-64 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 text-sm">
                Select a representative to see their details
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
