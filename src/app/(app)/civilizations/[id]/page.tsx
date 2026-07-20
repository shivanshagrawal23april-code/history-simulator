import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Sparkles, Crown, Church, Coins, Swords, Palette, TrendingDown, Award } from 'lucide-react';
import { CIVILIZATIONS, getCivilization } from '@/lib/data/civilizations';
import { formatYear } from '@/lib/utils';

interface Props {
  params: { id: string };
}

export function generateStaticParams() {
  return CIVILIZATIONS.map((c) => ({ id: c.id }));
}

export function generateMetadata({ params }: Props): Metadata {
  const civ = getCivilization(params.id);
  return { title: civ ? civ.name : 'Civilization' };
}

export default function CivilizationDetailPage({ params }: Props) {
  const civ = getCivilization(params.id);
  if (!civ) notFound();

  const sections = [
    { icon: Crown, title: 'Government', text: civ.government },
    { icon: Church, title: 'Religion', text: civ.religion },
    { icon: Coins, title: 'Economy', text: civ.economy },
    { icon: Swords, title: 'Military', text: civ.military },
    { icon: Palette, title: 'Culture', text: civ.culture },
    { icon: TrendingDown, title: 'Collapse', text: civ.collapse },
    { icon: Award, title: 'Legacy', text: civ.legacy },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/civilizations" className="inline-flex items-center gap-2 text-xs text-secondary hover:text-primary">
        <ArrowLeft size={13} /> All civilizations
      </Link>
      <p className="section-label mt-6">{civ.era}</p>
      <h1 className="mt-2 font-display text-5xl">{civ.name}</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-secondary">{civ.summary}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          ['Region', civ.region],
          ['Capital', civ.capital],
          ['Peak population', civ.peakPopulation],
        ].map(([k, v]) => (
          <div key={k} className="glass-card p-5">
            <p className="text-[10px] uppercase tracking-wider text-secondary">{k}</p>
            <p className="mt-1 text-sm">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {sections.map(({ icon: Icon, title, text }) => (
          <div key={title} className="glass-card p-6">
            <div className="flex items-center gap-2">
              <Icon size={16} className="text-gold" />
              <h2 className="font-display text-lg">{title}</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-secondary">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <h2 className="font-display text-lg">Key leaders</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {civ.keyLeaders.map((l) => (
              <Link
                key={l}
                href={`/historian?q=${encodeURIComponent(`Tell me about ${l} of ${civ.name}`)}`}
                className="rounded-full border border-line px-4 py-1.5 text-xs text-secondary transition-all hover:border-gold-border hover:text-primary"
              >
                {l}
              </Link>
            ))}
          </div>
        </div>
        <div className="glass-card p-6">
          <h2 className="font-display text-lg">Key events</h2>
          <ol className="mt-4 space-y-3 border-l border-line pl-5">
            {civ.keyEvents.map((e) => (
              <li key={e.title} className="relative">
                <span className="absolute -left-[23px] top-1.5 h-2 w-2 rounded-full bg-gold" aria-hidden />
                <span className="font-mono text-xs text-gold">{formatYear(e.year)}</span>
                <p className="text-sm text-secondary">{e.title}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <Link
        href={`/historian?q=${encodeURIComponent(`Give me a comprehensive analysis of ${civ.name}: rise, peak, decline, and modern legacy.`)}`}
        className="btn-gold mt-10 inline-flex"
      >
        <Sparkles size={15} /> Full AI analysis of {civ.name}
      </Link>
    </div>
  );
}
