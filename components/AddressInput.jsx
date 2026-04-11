'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

export default function AddressInput() {
  const router = useRouter();
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isFormEmpty = !street.trim() || !city.trim() || !state || !zip.trim();

  async function handleSubmit(e) {
    e?.preventDefault();
    if (isFormEmpty) return;
    const address = `${street.trim()}, ${city.trim()}, ${state} ${zip.trim()}`;
    await lookup(address);
  }

  async function handleDemo() {
    await lookup('350 Fifth Ave, New York, NY 10118');
  }

  async function lookup(addr) {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/representatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addr }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Could not find representatives for this address.');
        return;
      }
      sessionStorage.setItem('repsResult', JSON.stringify(data));
      router.push('/results');
    } catch (err) {
      setError('Network error — please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-40';

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={street}
          onChange={e => setStreet(e.target.value)}
          placeholder="Street Address"
          className={inputClass}
          disabled={loading}
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="City"
            className={`${inputClass} flex-1`}
            disabled={loading}
          />
          <select
            value={state}
            onChange={e => setState(e.target.value)}
            className={`${inputClass} w-24 shrink-0`}
            disabled={loading}
          >
            <option value="">State</option>
            {US_STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input
            type="text"
            value={zip}
            onChange={e => setZip(e.target.value)}
            placeholder="ZIP"
            className={`${inputClass} w-28 shrink-0`}
            disabled={loading}
            maxLength={10}
          />
        </div>
        <button
          type="submit"
          disabled={loading || isFormEmpty}
          className="w-full px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl disabled:opacity-40 transition-colors"
        >
          {loading ? 'Looking up...' : 'Find My Reps'}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <button
        onClick={handleDemo}
        disabled={loading}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-indigo-200 text-indigo-600 text-sm font-medium hover:border-indigo-300 hover:bg-indigo-50 transition-all disabled:opacity-40"
      >
        🗽 Try Demo: 350 Fifth Ave, New York, NY
      </button>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <p className="text-xs text-gray-400 text-center">
        Your address is only used to look up representatives — it is never stored.
      </p>
    </div>
  );
}
