'use client';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import DataGapBanner from './DataGapBanner';

const SECTOR_COLORS = {
  Finance:          '#1e4276',
  Health:           '#be185d',
  Energy:           '#b45309',
  Defense:          '#374151',
  Technology:       '#0369a1',
  Legal:            '#6d28d9',
  'Real Estate':    '#065f46',
  Agriculture:      '#3f6212',
  Media:            '#9a3412',
  'PAC/Dark Money': '#991b1b',
  Other:            '#6b7280',
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
          isAnimationActive={false}
          animationDuration={0}
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
