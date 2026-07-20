'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  Clock,
  Map,
  Landmark,
  Users,
  GitBranch,
  Network,
  Settings,
  CreditCard,
  Search,
  Menu,
  X,
  Scroll,
} from 'lucide-react';
import { CommandPalette } from '@/components/CommandPalette';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/historian', label: 'AI Historian', icon: Sparkles },
  { href: '/timeline', label: 'Timeline Explorer', icon: Clock },
  { href: '/atlas', label: 'Historical Atlas', icon: Map },
  { href: '/civilizations', label: 'Civilizations', icon: Landmark },
  { href: '/figures', label: 'Historical Figures', icon: Users },
  { href: '/simulations', label: 'Simulation Lab', icon: GitBranch },
  { href: '/graph', label: 'Knowledge Graph', icon: Network },
];

const FOOTER_NAV = [
  { href: '/pricing', label: 'Pricing', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function dispatchPalette() {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = (
    <>
      <nav className="flex-1 space-y-1 px-3" aria-label="Primary">
        {NAV.map(({ href, label, icon: Icon }) => {
          const activeLink = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                activeLink
                  ? 'bg-gold-soft text-primary'
                  : 'text-secondary hover:bg-white/[0.04] hover:text-primary',
              )}
              aria-current={activeLink ? 'page' : undefined}
            >
              <Icon size={17} className={activeLink ? 'text-gold' : ''} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-1 border-t border-line px-3 pt-3">
        {FOOTER_NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
              pathname === href
                ? 'bg-gold-soft text-primary'
                : 'text-secondary hover:bg-white/[0.04] hover:text-primary',
            )}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <CommandPalette />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-surface/60 py-6 backdrop-blur-xl lg:flex">
        <Link href="/" className="mb-8 flex items-center gap-2.5 px-6">
          <Scroll size={22} className="text-gold" />
          <span className="font-display text-lg tracking-wide">HistoryVersa</span>
        </Link>
        {navLinks}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-line bg-surface py-6">
            <div className="mb-8 flex items-center justify-between px-6">
              <Link href="/" className="flex items-center gap-2.5">
                <Scroll size={22} className="text-gold" />
                <span className="font-display text-lg">HistoryVersa</span>
              </Link>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X size={20} className="text-secondary" />
              </button>
            </div>
            {navLinks}
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-line bg-background/80 px-4 backdrop-blur-xl sm:px-6">
          <button
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} className="text-secondary" />
          </button>
          <button
            onClick={dispatchPalette}
            className="flex flex-1 max-w-md items-center gap-3 rounded-full border border-line bg-white/[0.03] px-4 py-2 text-sm text-secondary transition-colors hover:border-gold-border"
          >
            <Search size={15} />
            <span className="flex-1 text-left">Search history…</span>
            <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px]">
              Ctrl K
            </kbd>
          </button>
          <Link href="/historian" className="btn-gold hidden !px-4 !py-2 text-xs sm:inline-flex">
            <Sparkles size={14} />
            Ask the Historian
          </Link>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
