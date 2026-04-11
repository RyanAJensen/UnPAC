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

  function repKey(rep) { return rep.bioguideId ?? rep.name; }
  function toggleExpand(rep) {
    const key = repKey(rep);
    setExpandedId(prev => prev === key ? null : key);
  }

  if (!result) return (
    <div className="h-screen flex flex-col bg-page">
      <nav className="shrink-0 border-b border-white/10 px-6 py-3 flex items-center justify-between" style={{ backgroundColor: '#0d1f36' }}>
        <span className="text-lg font-black tracking-tight text-white">Un<span style={{ color: '#e03040' }}>PAC</span></span>
      </nav>
      <div className="flex-1 p-6"><LoadingSkeleton count={6} /></div>
    </div>
  );

  const repsByLevel = LEVEL_ORDER.reduce((acc, level) => {
    acc[level] = result.reps.filter(r => r.level === level);
    return acc;
  }, {});
  const expandedRep = result.reps.find(r => repKey(r) === expandedId);

  return (
    <div className="h-screen flex flex-col bg-page overflow-hidden">

      {/* Nav */}
      <nav className="shrink-0 border-b border-white/10 px-6 py-3 flex items-center gap-3" style={{ backgroundColor: '#0d1f36' }}>
        <button onClick={() => router.push('/')} className="text-lg font-black tracking-tight text-white hover:opacity-80 transition-opacity shrink-0">
          Un<span style={{ color: '#e03040' }}>PAC</span>
        </button>
        <div className="flex-1 flex items-center gap-2 min-w-0 hidden sm:flex">
          <span className="text-white/20">/</span>
          <button onClick={() => router.push('/')} className="text-xs text-white/40 hover:text-white/70 transition-colors shrink-0">
            Search
          </button>
          <span className="text-white/20">/</span>
          <span className="text-xs text-white/60 truncate">{result.address}</span>
        </div>
        <span className="ml-auto shrink-0 text-xs font-medium text-white/30 hidden sm:block">
          {result.reps.length} representative{result.reps.length !== 1 ? 's' : ''}
        </span>
      </nav>

      {/* Two-pane content */}
      <div className="flex-1 flex overflow-hidden">

        {/* Sidebar — scrolls independently */}
        <div className="w-56 shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
          <div className="p-3 space-y-4">
            {LEVEL_ORDER.map(level => {
              const reps = repsByLevel[level];
              if (!reps?.length) return null;
              return (
                <div key={level}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{LEVEL_LABELS[level]}</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  <div className="space-y-1">
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
        </div>

        {/* Detail pane — scrolls independently */}
        <div className="flex-1 overflow-y-auto p-4">
          {expandedRep ? (
            <RepDetailPanel key={repKey(expandedRep)} rep={expandedRep} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <div className="text-4xl mb-3">👈</div>
              <p className="text-sm">Select a representative</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
