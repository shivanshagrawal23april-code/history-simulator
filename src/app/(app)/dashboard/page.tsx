import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, Clock, Landmark, Users, GitBranch, ArrowRight, CalendarDays } from 'lucide-react';
import { TIMELINE_EVENTS } from '@/lib/data/timeline';
import { CIVILIZATIONS } from '@/lib/data/civilizations';
import { FIGURES } from '@/lib/data/figures';
import { formatYear } from '@/lib/utils';

export const metadata: Metadata = { title: 'Dashboard' };

const TRENDING = [
  'Why did the Roman Empire really fall?',
  'What if Napoleon had won at Waterloo?',
  'How did the Silk Road shape the medieval world?',
  'Economic causes of the French Revolution',
  'The Mongol Empire\'s effect on global trade',
];

export default function DashboardPage() {
  const dayIndex = Math.floor(Date.now() / 86400000) % TIMELINE_EVENTS.length;
  const daily = TIMELINE_EVENTS[dayIndex];
  const figure = FIGURES[dayIndex % FIGURES.length];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <p className="section-label mb-2">Command Center</p>
      <h1 className="font-display text-4xl">Welcome back, historian.</h1>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [String(TIMELINE_EVENTS.length), 'timeline events', '/timeline'],
          [String(CIVILIZATIONS.length), 'civilizations', '/civilizations'],
          [String(FIGURES.length), 'historical figures', '/figures'],
          ['10', 'AI modes', '/historian'],
        ].map(([n, l, href]) => (
          <Link key={l} href={href} className="glass-card p-5 transition-all hover:border-gold-border">
            <p className="font-mono text-3xl text-gold">{n}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-secondary">{l}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Daily event */}
        <div className="glass-card p-7 lg:col-span-2">
          <div className="flex items-center gap-2 text-gold">
            <CalendarDays size={16} />
            <span className="section-label">Event of the day</span>
          </div>
          <p className="mt-4 font-mono text-sm text-gold">{formatYear(daily.year)}</p>
          <h2 className="mt-1 font-display text-2xl">{daily.title}</h2>
          <p className="mt-3 leading-relaxed text-secondary">{daily.description}</p>
          <Link
            href={`/historian?q=${encodeURIComponent(`Tell me everything about: ${daily.title} (${formatYear(daily.year)})`)}`}
            className="btn-ghost mt-6 !px-4 !py-2 text-xs"
          >
            <Sparkles size={14} /> Analyze with AI <ArrowRight size={12} />
          </Link>
        </div>

        {/* Figure of the day */}
        <div className="glass-card p-7">
          <div className="flex items-center gap-2 text-gold">
            <Users size={16} />
            <span className="section-label">Figure of the day</span>
          </div>
          <h2 className="mt-4 font-display text-2xl">{figure.name}</h2>
          <p className="mt-1 font-mono text-xs text-secondary">{figure.lived}</p>
          <p className="mt-3 text-sm leading-relaxed text-secondary">{figure.bio}</p>
          <Link href="/figures" className="mt-4 inline-flex items-center gap-1 text-xs text-gold">
            All figures <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Trending */}
        <div className="glass-card p-7">
          <span className="section-label">Trending questions</span>
          <ul className="mt-5 space-y-3">
            {TRENDING.map((q) => (
              <li key={q}>
                <Link
                  href={`/historian?q=${encodeURIComponent(q)}`}
                  className="group flex items-center gap-3 text-sm text-secondary transition-colors hover:text-primary"
                >
                  <Sparkles size={13} className="shrink-0 text-gold" />
                  <span className="flex-1">{q}</span>
                  <ArrowRight size={13} className="opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick launch */}
        <div className="glass-card p-7">
          <span className="section-label">Quick launch</span>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              { href: '/historian', label: 'AI Historian', icon: Sparkles },
              { href: '/timeline', label: 'Timeline', icon: Clock },
              { href: '/civilizations', label: 'Civilizations', icon: Landmark },
              { href: '/simulations', label: 'Simulations', icon: GitBranch },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="glass flex items-center gap-3 rounded-xl px-4 py-4 text-sm text-secondary transition-all hover:border-gold-border hover:text-primary"
              >
                <Icon size={17} className="text-gold" /> {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
