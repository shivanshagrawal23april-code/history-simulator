import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';

export const metadata: Metadata = { title: 'Pricing' };

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      '20 AI Historian queries / month',
      'Timeline Explorer',
      'Civilization & figure library',
      'Historical Atlas',
      'Command palette search',
    ],
    cta: 'Current plan',
    featured: false,
  },
  {
    name: 'Pro',
    price: '$16',
    period: 'per month',
    features: [
      'Unlimited AI queries',
      'All 10 intelligence modes',
      'Simulation Lab — full counterfactual engine',
      'Knowledge Graph',
      'Exports: PDF, Markdown, Word',
      'Priority streaming',
    ],
    cta: 'Upgrade to Pro',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'annual billing',
    features: [
      'Team workspaces & shared collections',
      'SSO / SAML & admin dashboard',
      'API access',
      'Custom AI model routing',
      'Dedicated support & SLA',
    ],
    cta: 'Contact sales',
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <p className="section-label mb-2">Pricing</p>
      <h1 className="font-display text-4xl">Choose your depth of history.</h1>
      <p className="mt-3 max-w-2xl text-secondary">
        Start free. Upgrade when you need unlimited intelligence. Billing is powered
        by Stripe and can be managed from Settings.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`glass-card flex flex-col p-8 ${tier.featured ? 'border-gold-border shadow-glow' : ''}`}
          >
            {tier.featured && <span className="section-label mb-3">Most popular</span>}
            <h2 className="font-display text-xl">{tier.name}</h2>
            <p className="mt-3 font-mono text-4xl text-gold">{tier.price}</p>
            <p className="mt-1 text-xs text-secondary">{tier.period}</p>
            <ul className="mt-6 flex-1 space-y-3">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-secondary">
                  <Check size={15} className="mt-0.5 shrink-0 text-gold" /> {f}
                </li>
              ))}
            </ul>
            <Link
              href="/settings"
              className={`mt-8 w-full ${tier.featured ? 'btn-gold' : 'btn-ghost'}`}
            >
              {tier.cta} <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
