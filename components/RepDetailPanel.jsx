'use client';
import { useEffect, useState } from 'react';
import PartyBadge from './PartyBadge';
import VotingTable from './VotingTable';
import DonationBubbleChart from './DonationBubbleChart';
import ContributorsList from './ContributorsList';
import InfluenceScore from './InfluenceScore';
import ConflictReport from './ConflictReport';
import DataGapBanner from './DataGapBanner';

export default function RepDetailPanel({ rep }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conflictLoading, setConflictLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('legislation');

  useEffect(() => {
    loadDetail();
  }, [rep.bioguideId, rep.name]);

  async function loadDetail() {
    setLoading(true);
    try {
      if (rep.level === 'federal' && rep.bioguideId) {
        const params = new URLSearchParams({
          name: rep.name,
          state: rep.stateCode ?? '',
          office: rep.office,
          ...(rep.fecId ? { fecId: rep.fecId } : {}),
        });
        const res = await fetch(`/api/rep-detail/${rep.bioguideId}?${params}`);
        const data = await res.json();
        setDetail({ ...rep, ...data });
      } else if (rep.level === 'state') {
        const params = new URLSearchParams({ name: rep.name, state: rep.stateCode ?? '' });
        const res = await fetch(`/api/state-rep?${params}`);
        const data = await res.json();
        setDetail({ ...rep, ...data });
      } else {
        setDetail({ ...rep, votes: null, finance: null });
      }
    } catch (err) {
      setDetail({ ...rep, votes: null, finance: null, errors: [{ source: 'load', message: err.message }] });
    } finally {
      setLoading(false);
    }
  }

  async function runConflictAnalysis() {
    if (!detail?.votes || !detail?.finance) return;
    setConflictLoading(true);
    try {
      const res = await fetch('/api/conflict-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repName: rep.name, votes: detail.votes, finance: detail.finance }),
      });
      const report = await res.json();
      setDetail(d => ({ ...d, conflict: report }));
    } catch (err) {
      console.error('Conflict analysis failed:', err);
    } finally {
      setConflictLoading(false);
    }
  }

  const tabs = [
    { id: 'legislation', label: 'Legislation' },
    { id: 'finance', label: 'Finance' },
    { id: 'conflict', label: 'Conflicts' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start gap-4">
          {(rep.photoUrl || detail?.memberDetail?.photoUrl) ? (
            <img
              src={detail?.memberDetail?.photoUrl ?? rep.photoUrl}
              alt={rep.name}
              className="w-16 h-16 rounded-full object-cover border border-gray-200 shrink-0"
              onError={e => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center shrink-0 text-indigo-600 text-xl font-bold">
              {rep.name[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-gray-900">{rep.name}</h2>
              <PartyBadge party={rep.party} />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{rep.office}</p>
            {rep.website && (
              <a href={rep.website} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline mt-1 inline-block">
                Official website →
              </a>
            )}
          </div>
          {detail?.influenceScore != null && (
            <div className="shrink-0 hidden sm:block">
              <InfluenceScore score={detail.influenceScore} />
            </div>
          )}
        </div>
      </div>

      {/* Level badge */}
      <div className="px-5 pt-3">
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
          rep.level === 'federal' ? 'bg-indigo-100 text-indigo-700' :
          rep.level === 'state' ? 'bg-teal-100 text-teal-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          {rep.level === 'federal' ? '🏛 Federal' : rep.level === 'state' ? '🏛 State' : '🏙 Local'}
        </span>
      </div>

      {loading ? (
        <div className="p-5">
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
          </div>
        </div>
      ) : rep.level === 'local' ? (
        <div className="p-5">
          <DataGapBanner source="Voting records and campaign finance" reason="not available for local representatives" />
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-100 px-5 mt-3">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`mr-4 pb-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === 'legislation' && (
              <VotingTable votes={detail?.votes} dataSource={detail?.votesDataSource} />
            )}

            {activeTab === 'finance' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Donations by Industry (2024)</h3>
                  <DonationBubbleChart
                    sectors={detail?.finance?.sectors}
                    totalRaised={detail?.finance?.totalRaised}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Top Contributors</h3>
                  <ContributorsList contributors={detail?.finance?.topContributors} />
                </div>
                {rep.level !== 'federal' && (
                  <DataGapBanner source="Federal campaign finance" reason="only available for U.S. Congress members" />
                )}
              </div>
            )}

            {activeTab === 'conflict' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">
                  Claude cross-references this representative's legislative record against their top donor industries to surface potential conflicts of interest.
                </p>
                <ConflictReport
                  report={detail?.conflict}
                  loading={conflictLoading}
                  onAnalyze={runConflictAnalysis}
                  hasData={!!(detail?.votes?.length && detail?.finance?.sectors?.length)}
                />
                {!(detail?.votes?.length && detail?.finance?.sectors?.length) && (
                  <DataGapBanner source="Conflict analysis" reason="requires both voting data and finance data" />
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
