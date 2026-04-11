'use client';
import { useState } from 'react';

/**
 * Props:
 *   title    – short headline  (e.g. "No voting record available")
 *   reason   – 1-sentence plain-language explanation shown immediately
 *   detail   – longer explanation shown when user clicks "Why?"  (optional)
 */
export default function DataGapBanner({ title, reason, detail }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 space-y-1">
      <div className="flex items-start gap-2">
        <span className="text-gray-400 text-base shrink-0 leading-tight select-none mt-px">ℹ</span>
        <div className="flex-1 min-w-0">
          {title && <p className="text-sm font-semibold text-gray-700">{title}</p>}
          {reason && <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{reason}</p>}
        </div>
        {detail && (
          <button
            onClick={() => setOpen(v => !v)}
            className="shrink-0 text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors mt-0.5"
          >
            {open ? 'Less ▲' : 'Why? ▼'}
          </button>
        )}
      </div>
      {open && detail && (
        <p className="text-xs text-gray-500 leading-relaxed pl-6">{detail}</p>
      )}
    </div>
  );
}
