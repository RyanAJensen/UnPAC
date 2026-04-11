'use client';
import { useEffect, useState } from 'react';
import PartyBadge from './PartyBadge';
import VotingTable from './VotingTable';
import DonationBubbleChart from './DonationBubbleChart';
import ContributorsList from './ContributorsList';
import InfluenceScore from './InfluenceScore';
import DataGapBanner from './DataGapBanner';
import { computeVotingInfluenceScore } from '@/lib/influenceScore';

function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function RepDetailPanel({ rep }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('legislation');
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    setPhotoError(false);
    loadDetail();
  }, [rep.bioguideId, rep.name]);

  async function loadDetail() {
    setLoading(true);
    try {
      if (rep.level === 'federal' && rep.bioguideId) {
        const params = new URLSearchParams({
          name: rep.name, state: rep.stateCode ?? '', office: rep.office,
          ...(rep.fecId ? { fecId: rep.fecId } : {}),
        });
        const res = await fetch(`/api/rep-detail/${rep.bioguideId}?${params}`);
        setDetail({ ...rep, ...await res.json() });
      } else if (rep.level === 'state') {
        const params = new URLSearchParams({
          name: rep.name, state: rep.stateCode ?? '',
          ...(rep.openStatesId ? { openStatesId: rep.openStatesId } : {}),
        });
        const res = await fetch(`/api/state-rep?${params}`);
        setDetail({ ...rep, ...await res.json() });
      } else {
        setDetail({ ...rep, votes: null, finance: null });
      }
    } catch (err) {
      setDetail({ ...rep, votes: null, finance: null, errors: [{ source: 'load', message: err.message }] });
    } finally {
      setLoading(false);
    }
  }

  const votingScore = detail ? computeVotingInfluenceScore(detail.votes ?? [], detail.finance?.sectors ?? []) : null;
  const levelColor = rep.level === 'federal' ? '#4f46e5' : rep.level === 'state' ? '#0d9488' : '#6b7280';

  const tabs = [
    { id: 'legislation', label: 'Legislation' },
    { id: 'finance', label: 'Finance' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

      {/* Compact header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          {/* Photo */}
          {(rep.photoUrl || detail?.memberDetail?.photoUrl) && !photoError ? (
            <img
              src={detail?.memberDetail?.photoUrl ?? rep.photoUrl}
              alt={rep.name}
              className="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0"
              onError={() => setPhotoError(true)}
            />
          ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              {getInitials(rep.name)}
            </div>
          )}

          {/* Name / office / badge */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-gray-900 leading-tight">{rep.name}</h2>
              <PartyBadge party={rep.party} />
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${levelColor}18`, color: levelColor }}>
                {rep.level === 'federal' ? 'Federal' : rep.level === 'state' ? 'State' : 'Local'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{rep.office}</p>
            {rep.website && (
              <a href={rep.website} target="_blank" rel="noopener noreferrer"
                className="text-[10px] text-indigo-600 hover:underline">
                Official website →
              </a>
            )}
          </div>
        </div>

        {/* Influence scores — shown once data loads */}
        {!loading && (detail?.influenceScore != null || votingScore != null) && (
          <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
            {detail?.influenceScore != null && (
              <InfluenceScore score={detail.influenceScore} title="Legislative Influence" />
            )}
            {votingScore != null && (
              <InfluenceScore score={votingScore} title="Voting Influence" />
            )}
          </div>
        )}
      </div>

      {/* Body */}
      {loading ? (
        <div className="p-4 space-y-2 animate-pulse">
          <div className="h-3 bg-gray-100 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
          <div className="h-3 bg-gray-100 rounded w-5/6" />
        </div>
      ) : rep.level === 'local' ? (
        <div className="p-4">
          <DataGapBanner source="Voting records and campaign finance" reason="not available for local representatives" />
        </div>
      ) : (
        <>
          <div className="flex border-b border-gray-100 px-4">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`mr-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {activeTab === 'legislation' && (
              <VotingTable votes={detail?.votes} dataSource={detail?.votesDataSource} />
            )}
            {activeTab === 'finance' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Donations by Industry (2024)</h3>
                  <DonationBubbleChart sectors={detail?.finance?.sectors} totalRaised={detail?.finance?.totalRaised} />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Top Contributors</h3>
                  <ContributorsList contributors={detail?.finance?.topContributors} />
                </div>
                {rep.level !== 'federal' && (
                  <DataGapBanner source="Federal campaign finance" reason="only available for U.S. Congress members" />
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
