import DataGapBanner from './DataGapBanner';

const SECTOR_COLORS = {
  Finance:          '#1e4276',
  Health:           '#be185d',
  Healthcare:       '#be185d',
  Energy:           '#b45309',
  Defense:          '#374151',
  Technology:       '#0369a1',
  Legal:            '#6d28d9',
  'Real Estate':    '#065f46',
  Agriculture:      '#3f6212',
  Media:            '#9a3412',
  'PAC/Dark Money': '#991b1b',
  Education:        '#0f766e',
  Labor:            '#7c3aed',
  Transportation:   '#0284c7',
  Retail:           '#b91c1c',
  Other:            '#6b7280',
};

function sectorColor(name) {
  if (SECTOR_COLORS[name]) return SECTOR_COLORS[name];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffffffff;
  }
  return `hsl(${Math.abs(hash) % 360}, 55%, 38%)`;
}

function formatAmount(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

const MAX_R = 72;
const MIN_R = 32;

export default function DonationBubbleChart({ sectors, totalRaised }) {
  if (!sectors || sectors.length === 0) {
    return <DataGapBanner source="Campaign finance" reason="only available for federal representatives" />;
  }

  const sorted = [...sectors].sort((a, b) => b.amount - a.amount);
  const max = sorted[0]?.amount ?? 1;

  return (
    <div>
      {totalRaised != null && (
        <p className="text-xs text-gray-500 mb-4">
          Total raised (2024 cycle): <span className="font-semibold text-gray-700">{formatAmount(totalRaised)}</span>
        </p>
      )}
      <div className="flex flex-wrap gap-4 items-end justify-start">
        {sorted.map(s => {
          const r = Math.max(MIN_R, Math.round(MAX_R * Math.sqrt(s.amount / max)));
          const diameter = r * 2;
          const color = sectorColor(s.sector);
          const nameFontSize = Math.min(12, r / 3.2);
          const pctFontSize = Math.min(11, r / 3.8);
          return (
            <div key={s.sector} className="flex flex-col items-center gap-1.5">
              <div
                className="rounded-full flex flex-col items-center justify-center text-white"
                style={{ width: diameter, height: diameter, background: color, flexShrink: 0 }}
              >
                <span style={{ fontSize: nameFontSize, fontWeight: 700, lineHeight: 1.2, textAlign: 'center', padding: '0 6px' }}>
                  {s.sector}
                </span>
                <span style={{ fontSize: pctFontSize, opacity: 0.85, lineHeight: 1.1 }}>
                  {s.pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
