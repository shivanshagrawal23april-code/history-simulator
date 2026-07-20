import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, Quote, Trophy, AlertTriangle } from 'lucide-react';
import { FIGURES } from '@/lib/data/figures';

export const metadata: Metadata = { title: 'Historical Figures' };

export default function FiguresPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <p className="section-label mb-2">Historical Figures</p>
      <h1 className="font-display text-4xl">The people who moved history.</h1>
      <p className="mt-3 max-w-2xl text-secondary">
        Biographies, achievements, failures, and legacies — or speak with any of them
        in-character through the AI Historian&apos;s Figure mode.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {FIGURES.map((f) => (
          <article key={f.id} id={f.id} className="glass-card scroll-mt-24 p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-gold">{f.lived}</p>
                <h2 className="mt-1 font-display text-2xl">{f.name}</h2>
                <p className="mt-0.5 text-xs text-secondary">
                  {f.role} · {f.civilization}
                </p>
              </div>
              <Link
                href={`/historian?q=${encodeURIComponent(`I'd like to speak with ${f.name} in character.`)}`}
                className="btn-ghost shrink-0 !px-3 !py-2 text-xs"
                aria-label={`Chat with ${f.name}`}
              >
                <Sparkles size={13} /> Speak
              </Link>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-secondary">{f.bio}</p>
            <blockquote className="mt-4 flex gap-2 border-l-2 border-gold pl-3 text-sm italic text-secondary">
              <Quote size={13} className="mt-1 shrink-0 text-gold" /> {f.quote}
            </blockquote>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-secondary">
                  <Trophy size={11} className="text-gold" /> Achievements
                </p>
                <ul className="mt-2 space-y-1.5 text-xs text-secondary">
                  {f.achievements.map((a) => (
                    <li key={a}>· {a}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-secondary">
                  <AlertTriangle size={11} className="text-gold" /> Failures
                </p>
                <ul className="mt-2 space-y-1.5 text-xs text-secondary">
                  {f.failures.map((a) => (
                    <li key={a}>· {a}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-secondary">
              <span className="text-gold">Legacy —</span> {f.legacy}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
