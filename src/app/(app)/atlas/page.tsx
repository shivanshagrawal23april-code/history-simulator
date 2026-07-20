'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, ArrowRight } from 'lucide-react';
import { CIVILIZATIONS } from '@/lib/data/civilizations';
import { formatYear } from '@/lib/utils';

const MIN_YEAR = -3100;
const MAX_YEAR = 2000;

const ERA_PRESETS = [
  { label: 'Bronze Age', year: -2500 },
  { label: 'Classical', year: -400 },
  { label: 'Pax Romana', year: 117 },
  { label: 'Medieval', year: 1100 },
  { label: 'Mongol Peak', year: 1279 },
  { label: 'Early Modern', year: 1600 },
  { label: 'Imperial Age', year: 1900 },
  { label: 'Cold War', year: 1970 },
];

export default function AtlasPage() {
  const [year, setYear] = useState(117);

  const active = useMemo(
    () =>
      CIVILIZATIONS.filter(
        (c) => c.startYear <= year && (c.endYear === null || c.endYear >= year),
      ),
    [year],
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <p className="section-label mb-2">Historical Atlas</p>
      <h1 className="font-display text-4xl">The world in {formatYear(year)}.</h1>
      <p className="mt-3 max-w-2xl text-secondary">
        Scrub through 5,000 years and watch the great powers rise and fall. Select an
        era or drag the year slider.
      </p>

      {/* Era presets */}
      <div className="mt-8 flex flex-wrap gap-2">
        {ERA_PRESETS.map((e) => (
          <button
            key={e.label}
            onClick={() => setYear(e.year)}
            className={`rounded-full border px-4 py-1.5 text-xs transition-all ${
              year === e.year
                ? 'border-gold-border bg-gold-soft text-primary'
                : 'border-line text-secondary hover:text-primary'
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>

      {/* Year slider */}
      <div className="glass-card mt-6 p-6">
        <div className="flex items-center justify-between font-mono text-xs text-secondary">
          <span>{formatYear(MIN_YEAR)}</span>
          <span className="text-lg text-gold">{formatYear(year)}</span>
          <span>{formatYear(MAX_YEAR)}</span>
        </div>
        <input
          type="range"
          min={MIN_YEAR}
          max={MAX_YEAR}
          step={10}
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="mt-4 w-full accent-[#D4AF37]"
          aria-label="Year"
        />
      </div>

      {/* Active powers */}
      <h2 className="mt-10 font-display text-2xl">
        Powers active in {formatYear(year)}{' '}
        <span className="font-mono text-sm text-secondary">({active.length})</span>
      </h2>
      {active.length === 0 ? (
        <p className="mt-4 text-sm text-secondary">
          No profiled great power spans this year — but history never stops. Ask the
          AI Historian what the world looked like.
        </p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((c) => (
            <Link
              key={c.id}
              href={`/civilizations/${c.id}`}
              className="glass-card group p-6 transition-all hover:border-gold-border"
            >
              <div className="flex items-center gap-2 text-xs text-secondary">
                <MapPin size={13} className="text-gold" /> {c.region}
              </div>
              <h3 className="mt-2 font-display text-xl">{c.name}</h3>
              <p className="mt-1 font-mono text-xs text-gold">{c.era}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs text-gold opacity-0 transition-opacity group-hover:opacity-100">
                Open profile <ArrowRight size={11} />
              </span>
            </Link>
          ))}
        </div>
      )}

      <Link
        href={`/historian?q=${encodeURIComponent(`Describe the geopolitical map of the world in ${formatYear(year)}: major powers, borders, trade routes, and conflicts.`)}`}
        className="btn-gold mt-10 inline-flex"
      >
        <Sparkles size={15} /> AI briefing: the world in {formatYear(year)}
      </Link>
    </div>
  );
}
