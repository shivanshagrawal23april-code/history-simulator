'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Clock,
  Map,
  Landmark,
  Users,
  GitBranch,
  Network,
  Scroll,
  ArrowRight,
  Quote,
  Check,
} from 'lucide-react';
import { TIMELINE_EVENTS } from '@/lib/data/timeline';
import { CIVILIZATIONS } from '@/lib/data/civilizations';
import { formatYear } from '@/lib/utils';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: 'easeOut' },
};

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI Historian',
    text: 'Ask absolutely anything from history. Streaming, sourced, confidence-scored answers with political, economic, and military context.',
    href: '/historian',
  },
  {
    icon: Clock,
    title: 'Timeline Explorer',
    text: 'Five millennia of interconnected events — filter by war, science, religion, economics, and trace causal chains across centuries.',
    href: '/timeline',
  },
  {
    icon: Map,
    title: 'Historical Atlas',
    text: 'Empires, trade routes, and battle lines rendered across time. Watch borders breathe over 5,000 years.',
    href: '/atlas',
  },
  {
    icon: Landmark,
    title: 'Civilizations',
    text: 'From Egypt to the USSR — economy, religion, military, culture, collapse, and legacy for every great power.',
    href: '/civilizations',
  },
  {
    icon: GitBranch,
    title: 'Simulation Lab',
    text: 'What if Napoleon won? A 23-point counterfactual engine models alternate histories with probability analysis.',
    href: '/simulations',
  },
  {
    icon: Network,
    title: 'Knowledge Graph',
    text: 'People, events, ideas, and empires as a living network. See how everything connects.',
    href: '/graph',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'The counterfactual engine is the most rigorous alternate-history tool I have used. It reads like a strategy briefing, not a chatbot.',
    name: 'Dr. Elena Vasquez',
    role: 'Professor of Modern History',
  },
  {
    quote:
      'HistoryVersa replaced four research tools for my documentary team. The timelines alone are worth the subscription.',
    name: 'Marcus Chen',
    role: 'Documentary Producer',
  },
  {
    quote:
      'My students finally see history as a system — causes, consequences, connections — rather than a list of dates.',
    name: 'Sarah Okafor',
    role: 'Head of Humanities',
  },
];

const FAQS = [
  {
    q: 'Is HistoryVersa a chatbot?',
    a: 'No. It is a historical intelligence platform. Every query produces structured analysis — timelines, context, figures, sources — not just conversation.',
  },
  {
    q: 'How accurate are the answers?',
    a: 'Answers distinguish [FACT], [SCHOLARLY CONSENSUS], [DEBATED], and [SPECULATION], attach confidence levels to major claims, and cite sources. The AI is instructed never to invent references.',
  },
  {
    q: 'What are simulations?',
    a: 'Rigorous counterfactuals. A 23-point framework models points of divergence, short/medium/long-term effects, winners and losers, and probability-weighted outcomes.',
  },
  {
    q: 'Can I use it for free?',
    a: 'Yes — the Free tier includes the AI Historian, timelines, and civilization library. Pro unlocks unlimited queries, simulations, and exports.',
  },
];

