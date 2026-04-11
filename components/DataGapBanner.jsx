export default function DataGapBanner({ source, reason }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
      <span className="text-gray-400 text-sm mt-0.5 shrink-0 select-none">ℹ</span>
      <p className="text-sm text-gray-500 leading-relaxed">
        <span className="font-semibold text-gray-600">{source}</span> data is not available
        {reason ? ` — ${reason}` : ' for this representative'}.
      </p>
    </div>
  );
}
