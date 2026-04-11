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
    await lookup(`${street.trim()}, ${city.trim()}, ${state} ${zip.trim()}`);
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
    } catch {
      setError('Network error — please try again.');
    } finally {
      setLoading(false);
    }
  }

  const field =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 ' +
    'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-navy-600 ' +
    'focus:border-navy-600 disabled:opacity-50 transition-colors';

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-gray-700">Your home address</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Street */}
        <input
          type="text"
          value={street}
          onChange={e => setStreet(e.target.value)}
          placeholder="Street Address"
          className={field}
          disabled={loading}
          autoComplete="street-address"
        />

        {/* City / State / ZIP — stacks on mobile, inline on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_6rem_7.5rem] gap-3">
          <input
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="City"
            className={field}
            disabled={loading}
            autoComplete="address-level2"
          />
          <select
            value={state}
            onChange={e => setState(e.target.value)}
            className={field}
            disabled={loading}
            autoComplete="address-level1"
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
            placeholder="ZIP Code"
            className={field}
            disabled={loading}
            maxLength={10}
            autoComplete="postal-code"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || isFormEmpty}
          className="w-full py-2.5 text-white text-sm font-semibold rounded-lg disabled:opacity-40 transition-colors"
          style={{ background: '#cc2936' }}
          onMouseEnter={e => e.currentTarget.style.background = '#b91c1c'}
          onMouseLeave={e => e.currentTarget.style.background = '#cc2936'}
        >
          {loading ? 'Looking up…' : 'Find My Representatives'}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or try a demo</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Demo */}
      <button
        onClick={handleDemo}
        disabled={loading}
        className="w-full py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-40"
      >
        350 Fifth Ave, New York, NY — Empire State Building
      </button>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <p className="text-xs text-gray-400 text-center">
        Your address is only used to find your representatives — it is never stored.
      </p>
    </div>
  );
}