export default function LandingPage() {
  const timelineStrip = TIMELINE_EVENTS.filter((_, i) => i % 3 === 0);

  return (
    <div className="overflow-x-hidden">
      {/* Nav */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Scroll size={22} className="text-gold" />
            <span className="font-display text-lg tracking-wide">HistoryVersa</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-secondary md:flex" aria-label="Landing">
            <a href="#features" className="transition-colors hover:text-primary">Features</a>
            <a href="#timeline" className="transition-colors hover:text-primary">Timeline</a>
            <a href="#pricing" className="transition-colors hover:text-primary">Pricing</a>
            <a href="#faq" className="transition-colors hover:text-primary">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="btn-ghost !px-4 !py-2 text-xs">Sign in</Link>
            <Link href="/historian" className="btn-gold !px-4 !py-2 text-xs">Launch</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center bg-gold-radial px-6 pt-16">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {[...Array(24)].map((_, i) => (
            <span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-gold/30 animate-float"
              style={{
                left: `${(i * 41) % 100}%`,
                top: `${(i * 29) % 100}%`,
                animationDelay: `${(i % 8) * 0.9}s`,
                animationDuration: `${6 + (i % 5)}s`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.p {...fadeUp} className="section-label mb-6">
            Historical Intelligence · AI · Simulation
          </motion.p>
          <motion.h1
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="font-display text-5xl leading-tight sm:text-6xl lg:text-7xl"
          >
            The World&apos;s{' '}
            <span className="text-gold">Historical Intelligence</span> Platform
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-secondary"
          >
            Ask anything from five millennia of human history. Receive cinematic,
            sourced analysis — timelines, atlases, civilizations, figures, and
            rigorous alternate-history simulations.
          </motion.p>
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/historian" className="btn-gold animate-pulseGold">
              Ask the AI Historian <ArrowRight size={16} />
            </Link>
            <Link href="/timeline" className="btn-ghost">
              Explore the Timeline
            </Link>
          </motion.div>
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.45 }}
            className="mt-16 grid grid-cols-3 gap-6"
          >
            {[
              ['5,000+', 'years covered'],
              ['23-point', 'counterfactual engine'],
              ['10', 'AI intelligence modes'],
            ].map(([n, l]) => (
              <div key={l} className="glass-card px-4 py-5">
                <p className="font-mono text-2xl text-gold">{n}</p>
                <p className="mt-1 text-xs text-secondary">{l}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Scrolling timeline strip */}
      <section id="timeline" className="border-y border-line bg-surface/50 py-6">
        <div className="flex gap-10 overflow-x-auto px-6 pb-2 [scrollbar-width:thin]">
          {timelineStrip.map((e) => (
            <Link
              key={e.id}
              href="/timeline"
              className="group flex shrink-0 flex-col gap-1"
            >
              <span className="font-mono text-xs text-gold">{formatYear(e.year)}</span>
              <span className="whitespace-nowrap text-sm text-secondary transition-colors group-hover:text-primary">
                {e.title}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-28">
        <motion.div {...fadeUp} className="mb-16 text-center">
          <p className="section-label mb-4">Capabilities</p>
          <h2 className="font-display text-4xl sm:text-5xl">
            One platform. Every dimension of history.
          </h2>
        </motion.div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: (i % 3) * 0.1 }}
            >
              <Link
                href={f.href}
                className="glass-card group block h-full p-8 transition-all hover:border-gold-border hover:shadow-glow"
              >
                <f.icon size={26} className="text-gold" />
                <h3 className="mt-5 font-display text-xl">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-secondary">{f.text}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-xs text-gold opacity-0 transition-opacity group-hover:opacity-100">
                  Open <ArrowRight size={12} />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Civilizations marquee */}
      <section className="border-y border-line bg-surface/40 py-20">
        <motion.div {...fadeUp} className="mx-auto max-w-7xl px-6 text-center">
          <p className="section-label mb-4">The Great Powers</p>
          <h2 className="font-display text-3xl sm:text-4xl">Every empire. Rise and fall.</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {CIVILIZATIONS.map((c) => (
              <Link
                key={c.id}
                href={`/civilizations/${c.id}`}
                className="rounded-full border border-line bg-white/[0.03] px-5 py-2 text-sm text-secondary transition-all hover:border-gold-border hover:text-primary"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <motion.p {...fadeUp} className="section-label mb-4 text-center">
          Trusted by historians, educators, storytellers
        </motion.p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.1 }}
              className="glass-card p-8"
            >
              <Quote size={20} className="text-gold" />
              <blockquote className="mt-4 text-sm leading-relaxed text-secondary">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6">
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-secondary">{t.role}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-y border-line bg-surface/40 px-6 py-28">
        <motion.div {...fadeUp} className="mb-16 text-center">
          <p className="section-label mb-4">Pricing</p>
          <h2 className="font-display text-4xl sm:text-5xl">Simple, honest tiers.</h2>
        </motion.div>
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {[
            {
              name: 'Free',
              price: '$0',
              features: ['AI Historian (limited)', 'Timeline Explorer', 'Civilization library', 'Command palette'],
              cta: 'Start free',
              featured: false,
            },
            {
              name: 'Pro',
              price: '$16',
              features: ['Unlimited AI queries', 'All 10 intelligence modes', 'Simulation Lab', 'Exports (PDF / Markdown)', 'Priority streaming'],
              cta: 'Go Pro',
              featured: true,
            },
            {
              name: 'Enterprise',
              price: 'Custom',
              features: ['Team workspaces', 'SSO & admin controls', 'API access', 'Dedicated support'],
              cta: 'Contact us',
              featured: false,
            },
          ].map((tier, i) => (
            <motion.div
              key={tier.name}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.1 }}
              className={`glass-card flex flex-col p-8 ${
                tier.featured ? 'border-gold-border shadow-glow' : ''
              }`}
            >
              <p className="font-display text-lg">{tier.name}</p>
              <p className="mt-3 font-mono text-4xl text-gold">
                {tier.price}
                {tier.price.startsWith('$') && tier.price !== '$0' && (
                  <span className="text-sm text-secondary">/mo</span>
                )}
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-secondary">
                    <Check size={15} className="mt-0.5 shrink-0 text-gold" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className={`mt-8 ${tier.featured ? 'btn-gold' : 'btn-ghost'} w-full`}
              >
                {tier.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-28">
        <motion.div {...fadeUp} className="mb-12 text-center">
          <p className="section-label mb-4">FAQ</p>
          <h2 className="font-display text-4xl">Questions, answered.</h2>
        </motion.div>
        <div className="space-y-4">
          {FAQS.map((f, i) => (
            <motion.details
              key={f.q}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.05 }}
              className="glass-card group p-6"
            >
              <summary className="cursor-pointer list-none font-medium marker:hidden">
                {f.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-secondary">{f.a}</p>
            </motion.details>
          ))}
        </div>
      </section>

      {/* CTA + Footer */}
      <section className="border-t border-line bg-gold-radial px-6 py-28 text-center">
        <motion.h2 {...fadeUp} className="font-display text-4xl sm:text-5xl">
          History is waiting.
        </motion.h2>
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}>
          <Link href="/historian" className="btn-gold mt-10 inline-flex">
            Ask your first question <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>
      <footer className="border-t border-line px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-secondary">
            <Scroll size={16} className="text-gold" /> HistoryVersa © {new Date().getFullYear()}
          </div>
          <nav className="flex gap-6 text-xs text-secondary" aria-label="Footer">
            <Link href="/pricing" className="hover:text-primary">Pricing</Link>
            <Link href="/settings" className="hover:text-primary">Settings</Link>
            <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
