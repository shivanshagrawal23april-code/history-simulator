'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { CIVILIZATIONS } from '@/lib/data/civilizations';
import { FIGURES } from '@/lib/data/figures';
import { cn } from '@/lib/utils';

interface Node {
  id: string;
  label: string;
  type: 'civilization' | 'figure';
  x: number;
  y: number;
  href: string;
}

interface Edge {
  from: string;
  to: string;
}

export default function GraphPage() {
  const [hovered, setHovered] = useState<string | null>(null);

  const { nodes, edges } = useMemo(() => {
    const civNodes: Node[] = CIVILIZATIONS.map((c, i) => {
      const angle = (i / CIVILIZATIONS.length) * Math.PI * 2;
      return {
        id: `civ-${c.id}`,
        label: c.name,
        type: 'civilization' as const,
        x: 500 + Math.cos(angle) * 330,
        y: 400 + Math.sin(angle) * 280,
        href: `/civilizations/${c.id}`,
      };
    });
    const figNodes: Node[] = FIGURES.map((f, i) => {
      const angle = (i / FIGURES.length) * Math.PI * 2 + 0.26;
      return {
        id: `fig-${f.id}`,
        label: f.name,
        type: 'figure' as const,
        x: 500 + Math.cos(angle) * 170,
        y: 400 + Math.sin(angle) * 150,
        href: `/figures#${f.id}`,
      };
    });
    const allNodes = [...civNodes, ...figNodes];
    const edgeList: Edge[] = [];
    FIGURES.forEach((f) => {
      const civ = CIVILIZATIONS.find((c) => c.name === f.civilization);
      if (civ) edgeList.push({ from: `fig-${f.id}`, to: `civ-${civ.id}` });
    });
    // Chronological chain of civilizations
    const sorted = [...CIVILIZATIONS].sort((a, b) => a.startYear - b.startYear);
    for (let i = 0; i < sorted.length - 1; i++) {
      edgeList.push({ from: `civ-${sorted[i].id}`, to: `civ-${sorted[i + 1].id}` });
    }
    return { nodes: allNodes, edges: edgeList };
  }, []);

  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const connected = useMemo(() => {
    if (!hovered) return new Set<string>();
    const set = new Set<string>([hovered]);
    edges.forEach((e) => {
      if (e.from === hovered) set.add(e.to);
      if (e.to === hovered) set.add(e.from);
    });
    return set;
  }, [hovered, edges]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <p className="section-label mb-2">Knowledge Graph</p>
      <h1 className="font-display text-4xl">Everything connects.</h1>
      <p className="mt-3 max-w-2xl text-secondary">
        Civilizations linked chronologically; figures linked to the worlds they
        shaped. Hover to highlight connections, click to explore.
      </p>

      <div className="glass-card mt-8 overflow-hidden">
        <svg viewBox="0 0 1000 800" className="h-auto w-full" role="img" aria-label="Knowledge graph of civilizations and figures">
          {edges.map((e, i) => {
            const a = nodeById.get(e.from);
            const b = nodeById.get(e.to);
            if (!a || !b) return null;
            const active = hovered !== null && (e.from === hovered || e.to === hovered);
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={active ? '#D4AF37' : 'rgba(255,255,255,0.08)'}
                strokeWidth={active ? 1.5 : 1}
              />
            );
          })}
          {nodes.map((n) => {
            const dimmed = hovered !== null && !connected.has(n.id);
            return (
              <Link key={n.id} href={n.href}>
                <g
                  onMouseEnter={() => setHovered(n.id)}
                  onMouseLeave={() => setHovered(null)}
                  className="cursor-pointer"
                  opacity={dimmed ? 0.25 : 1}
                >
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={n.type === 'civilization' ? 10 : 6}
                    fill={n.type === 'civilization' ? '#D4AF37' : '#1B1B1B'}
                    stroke={n.type === 'civilization' ? 'none' : '#D4AF37'}
                    strokeWidth={1.5}
                  />
                  <text
                    x={n.x}
                    y={n.y - (n.type === 'civilization' ? 18 : 13)}
                    textAnchor="middle"
                    className={cn('font-sans', n.type === 'civilization' ? 'text-[15px]' : 'text-[12px]')}
                    fill={n.type === 'civilization' ? '#FFFFFF' : '#B0B0B0'}
                  >
                    {n.label}
                  </text>
                </g>
              </Link>
            );
          })}
        </svg>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-secondary">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-gold" /> Civilization
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full border border-gold bg-card" /> Historical figure
        </span>
        <Link href="/historian" className="ml-auto inline-flex items-center gap-1.5 text-gold">
          <Sparkles size={13} /> Ask the AI to map any connection
        </Link>
      </div>
    </div>
  );
}
