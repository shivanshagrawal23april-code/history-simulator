import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CIVILIZATIONS } from '@/lib/data/civilizations';

export const metadata: Metadata = { title: 'Civilizations' };

export default function CivilizationsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <p className="section-label mb-2">Civilization Module</p>
      <h1 className="font-display text-4xl">The great powers of history.</h1>
      <p className="mt-3 max-w-2xl text-secondary">
        Every civilization profiled across government, religion, economy, military,
        culture, collapse, and legacy.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CIVILIZATIONS.map((c) => (
          <Link
            key={c.id}
            href={`/civilizations/${c.id}`}
            className="glass-card group flex flex-col p-7 transition-all hover:border-gold-border hover:shadow-glow"
          >
            <p className="font-mono text-xs text-gold">{c.era}</p>
            <h2 className="mt-2 font-display text-2xl">{c.name}</h2>
            <p className="mt-1 text-xs text-secondary">{c.region}</p>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-secondary">{c.summary}</p>
            <span className="mt-5 inline-flex items-center gap-1 text-xs text-gold opacity-0 transition-opacity group-hover:opacity-100">
              Explore <ArrowRight size={12} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
