import type { Metadata } from 'next';
import Link from 'next/link';
import { GitBranch, ArrowRight } from 'lucide-react';

export const metadata: Metadata = { title: 'Simulation Lab' };

const SCENARIOS = [
  {
    title: 'What if Napoleon won at Waterloo?',
    tags: ['Military', 'Europe', '19th c.'],
    blurb: 'A restored French Empire faces the Seventh Coalition. Model the continental system, British finance, and the fate of nationalism.',
  },
  {
    title: 'What if Rome never fell?',
    tags: ['Empire', 'Longue durée'],
    blurb: 'Reformed legions hold the Rhine. Trace technology, Christianity, and the Mediterranean economy through an unbroken imperium.',
  },
  {
    title: 'What if Germany won WWII?',
    tags: ['Military', '20th c.', 'Global'],
    blurb: 'A dark counterfactual examined rigorously: logistics, atomic timelines, resistance movements, and cold wars that might have been.',
  },
  {
    title: 'What if the Mongols conquered Europe?',
    tags: ['Steppe', 'Medieval'],
    blurb: 'Subutai crosses the Danube in 1242 and no succession crisis calls him home. Feudal Europe meets the tumen system.',
  },
  {
    title: 'What if the Soviet Union never collapsed?',
    tags: ['Cold War', 'Economics'],
    blurb: 'Andropov-style reform succeeds. Model a surviving USSR through the information age, oil markets, and the internet.',
  },
  {
    title: 'What if the Library of Alexandria survived?',
    tags: ['Science', 'Knowledge'],
    blurb: 'Continuous transmission of ancient knowledge. Does the scientific revolution arrive a millennium early?',
  },
  {
    title: 'What if the Black Death never struck Europe?',
    tags: ['Demography', 'Economics'],
    blurb: 'No labor shortage, no wage revolution. Model serfdom, urbanization, and the timing of the Renaissance.',
  },
  {
    title: 'What if the American Revolution failed?',
    tags: ['Politics', '18th c.'],
    blurb: 'A British North America: dominion status, slavery\'s timeline, and the fate of the French Revolution without its example.',
  },
];

export default function SimulationsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <p className="section-label mb-2">Simulation Lab</p>
      <h1 className="font-display text-4xl">Alternate history, rigorously.</h1>
      <p className="mt-3 max-w-2xl text-secondary">
        Every scenario runs through a 23-point counterfactual framework — point of
        divergence, cascading effects across 0–100 years, winners and losers, and
        probability-weighted outcomes.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {SCENARIOS.map((s) => (
          <Link
            key={s.title}
            href={`/historian?mode=alternate&q=${encodeURIComponent(s.title)}`}
            className="glass-card group p-7 transition-all hover:border-gold-border hover:shadow-glow"
          >
            <GitBranch size={20} className="text-gold" />
            <h2 className="mt-4 font-display text-xl">{s.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary">{s.blurb}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {s.tags.map((t) => (
                <span key={t} className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[10px] text-secondary">
                  {t}
                </span>
              ))}
            </div>
            <span className="mt-5 inline-flex items-center gap-1 text-xs text-gold opacity-0 transition-opacity group-hover:opacity-100">
              Run simulation <ArrowRight size={12} />
            </span>
          </Link>
        ))}
      </div>
      <div className="glass-card mt-10 p-8 text-center">
        <h2 className="font-display text-2xl">Design your own divergence.</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-secondary">
          Open the AI Historian in Alternate History mode and pose any &quot;what if&quot; —
          the engine handles the rest.
        </p>
        <Link href="/historian?mode=alternate" className="btn-gold mt-6 inline-flex">
          Open Alternate History mode <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
