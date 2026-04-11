'use client';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import DataGapBanner from './DataGapBanner';

const SECTOR_COLORS = {
  Finance:     '#6366f1',
  Health:      '#ec4899',
  Energy:      '#f59e0b',
  Defense:     '#64748b',
  Technology:  '#0ea5e9',
  Legal:       '#8b5cf6',
  'Real Estate':'#10b981',
  Agriculture: '#84cc16',
  Media:       '#f97316',
  'PAC/Dark Money': '#ef4444',
  Other:       '#9ca3af',
};

function CustomContent({ x, y, width, height, name, pct }) {
  if (width < 40 || height < 30) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={SECTOR_COLORS[name] ?? '#9ca3af'} rx={6} />
      <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="white" style={{ fontSize: Math.min(13, width / 8), fontWeight: 600 }}>
        {name}
      </text>
      <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="rgba(255,255,255,0.85)" style={{ fontSize: Math.min(11, width / 10) }}>
        {pct}%
      </text>
    </g>
  );
}

export default function DonationBubbleChart({ sectors, totalRaised }) {
  if (!sectors || sectors.length === 0) {
    return <DataGapBanner source="Campaign finance" reason="only available for federal representatives" />;
  }

  const data = sectors.map(s => ({ name: s.sector, size: s.amount, pct: s.pct }));

  return (
    <div>
      {totalRaised != null && (
        <p className="text-xs text-gray-500 mb-2">
          Total raised (2024 cycle): <span className="font-semibold text-gray-700">${(totalRaised / 1_000_000).toFixed(1)}M</span>
        </p>
      )}
      <ResponsiveContainer width="100%" height={220}>
        <Treemap
          data={data}
          dataKey="size"
          content={<CustomContent />}
        >
          <Tooltip
            formatter={(value, name, props) => [
              `$${(value / 1000).toFixed(0)}K (${props.payload?.pct ?? 0}%)`,
              props.payload?.name ?? name,
            ]}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
