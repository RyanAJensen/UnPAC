export default function DataGapBanner({ source, reason }) {
  return (
    <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-500 flex items-start gap-2">
      <span className="mt-0.5 text-gray-400">ℹ️</span>
      <span>
        {source} data is not available
        {reason ? ` — ${reason}` : ' for this representative'}.
      </span>
    </div>
  );
}
