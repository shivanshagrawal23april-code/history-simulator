'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Clock, Landmark, Users, GitBranch, Network, Map, LayoutDashboard, Sparkles } from 'lucide-react';
import { CIVILIZATIONS } from '@/lib/data/civilizations';
import { FIGURES } from '@/lib/data/figures';

interface Item {
  label: string;
  hint: string;
  href: string;
  icon: React.ReactNode;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const items = useMemo<Item[]>(
    () => [
      { label: 'Dashboard', hint: 'Overview', href: '/dashboard', icon: <LayoutDashboard size={16} /> },
      { label: 'AI Historian', hint: 'Ask anything from history', href: '/historian', icon: <Sparkles size={16} /> },
      { label: 'Timeline Explorer', hint: '5,000 years of events', href: '/timeline', icon: <Clock size={16} /> },
      { label: 'Historical Atlas', hint: 'Maps and empires', href: '/atlas', icon: <Map size={16} /> },
      { label: 'Civilizations', hint: 'Rise and fall', href: '/civilizations', icon: <Landmark size={16} /> },
      { label: 'Historical Figures', hint: 'People who shaped history', href: '/figures', icon: <Users size={16} /> },
      { label: 'Simulation Lab', hint: 'Alternate history', href: '/simulations', icon: <GitBranch size={16} /> },
      { label: 'Knowledge Graph', hint: 'Connections', href: '/graph', icon: <Network size={16} /> },
      ...CIVILIZATIONS.map((c) => ({
        label: c.name,
        hint: c.era,
        href: `/civilizations/${c.id}`,
        icon: <Landmark size={16} />,
      })),
      ...FIGURES.map((f) => ({
        label: f.name,
        hint: f.role,
        href: `/figures#${f.id}`,
        icon: <Users size={16} />,
      })),
    ],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 8);
    return items
      .filter((i) => i.label.toLowerCase().includes(q) || i.hint.toLowerCase().includes(q))
      .slice(0, 10);
  }, [items, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 pt-[15vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="glass-card w-full max-w-xl animate-slideUp overflow-hidden bg-card/95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Search size={18} className="text-secondary" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, filtered.length - 1));
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === 'Enter' && filtered[active]) {
                go(filtered[active].href);
              }
            }}
            placeholder="Search history, pages, civilizations, figures…"
            className="flex-1 bg-transparent text-sm text-primary placeholder:text-secondary/60 focus:outline-none"
          />
          <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-secondary">
            ESC
          </kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-secondary">No results.</li>
          )}
          {filtered.map((item, i) => (
            <li key={item.href + item.label}>
              <button
                onClick={() => go(item.href)}
                onMouseEnter={() => setActive(i)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                  i === active ? 'bg-gold-soft text-primary' : 'text-secondary'
                }`}
              >
                <span className="text-gold">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                <span className="text-xs text-secondary/70">{item.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
