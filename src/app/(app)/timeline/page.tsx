'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import {
  TIMELINE_EVENTS,
  CATEGORY_LABELS,
  type EventCategory,
} from '@/lib/data/timeline';
import { formatYear, cn } from '@/lib/utils';

const CATEGORIES = Object.keys(CATEGORY_LABELS) as EventCategory[];

const CATEGORY_COLORS: Record<EventCategory, string> = {
  war: 'bg-red-400',
  politics: 'bg-blue-400',
  science: 'bg-emerald-400',
  religion: 'bg-purple-400',
  economics: 'bg-amber-400',
  culture: 'bg-pink-400',
  technology: 'bg-cyan-400',
  exploration: 'bg-orange-400',
};

export default function TimelinePage() {
  const [filters, setFilters] = useState<Set<EventCategory>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);

  const events = useMemo(() => {
    const sorted = [...TIMELINE_EVENTS].sort((a, b) => a.year - b.year);
    if (filters.size === 0) return sorted;
    return sorted.filter((e) => filters.has(e.category));
  }, [filters]);

  const toggle = (c: EventCategory) => {
    setFilters((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <p className="section-label mb-2">Timeline Explorer</p>
      <h1 className="font-display text-4xl">Five millennia, one thread.</h1>
      <p className="mt-3 max-w-2xl text-secondary">
        {TIMELINE_EVENTS.length} pivotal events from the invention of writing to the
        World Wide Web. Filter by theme, click any event, and send it to the AI
        Historian for deep analysis.
      </p>

      {/* Filters */}
      <div className="mt-8 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => toggle(c)}
            className={cn(
              'flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs transition-all',
              filters.has(c)
                ? 'border-gold-border bg-gold-soft text-primary'
                : 'border-line text-secondary hover:text-primary',
            )}
            aria-pressed={filters.has(c)}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', CATEGORY_COLORS[c])} />
            {CATEGORY_LABELS[c]}
          </button>
        ))}
        {filters.size > 0 && (
          <button
            onClick={() => setFilters(new Set())}
            className="rounded-full px-3 py-1.5 text-xs text-gold underline underline-offset-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Timeline */}
      <ol className="relative mt-12 border-l border-line pl-8">
        {events.map((e) => {
          const isOpen = selected === e.id;
          return (
            <li key={e.id} className="relative mb-8">
              <span
                className={cn(
                  'absolute -left-[37px] top-1.5 h-3 w-3 rounded-full border-2 border-background',
                  CATEGORY_COLORS[e.category],
                )}
                aria-hidden
              />
              <button
                onClick={() => setSelected(isOpen ? null : e.id)}
                className="w-full text-left"
                aria-expanded={isOpen}
              >
                <span className="font-mono text-xs text-gold">{formatYear(e.year)}</span>
                <span className="ml-3 font-mono text-[10px] uppercase tracking-wider text-secondary">
                  {CATEGORY_LABELS[e.category]} · {e.region}
                </span>
                <h2
                  className={cn(
                    'mt-1 font-display text-xl transition-colors',
                    isOpen ? 'text-gold' : 'text-primary',
                  )}
                >
                  {e.title}
                </h2>
              </button>
              {isOpen && (
                <div className="glass-card mt-3 animate-slideUp p-5">
                  <p className="text-sm leading-relaxed text-secondary">{e.description}</p>
                  <Link
                    href={`/historian?q=${encodeURIComponent(`Give me a full historical analysis of: ${e.title} (${formatYear(e.year)})`)}`}
                    className="btn-ghost mt-4 !px-4 !py-2 text-xs"
                  >
                    <Sparkles size={13} /> Deep-dive with AI
                  </Link>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
