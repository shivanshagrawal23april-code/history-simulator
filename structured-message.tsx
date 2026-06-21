import { useMemo, useState, createContext, useContext } from "react";
import {
  Copy,
  Check,
  Share2,
  Download,
  FileText,
  BookOpen,
  Landmark,
  Users as UsersIcon,
  Cpu,
  Swords,
  Scale,
  Library,
  CalendarDays,
  Trophy,
  Sparkles,
  ListChecks,
  GitBranch,
  Brain,
  ShieldCheck,
  Layers as LayersIcon,
  MessagesSquare,
  ExternalLink,
  HelpCircle,
  Info,
  Globe2,
} from "lucide-react";


import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { MessageResponse } from "@/components/ai-elements/message";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Section = { id: string; title: string; body: string };

const KNOWN_SECTIONS: Array<{ key: string; title: string; icon: typeof FileText }> = [
  { key: "reasoning", title: "Reasoning", icon: Brain },
  { key: "overview", title: "Overview", icon: FileText },
  { key: "detailed analysis", title: "Detailed Analysis", icon: BookOpen },
  { key: "layers", title: "Layers", icon: LayersIcon },
  { key: "confidence", title: "Confidence", icon: ShieldCheck },
  { key: "competing", title: "Competing Views", icon: MessagesSquare },
  { key: "scenarios", title: "Scenarios", icon: GitBranch },
  { key: "network", title: "Network", icon: Globe2 },
  { key: "timeline", title: "Timeline", icon: CalendarDays },
  { key: "economy", title: "Economy", icon: BookOpen },
  { key: "society", title: "Society", icon: UsersIcon },
  { key: "politics", title: "Politics", icon: Landmark },
  { key: "technology", title: "Technology", icon: Cpu },
  { key: "military", title: "Military", icon: Swords },
  { key: "winners", title: "Winners & Losers", icon: Trophy },
  { key: "butterfly", title: "Butterfly Effects", icon: Sparkles },
  { key: "assumptions", title: "Assumptions", icon: ListChecks },
  { key: "pros", title: "Pros & Cons", icon: Scale },
  { key: "sources", title: "Sources", icon: Library },
];

// ---------- Source parsing & citation context ----------

type SourceRecord = {
  n: number;
  title: string;
  author?: string;
  publisher?: string;
  year?: string;
  type?: string;
  reliability?: number;
  url?: string;
  raw: string;
};

const SourcesContext = createContext<SourceRecord[]>([]);

function parseSources(body: string): SourceRecord[] {
  const out: SourceRecord[] = [];
  const lines = body.split("\n");
  for (const line of lines) {
    const m = /^\s*(\d+)\.\s+(.+)$/.exec(line);
    if (!m) continue;
    const n = parseInt(m[1], 10);
    const raw = m[2].trim();
    const parts = raw.split("|").map((p) => p.trim());
    const rec: SourceRecord = { n, title: parts[0] ?? raw, raw };
    for (const p of parts.slice(1)) {
      const rel = /Reliability\s*:?\s*(\d{1,3})/i.exec(p);
      const url = /^(https?:\/\/\S+|URL\s*:?\s*(.+))$/i.exec(p);
      if (rel) { rec.reliability = Math.min(100, parseInt(rel[1], 10)); continue; }
      if (/^URL\s*:/i.test(p)) {
        const v = p.replace(/^URL\s*:?\s*/i, "").trim();
        if (v && v.toLowerCase() !== "n/a") rec.url = v;
        continue;
      }
      if (url) { rec.url = url[1]; continue; }
      if (/^\d{3,4}(\s*[-–]\s*\d{2,4})?$/.test(p) || /^c\.\s*\d/i.test(p)) { rec.year = p; continue; }
      if (/Book|Journal|Paper|Document|Archive|Museum|Encyclopedia|Database|Record/i.test(p) && !rec.type) {
        rec.type = p; continue;
      }
      if (!rec.author) rec.author = p;
      else if (!rec.publisher) rec.publisher = p;
    }
    out.push(rec);
  }
  return out;
}

// Render text with clickable [n] citation markers
function CitedText({ children }: { children: string }) {
  const sources = useContext(SourcesContext);
  if (!children) return null;
  // Split keeping [n] markers
  const parts = children.split(/(\[\d+\])/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = /^\[(\d+)\]$/.exec(p);
        if (!m) return <span key={i}>{p}</span>;
        const n = parseInt(m[1], 10);
        const src = sources.find((s) => s.n === n);
        if (!src) return <sup key={i} className="text-muted-foreground">[{n}]</sup>;
        return (
          <Popover key={i}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="mx-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-md border border-[color:var(--accent-amber)]/40 bg-[color:var(--accent-amber)]/10 px-1 align-super text-[9px] font-bold text-[color:var(--accent-amber)] transition hover:bg-[color:var(--accent-amber)]/20"
                aria-label={`Source ${n}`}
              >
                {n}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 text-xs">
              <SourceCardCompact src={src} />
            </PopoverContent>
          </Popover>
        );
      })}
    </>
  );
}

function SourceCardCompact({ src }: { src: SourceRecord }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Source [{src.n}]</div>
        {typeof src.reliability === "number" && <ReliabilityPill score={src.reliability} />}
      </div>
      <div className="text-sm font-semibold leading-snug">{src.title}</div>
      <div className="space-y-0.5 text-[11px] text-muted-foreground">
        {src.author && <div>{src.author}</div>}
        {(src.publisher || src.year) && <div>{[src.publisher, src.year].filter(Boolean).join(" · ")}</div>}
        {src.type && <div className="italic">{src.type}</div>}
      </div>
      {src.url && (
        <a href={src.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-[color:var(--accent-amber)] hover:underline">
          Open source <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

function ReliabilityPill({ score }: { score: number }) {
  const tone =
    score >= 85 ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" :
    score >= 65 ? "border-amber-500/40 bg-amber-500/10 text-amber-300" :
    "border-red-500/40 bg-red-500/10 text-red-300";
  return <span className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[9px] ${tone}`}>● {score}/100</span>;
}

// Wraps MessageResponse to render [n] markers as popovers AFTER markdown rendering.
// We use a lightweight approach: only intercept top-level text where possible.
function CitedProse({ children }: { children: string }) {
  // Pre-process: replace [n] with a unique HTML-safe marker then re-render via segments.
  // Simpler approach: render markdown via MessageResponse, then overlay-replace using regex on the raw text shown alongside.
  // To keep markdown formatting we render MessageResponse as-is — the [n] markers stay as text, but we ALSO render
  // a clickable strip of citations below the prose so users can jump to sources.
  const sources = useContext(SourcesContext);
  const cited = Array.from(new Set(Array.from(children.matchAll(/\[(\d+)\]/g)).map((m) => parseInt(m[1], 10))));
  return (
    <div className="space-y-2">
      <div className="prose prose-sm max-w-none text-[15px] leading-relaxed text-foreground dark:prose-invert">
        <MessageResponse>{children}</MessageResponse>
      </div>
      {cited.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {cited.map((n) => {
            const src = sources.find((s) => s.n === n);
            return (
              <Popover key={n}>
                <PopoverTrigger asChild>
                  <button type="button" className="inline-flex items-center gap-1 rounded-md border border-[color:var(--accent-amber)]/30 bg-[color:var(--accent-amber)]/5 px-1.5 py-0.5 font-mono text-[10px] text-[color:var(--accent-amber)] transition hover:bg-[color:var(--accent-amber)]/15">
                    [{n}] {src?.title?.slice(0, 28) ?? "source"}{src && src.title.length > 28 ? "…" : ""}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 text-xs">
                  {src ? <SourceCardCompact src={src} /> : <div>Source [{n}] not in list.</div>}
                </PopoverContent>
              </Popover>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Section parsing ----------

function parseSections(text: string): { intro: string; sections: Section[] } {
  const lines = text.split("\n");
  const sections: Section[] = [];
  let intro: string[] = [];
  let current: Section | null = null;
  for (const line of lines) {
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (m) {
      if (current) sections.push(current);
      const title = m[1].trim();
      current = { id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), title, body: "" };
    } else if (current) {
      current.body += line + "\n";
    } else {
      intro.push(line);
    }
  }
  if (current) sections.push(current);
  return { intro: intro.join("\n").trim(), sections };
}

function hasStructuredSections(sections: Section[]) {
  if (sections.length < 3) return false;
  const lower = sections.map((s) => s.title.toLowerCase());
  const match = KNOWN_SECTIONS.filter((k) =>
    lower.some((t) => t.includes(k.key) || k.key.includes(t))
  ).length;
  return match >= 3;
}

function iconForTitle(title: string) {
  const lower = title.toLowerCase();
  return (KNOWN_SECTIONS.find((k) => lower.includes(k.key))?.icon) ?? FileText;
}

function extractTable(body: string): { headers: string[]; rows: string[][] } | null {
  const lines = body.split("\n");
  for (let i = 0; i < lines.length - 1; i++) {
    if (/^\s*\|.+\|\s*$/.test(lines[i]) && /^\s*\|[\s\-:|]+\|\s*$/.test(lines[i + 1])) {
      const headers = lines[i].split("|").slice(1, -1).map((c) => c.trim());
      const rows: string[][] = [];
      for (let j = i + 2; j < lines.length; j++) {
        if (!/^\s*\|.+\|\s*$/.test(lines[j])) break;
        rows.push(lines[j].split("|").slice(1, -1).map((c) => c.trim()));
      }
      if (rows.length >= 2) return { headers, rows };
    }
  }
  return null;
}

function stripTable(body: string): string {
  const lines = body.split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    if (/^\s*\|.+\|\s*$/.test(lines[i]) && i + 1 < lines.length && /^\s*\|[\s\-:|]+\|\s*$/.test(lines[i + 1])) {
      i += 2;
      while (i < lines.length && /^\s*\|.+\|\s*$/.test(lines[i])) i++;
    } else { out.push(lines[i]); i++; }
  }
  return out.join("\n").trim();
}

function toNumber(v: string): number | null {
  const cleaned = v.replace(/[,%~≈]/g, "").trim();
  const m = /-?\d+(\.\d+)?/.exec(cleaned);
  return m ? parseFloat(m[0]) : null;
}

// ---------- Graph card with methodology + ELI12 ----------

function GraphCard({
  headers, rows, accent, prose,
}: { headers: string[]; rows: string[][]; accent: string; prose: string }) {
  const [eli, setEli] = useState(false);
  const methodologyMatch = /\*\*Methodology:\*\*\s*(.+?)(?:\n|$)/i.exec(prose);
  const graphSourceMatch = /\*\*Graph Source:\*\*\s*(.+?)(?:\n|$)/i.exec(prose);
  return (
    <div
      className="relative overflow-hidden rounded-2xl border-2 p-4 md:p-5"
      style={{
        borderColor: "rgba(180, 140, 80, 0.45)",
        background:
          "radial-gradient(ellipse at top left, rgba(245,222,179,0.10), transparent 60%), radial-gradient(ellipse at bottom right, rgba(180,120,60,0.08), transparent 65%), linear-gradient(180deg, rgba(245,235,210,0.06), rgba(120,90,50,0.04))",
        boxShadow: "inset 0 0 60px rgba(120,80,40,0.18), 0 1px 0 rgba(255,220,160,0.05)",
      }}
    >
      {/* Ornamental corner flourishes */}
      <div className="pointer-events-none absolute left-2 top-2 font-serif text-[18px] leading-none text-[color:rgba(200,160,90,0.55)]">❦</div>
      <div className="pointer-events-none absolute right-2 top-2 font-serif text-[18px] leading-none text-[color:rgba(200,160,90,0.55)]">❦</div>
      <div className="pointer-events-none absolute bottom-2 left-2 font-serif text-[18px] leading-none text-[color:rgba(200,160,90,0.55)]">❦</div>
      <div className="pointer-events-none absolute bottom-2 right-2 font-serif text-[18px] leading-none text-[color:rgba(200,160,90,0.55)]">❦</div>

      <div className="mb-3 border-b border-dashed pb-2 text-center" style={{ borderColor: "rgba(180,140,80,0.4)" }}>
        <div className="font-serif text-[10px] uppercase tracking-[0.4em] text-[color:rgba(210,180,120,0.85)]">
          ⚜ Royal Cartographer's Ledger ⚜
        </div>
        <div className="mt-0.5 font-serif text-[13px] italic text-foreground/85">
          Chronicle of {headers[0]} — {headers.slice(1).join(" · ")}
        </div>
      </div>

      <TableChart headers={headers} rows={rows} accent={accent} />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-dashed pt-2" style={{ borderColor: "rgba(180,140,80,0.35)" }}>
        <button
          type="button"
          onClick={() => setEli((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-serif text-[11px] italic text-[color:rgba(220,190,140,0.95)] transition hover:bg-[color:rgba(220,180,120,0.08)]"
          style={{ borderColor: "rgba(180,140,80,0.45)" }}
        >
          <HelpCircle className="h-3 w-3" />
          {eli ? "Hide scribe's note" : "Scribe's plain-tongue note"}
        </button>
        {graphSourceMatch && (
          <div className="font-serif text-[11px] italic text-[color:rgba(210,180,120,0.85)]">
            Folio source: <CitedText>{graphSourceMatch[1]}</CitedText>
          </div>
        )}
      </div>

      {methodologyMatch && (
        <div className="mt-2 flex items-start gap-2 rounded-lg border px-3 py-2 text-[11.5px] leading-relaxed text-foreground/85"
          style={{ borderColor: "rgba(180,140,80,0.35)", background: "rgba(120,90,50,0.06)" }}>
          <Info className="mt-0.5 h-3 w-3 shrink-0 text-[color:rgba(220,190,140,0.95)]" />
          <div className="font-serif italic">
            <span className="not-italic font-semibold text-foreground">Methodology of the Chroniclers:</span> {methodologyMatch[1]}
          </div>
        </div>
      )}
      {eli && (
        <div className="mt-2 rounded-lg border p-3 font-serif text-[12.5px] italic leading-relaxed text-foreground/90"
          style={{ borderColor: "rgba(220,180,120,0.5)", background: "rgba(220,180,120,0.06)" }}>
          <div className="mb-1 not-italic font-mono text-[10px] uppercase tracking-[0.3em] text-[color:rgba(220,190,140,0.95)]">Scribe's note</div>
          <SimpleGraphExplain headers={headers} rows={rows} />
        </div>
      )}
    </div>
  );
}

function SimpleGraphExplain({ headers, rows }: { headers: string[]; rows: string[][] }) {
  const numericCol = headers.slice(1).find((h, i) => rows.every((r) => toNumber(r[i + 1]) !== null));
  if (!numericCol) {
    return <div>This table compares <strong>{headers.join(", ")}</strong> across {rows.length} entries so you can spot patterns at a glance.</div>;
  }
  const idx = headers.indexOf(numericCol);
  const values = rows.map((r) => toNumber(r[idx]) ?? 0);
  const first = values[0]; const last = values[values.length - 1];
  const delta = last - first;
  const direction = delta > 0 ? "went up" : delta < 0 ? "went down" : "stayed about the same";
  const pct = first !== 0 ? Math.round((delta / Math.abs(first)) * 100) : 0;
  return (
    <div>
      Between <strong>{rows[0][0]}</strong> and <strong>{rows[rows.length - 1][0]}</strong>,
      {" "}<strong>{numericCol}</strong> {direction} by about <strong>{Math.abs(pct)}%</strong>.
      This is one of the biggest signals in the table — historians use this kind of trend to argue about what changed and why.
    </div>
  );
}

function TableChart({ headers, rows, accent: _accent }: { headers: string[]; rows: string[][]; accent: string }) {
  const data = rows.map((r) => {
    const obj: Record<string, string | number> = {};
    headers.forEach((h, i) => {
      const raw = r[i] ?? "";
      const num = toNumber(raw);
      obj[h] = i === 0 ? raw : num ?? raw;
    });
    return obj;
  });

  const numericKeys = headers.slice(1).filter((h) => data.every((d) => typeof d[h] === "number"));

  // Manuscript ink palette — sepia, burgundy, forest, indigo, gold.
  const inkPalette = ["#7a3b1f", "#8a1a2b", "#2f5d3a", "#243b6b", "#a87a1d"];
  const gridColor = "rgba(150,110,60,0.25)";
  const axisColor = "rgba(120,80,40,0.9)";
  const tooltipStyle = {
    background: "rgba(248,238,210,0.97)",
    border: "1px solid rgba(150,110,60,0.45)",
    borderRadius: 6,
    fontSize: 12,
    color: "#3b2410",
    fontFamily: "Georgia, 'Times New Roman', serif",
  } as const;

  if (numericKeys.length === 0) {
    return (
      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "rgba(180,140,80,0.4)", background: "rgba(240,225,195,0.06)" }}>
        <table className="w-full font-serif text-[12.5px] text-foreground/90">
          <thead style={{ background: "rgba(150,110,60,0.12)", color: "rgba(220,190,140,0.95)" }}>
            <tr>{headers.map((h) => <th key={h} className="px-3 py-2 text-left font-serif italic tracking-wider text-[11px] uppercase">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t" style={{ borderColor: "rgba(180,140,80,0.25)" }}>
                {r.map((c, j) => <td key={j} className="px-3 py-2">{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const useBar = numericKeys.length === 1;

  return (
    <div className="rounded-lg border p-3" style={{ borderColor: "rgba(180,140,80,0.4)", background: "rgba(240,225,195,0.04)" }}>
      <div className="mb-2 flex items-center justify-between font-serif text-[11px] italic text-[color:rgba(210,180,120,0.9)]">
        <span>Hand-inked {useBar ? "bar" : "line"} chronograph</span>
        <span>hover a mark to read the entry</span>
      </div>
      <div className="h-64 w-full" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
        <ResponsiveContainer>
          {useBar ? (
            <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke={gridColor} />
              <XAxis dataKey={headers[0]} stroke={axisColor} fontSize={11} tick={{ fill: axisColor }} />
              <YAxis stroke={axisColor} fontSize={11} tick={{ fill: axisColor }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(150,110,60,0.08)" }} />
              <Legend wrapperStyle={{ fontSize: 11, fontStyle: "italic", color: "rgba(210,180,120,0.95)" }} />
              <Bar dataKey={numericKeys[0]} fill={inkPalette[0]} stroke="rgba(60,30,10,0.6)" strokeWidth={1} radius={[2, 2, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke={gridColor} />
              <XAxis dataKey={headers[0]} stroke={axisColor} fontSize={11} tick={{ fill: axisColor }} />
              <YAxis stroke={axisColor} fontSize={11} tick={{ fill: axisColor }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, fontStyle: "italic", color: "rgba(210,180,120,0.95)" }} />
              {numericKeys.map((k, i) => (
                <Line
                  key={k}
                  type="monotone"
                  dataKey={k}
                  stroke={inkPalette[i % inkPalette.length]}
                  strokeWidth={2}
                  strokeDasharray={i === 0 ? "0" : i === 1 ? "5 3" : i === 2 ? "2 3" : "6 2 2 2"}
                  dot={{ r: 3, stroke: "rgba(60,30,10,0.7)", strokeWidth: 1, fill: inkPalette[i % inkPalette.length] }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}


function ConfidenceBadge({ label }: { label: string }) {
  const colors: Record<string, string> = {
    low: "bg-red-500/15 text-red-300 border-red-500/30",
    medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    high: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    "very high": "bg-emerald-500/20 text-emerald-200 border-emerald-500/40",
  };
  const key = label.toLowerCase();
  const cls = colors[key] ?? "bg-muted text-muted-foreground border-border";
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${cls}`}>● {label}</span>;
}

// ---------- Panels ----------

function OverviewPanel({ body }: { body: string }) {
  const m = /\*\*Most Likely Outcome:\*\*\s*(.+?)\s*(?:—|--)\s*\*\*Confidence:\*\*\s*(Low|Medium|High|Very High)/i.exec(body);
  const rest = m ? body.replace(m[0], "").trim() : body.trim();
  return (
    <div className="space-y-4">
      <CitedProse>{rest}</CitedProse>
      {m && (
        <div className="rounded-xl border border-border bg-gradient-to-br from-card/80 to-card/40 p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Most likely outcome</div>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
            <div className="text-base font-medium">{m[1]}</div>
            <ConfidenceBadge label={m[2]} />
          </div>
        </div>
      )}
    </div>
  );
}

function DetailedAnalysisPanel({ body }: { body: string }) {
  // Split on ### sub-headings so each section becomes a labelled block.
  const parts = body.split(/^###\s+/m).map((p) => p.trim()).filter(Boolean);
  // If the very first chunk has no heading, treat it as intro prose.
  const intro = body.trim().startsWith("###") ? null : parts.shift() ?? null;
  const blocks = parts.map((p) => {
    const nl = p.indexOf("\n");
    const heading = nl === -1 ? p : p.slice(0, nl).trim();
    const content = nl === -1 ? "" : p.slice(nl + 1).trim();
    return { heading, content };
  });
  return (
    <div className="space-y-5">
      {intro && (
        <div className="rounded-xl border border-border/60 bg-background/30 p-4 text-[14px] leading-relaxed">
          <CitedProse>{intro}</CitedProse>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {blocks.map((b, i) => (
          <div key={i} className="rounded-xl border border-border/60 bg-background/40 p-4">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[color:var(--accent-amber)]">
              {b.heading}
            </div>
            <div className="text-[13.5px] leading-relaxed text-foreground/90">
              <CitedProse>{b.content}</CitedProse>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function LayersPanel({ body }: { body: string }) {
  const layers = [
    { key: "Explain Like I'm 12", short: "ELI12", tone: "from-emerald-500/15 to-emerald-500/5 border-emerald-500/30" },
    { key: "Student Level", short: "Student", tone: "from-blue-500/15 to-blue-500/5 border-blue-500/30" },
    { key: "University Level", short: "University", tone: "from-purple-500/15 to-purple-500/5 border-purple-500/30" },
    { key: "Historian Level", short: "Historian", tone: "from-amber-500/15 to-amber-500/5 border-amber-500/30" },
  ];
  const blocks = body.split(/^###\s+/m).filter(Boolean);
  const parsed = layers.map((l) => {
    const block = blocks.find((b) => b.toLowerCase().startsWith(l.key.toLowerCase()));
    const content = block ? block.slice(block.indexOf("\n") + 1).trim() : "";
    return { ...l, content };
  });
  const available = parsed.filter((p) => p.content);
  const [active, setActive] = useState(0);
  if (available.length === 0) {
    return <CitedProse>{body}</CitedProse>;
  }
  const cur = available[Math.min(active, available.length - 1)];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {available.map((p, i) => (
          <button
            key={p.key}
            onClick={() => setActive(i)}
            className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${
              i === active ? "border-foreground bg-foreground text-background" : "border-border bg-card/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.short}
          </button>
        ))}
      </div>
      <div className={`rounded-2xl border bg-gradient-to-br p-4 ${cur.tone}`}>
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{cur.key}</div>
        <CitedProse>{cur.content}</CitedProse>
      </div>
    </div>
  );
}

function ConfidencePanel({ body }: { body: string }) {
  const get = (label: string) => {
    const m = new RegExp(`\\*\\*${label}:\\*\\*\\s*([^\\n]+)`, "i").exec(body);
    return m?.[1]?.trim() ?? null;
  };
  const overall = get("Overall Confidence");
  const reason = get("Reason");
  const evidence = get("Evidence Score");
  const consensus = get("Consensus Score");
  const quality = get("Source Quality Score");
  const basedOn = get("Based On");
  const pct = (s: string | null) => {
    if (!s) return 0;
    const m = /(\d{1,3})/.exec(s);
    return m ? Math.min(100, parseInt(m[1], 10)) : 0;
  };
  const scores = [
    { label: "Evidence", value: pct(evidence), raw: evidence },
    { label: "Consensus", value: pct(consensus), raw: consensus },
    { label: "Source Quality", value: pct(quality), raw: quality },
  ];
  return (
    <div className="space-y-4">
      {overall && (
        <div className="rounded-2xl border border-border bg-gradient-to-br from-card/80 to-card/40 p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Overall confidence</div>
          <div className="mt-1 text-2xl font-bold">{overall}</div>
          {reason && <div className="mt-1 text-[13px] text-muted-foreground">{reason}</div>}
        </div>
      )}
      <div className="grid gap-2 sm:grid-cols-3">
        {scores.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-background/40 p-3">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>{s.label}</span><span>{s.value}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted/40">
              <div className="h-full bg-[color:var(--accent-amber)] transition-all duration-700" style={{ width: `${s.value}%` }} />
            </div>
          </div>
        ))}
      </div>
      {basedOn && (
        <div className="rounded-xl border border-border bg-background/40 p-3 text-[12px] text-muted-foreground">
          <span className="font-mono text-[10px] uppercase tracking-wider">Based on</span>
          <div className="mt-1 text-foreground">{basedOn}</div>
        </div>
      )}
    </div>
  );
}

function CompetingViewsPanel({ body }: { body: string }) {
  const blocks = body.split(/^###\s+/m).filter(Boolean);
  if (blocks.length === 0) return <CitedProse>{body}</CitedProse>;
  return (
    <div className="space-y-3">
      {blocks.map((b, i) => {
        const nl = b.indexOf("\n");
        const heading = nl >= 0 ? b.slice(0, nl) : b;
        const rest = nl >= 0 ? b.slice(nl + 1).trim() : "";
        const supportMatch = /Support:\s*~?(\d+)%/i.exec(heading);
        const sup = supportMatch ? parseInt(supportMatch[1], 10) : 0;
        const label = heading.replace(/\s*\(Support:.*\)/i, "");
        return (
          <div key={i} className="rounded-2xl border border-border bg-card/50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold">{label}</div>
              {sup > 0 && <span className="font-mono text-[10px] text-muted-foreground">Scholarly support · {sup}%</span>}
            </div>
            {sup > 0 && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted/40">
                <div className="h-full bg-blue-400 transition-all duration-700" style={{ width: `${sup}%` }} />
              </div>
            )}
            <div className="mt-3"><CitedProse>{rest}</CitedProse></div>
          </div>
        );
      })}
    </div>
  );
}

function ScenariosPanel({ body }: { body: string }) {
  const blocks = body.split(/^###\s+/m).filter(Boolean);
  if (blocks.length < 2) return <CitedProse>{body}</CitedProse>;
  const tones = [
    { label: "Most Likely", color: "from-emerald-500/15 to-emerald-500/5 border-emerald-500/30", bar: "bg-emerald-400" },
    { label: "Alternative", color: "from-blue-500/15 to-blue-500/5 border-blue-500/30", bar: "bg-blue-400" },
    { label: "Low-Probability", color: "from-purple-500/15 to-purple-500/5 border-purple-500/30", bar: "bg-purple-400" },
  ];
  const parsed = blocks.map((b, i) => {
    const firstLineEnd = b.indexOf("\n");
    const heading = firstLineEnd >= 0 ? b.slice(0, firstLineEnd) : b;
    const rest = firstLineEnd >= 0 ? b.slice(firstLineEnd + 1) : "";
    const probMatch = /Probability:\s*~?(\d+)%?/i.exec(heading);
    const prob = probMatch ? parseInt(probMatch[1], 10) : 0;
    return { heading, rest, prob, tone: tones[i] ?? tones[0] };
  });
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-background/40 p-3">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Probability distribution</div>
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted/40">
          {parsed.map((p, i) => (
            <div key={i} className={`${p.tone.bar} transition-all duration-700`} style={{ width: `${p.prob || 33}%` }} title={`${p.tone.label}: ${p.prob}%`} />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
          {parsed.map((p, i) => (
            <span key={i} className="inline-flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${p.tone.bar}`} />{p.tone.label} · {p.prob}%</span>
          ))}
        </div>
      </div>
      <EvidenceLegend />
      <div className="grid gap-4 md:grid-cols-3">
        {parsed.map((p, i) => (
          <div key={i} className={`rounded-2xl border bg-gradient-to-br p-4 ${p.tone.color}`}>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{p.tone.label}</div>
            <div className="mt-1 text-sm font-medium">
              {p.heading.replace(/\s*\(Probability:.*\)/i, "").replace(/^(Most Likely|Alternative|Low-Probability)\s*—\s*/i, "")}
            </div>
            {p.prob > 0 && (
              <div className="mt-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-background/40">
                  <div className={`h-full ${p.tone.bar} transition-all duration-700`} style={{ width: `${p.prob}%` }} />
                </div>
                <div className="mt-1 font-mono text-[10px] text-muted-foreground">{p.prob}% probability</div>
              </div>
            )}
            <div className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
              <CitedProse>{taggedProse(p.rest.trim())}</CitedProse>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EvidenceLegend() {
  return (
    <div className="flex flex-wrap gap-2 text-[10px]">
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />[FACT] — verified history</span>
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-300"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" />[PROJECTION] — evidence-based estimate</span>
      <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-red-300"><span className="h-1.5 w-1.5 rounded-full bg-red-400" />[SPECULATION] — uncertain</span>
    </div>
  );
}

// Replace evidence tags with colored inline pills (returned as markdown-safe HTML-ish text? we keep raw and let CSS handle)
function taggedProse(text: string): string {
  // Keep tags; CitedProse renders via markdown. We could swap to spans but markdown won't render arbitrary HTML safely here.
  return text;
}

function TimelinePanel({ body, accent }: { body: string; accent: string }) {
  const events: { year: string; text: string }[] = [];
  const intro: string[] = [];
  for (const line of body.split("\n")) {
    const m = /^\s*[-*]\s*\*\*([^*]+)\*\*\s*[—–-]\s*(.+)$/.exec(line);
    if (m) events.push({ year: m[1].trim(), text: m[2].trim() });
    else if (events.length === 0) intro.push(line);
  }
  if (events.length < 2) return <CitedProse>{body}</CitedProse>;
  return (
    <div className="space-y-4">
      {intro.join("\n").trim() && <CitedProse>{intro.join("\n").trim()}</CitedProse>}
      <ol className="relative space-y-3 border-l border-border/60 pl-6">
        {events.map((e, i) => (
          <li key={i} className="relative animate-in fade-in slide-in-from-left-2" style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}>
            <span className="absolute -left-[29px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background" style={{ background: accent }}>
              <span className="h-1.5 w-1.5 rounded-full bg-background" />
            </span>
            <div className="rounded-xl border border-border bg-card/50 p-3 transition hover:border-foreground/30 hover:bg-card/80">
              <div className="font-mono text-[11px] font-semibold uppercase tracking-wider" style={{ color: accent }}>{e.year}</div>
              <div className="mt-0.5 text-[14px] leading-relaxed text-foreground">
                <CitedText>{e.text}</CitedText>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function WinnersLosersPanel({ body }: { body: string }) {
  const winMatch = /\*\*Biggest Winners?:?\*\*([\s\S]*?)(?:\*\*Biggest Losers?:?\*\*|$)/i.exec(body);
  const loseMatch = /\*\*Biggest Losers?:?\*\*([\s\S]*?)$/i.exec(body);
  if (!winMatch && !loseMatch) return <CitedProse>{body}</CitedProse>;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
        <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-300"><Trophy className="h-3 w-3" /> Biggest Winners</div>
        <CitedProse>{(winMatch?.[1] ?? "").trim()}</CitedProse>
      </div>
      <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-4">
        <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-red-300"><Swords className="h-3 w-3" /> Biggest Losers</div>
        <CitedProse>{(loseMatch?.[1] ?? "").trim()}</CitedProse>
      </div>
    </div>
  );
}

function ReasoningPanel({ body, accent }: { body: string; accent: string }) {
  const agentsMatch = /\*\*Agents Activated:\*\*\s*([^\n]+)/i.exec(body);
  const agents = agentsMatch ? agentsMatch[1].split(/[,;]/).map((s) => s.trim()).filter(Boolean) : [];
  const stepsBlock = body.split(/\*\*Reasoning Steps:\*\*/i)[1] ?? "";
  const steps: { title: string; detail: string }[] = [];
  for (const line of stepsBlock.split("\n")) {
    const m = /^\s*\d+\.\s+([^—–-]+?)\s*[—–-]\s*(.+)$/.exec(line);
    if (m) steps.push({ title: m[1].trim(), detail: m[2].trim() });
  }
  return (
    <div className="space-y-5">
      {agents.length > 0 && (
        <div>
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Agents activated</div>
          <div className="flex flex-wrap gap-2">
            {agents.map((a, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-foreground animate-in fade-in slide-in-from-bottom-1" style={{ animationDelay: `${i * 70}ms`, animationFillMode: "both" }}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: accent }} />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
                </span>
                {a}
              </span>
            ))}
          </div>
        </div>
      )}
      {steps.length > 0 && (
        <div>
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Reasoning trace</div>
          <ol className="space-y-1.5">
            {steps.map((s, i) => (
              <li key={i} className="group flex gap-3 rounded-xl border border-border/70 bg-background/40 p-3 transition hover:border-foreground/30 hover:bg-card/70 animate-in fade-in slide-in-from-left-1" style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold" style={{ background: `${accent}22`, color: accent }}>{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-foreground">{s.title}</div>
                  <div className="text-[12px] leading-relaxed text-muted-foreground">{s.detail}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
      {agents.length === 0 && steps.length === 0 && <CitedProse>{body}</CitedProse>}
    </div>
  );
}

function SourcesPanel({ sources }: { sources: SourceRecord[] }) {
  const [filter, setFilter] = useState<string>("All");
  const types = ["All", ...Array.from(new Set(sources.map((s) => s.type).filter(Boolean) as string[]))];
  const filtered = filter === "All" ? sources : sources.filter((s) => s.type === filter);
  const avg = sources.length ? Math.round(sources.reduce((a, s) => a + (s.reliability ?? 0), 0) / sources.filter((s) => s.reliability).length || 0) : 0;
  if (sources.length === 0) {
    return <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">Insufficient Historical Evidence — no sources provided for this answer.</div>;
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {types.map((t) => (
            <button key={t} onClick={() => setFilter(t)} className={`rounded-full border px-2.5 py-1 text-[11px] transition ${filter === t ? "border-foreground bg-foreground text-background" : "border-border bg-card/50 text-muted-foreground hover:text-foreground"}`}>{t}</button>
          ))}
        </div>
        {avg > 0 && (
          <div className="font-mono text-[10px] text-muted-foreground">Avg reliability: <span className="text-foreground">{avg}/100</span></div>
        )}
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {filtered.map((s) => (
          <div key={s.n} className="rounded-xl border border-border bg-card/40 p-3 transition hover:border-[color:var(--accent-amber)]/40">
            <div className="flex items-start justify-between gap-2">
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">[{s.n}] {s.type ?? "Source"}</div>
              {typeof s.reliability === "number" && <ReliabilityPill score={s.reliability} />}
            </div>
            <div className="mt-1 text-sm font-semibold leading-snug">{s.title}</div>
            <div className="mt-0.5 space-y-0.5 text-[11px] text-muted-foreground">
              {s.author && <div>{s.author}</div>}
              {(s.publisher || s.year) && <div>{[s.publisher, s.year].filter(Boolean).join(" · ")}</div>}
            </div>
            {s.url && (
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] text-[color:var(--accent-amber)] hover:underline">
                Open source <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionPanel({ section, accent, sources }: { section: Section; accent: string; sources: SourceRecord[] }) {
  const lower = section.title.toLowerCase();
  if (lower.includes("reasoning")) return <ReasoningPanel body={section.body} accent={accent} />;
  if (lower.includes("overview")) return <OverviewPanel body={section.body} />;
  if (lower.includes("detailed")) return <DetailedAnalysisPanel body={section.body} />;
  if (lower.includes("layer")) return <LayersPanel body={section.body} />;
  if (lower.includes("confidence")) return <ConfidencePanel body={section.body} />;
  if (lower.includes("competing")) return <CompetingViewsPanel body={section.body} />;
  if (lower.includes("scenario")) return <ScenariosPanel body={section.body} />;
  if (lower.includes("network")) return <NetworkPanel body={section.body} accent={accent} />;
  if (lower.includes("timeline")) return <TimelinePanel body={section.body} accent={accent} />;
  if (lower.includes("winners") || lower.includes("losers")) return <WinnersLosersPanel body={section.body} />;
  if (lower.includes("source")) return <SourcesPanel sources={sources} />;


  const table = extractTable(section.body);
  const prose = table ? stripTable(section.body) : section.body;
  return (
    <div className="space-y-4">
      {prose.trim() && <CitedProse>{prose}</CitedProse>}
      {table && <GraphCard headers={table.headers} rows={table.rows} accent={accent} prose={section.body} />}
    </div>
  );
}

export function StructuredMessage({ text, accent }: { text: string; accent: string }) {
  const { intro, sections } = useMemo(() => parseSections(text), [text]);
  const structured = useMemo(() => hasStructuredSections(sections), [sections]);
  const sources = useMemo(() => {
    const sec = sections.find((s) => /source/i.test(s.title));
    return sec ? parseSources(sec.body) : [];
  }, [sections]);
  const [active, setActive] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Active tab is computed inside the tab block below to scope it to non-pinned sections.


  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); toast.success("Copied"); setTimeout(() => setCopied(false), 1600); }
    catch { toast.error("Could not copy"); }
  };
  const download = () => {
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `historyverse-dossier-${Date.now()}.md`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    toast.success("Downloaded");
  };
  const share = async () => {
    const shareData = { title: "HistoryVerse AI dossier", text: text.slice(0, 280), url: typeof window !== "undefined" ? window.location.href : "" };
    try {
      if (typeof navigator !== "undefined" && navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(shareData.url); toast.success("Link copied"); }
    } catch { /* cancelled */ }
  };

  if (!structured) {
    return (
      <SourcesContext.Provider value={sources}>
        <div className="space-y-4">
          <CitedProse>{text}</CitedProse>
          <ExportBar onCopy={copy} onShare={share} onDownload={download} copied={copied} />
        </div>
      </SourcesContext.Provider>
    );
  }

  const confMatch = /\*\*Overall Confidence:\*\*\s*(\d{1,3})%?\s*\(?(Low|Medium|High|Very High)?\)?/i.exec(text) ||
                    /\*\*Confidence:\*\*\s*(Low|Medium|High|Very High)/i.exec(text);
  const confLabel = confMatch ? (confMatch[2] || confMatch[1]) : null;
  const mostLikelyMatch = /\*\*Most Likely Outcome:\*\*\s*([^\n*]+?)(?:\s*[—-]\s*\*\*Confidence)/i.exec(text);
  const mostLikely = mostLikelyMatch?.[1]?.trim() ?? null;
  const agentsMatch = /\*\*Agents Activated:\*\*\s*([^\n]+)/i.exec(text);
  const agentCount = agentsMatch ? agentsMatch[1].split(/[,;]/).map((s) => s.trim()).filter(Boolean).length : 0;
  const timelineSection = sections.find((s) => /timeline/i.test(s.title));
  const eventCount = timelineSection ? (timelineSection.body.match(/^\s*[-*]\s*\*\*[^*]+\*\*/gm)?.length ?? 0) : 0;

  return (
    <SourcesContext.Provider value={sources}>
      <div className="space-y-5">
        {/* Intelligence header */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-card/80 via-card/60 to-card/30 p-4 backdrop-blur md:p-5">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: accent }} /><span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: accent }} /></span>
              Intelligence Dossier
            </span>
            <span>{sections.length} modules · source-traceable</span>
          </div>
          {mostLikely && <div className="mt-3 text-base font-medium leading-snug text-foreground md:text-lg">{mostLikely}</div>}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {confLabel && <Metric label="Confidence" value={String(confLabel)} accent={accent} />}
            {agentCount > 0 && <Metric label="Agents" value={String(agentCount)} accent={accent} />}
            <Metric label="Modules" value={String(sections.length)} accent={accent} />
            {eventCount > 0 && <Metric label="Timeline" value={String(eventCount)} accent={accent} />}
            <Metric label="Sources" value={String(sources.length)} accent={accent} />
          </div>
        </div>

        {intro && <CitedProse>{intro}</CitedProse>}

        {/* Always-visible briefing: Overview + Detailed Analysis never disappear */}
        {(() => {
          const overview = sections.find((s) => /overview/i.test(s.title));
          const detailed = sections.find((s) => /detailed analysis/i.test(s.title));
          if (!overview && !detailed) return null;
          return (
            <div className="space-y-4">
              {overview && (
                <div className="rounded-2xl border border-border bg-card/55 p-5 backdrop-blur md:p-6">
                  <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    <span>§ Executive Summary</span>
                    <span>Always visible</span>
                  </div>
                  <SectionPanel section={overview} accent={accent} sources={sources} />
                </div>
              )}
              {detailed && (
                <div className="rounded-2xl border border-border bg-gradient-to-br from-card/70 via-card/50 to-card/30 p-5 backdrop-blur md:p-6">
                  <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    <span>§ Detailed Analysis · Documentary Briefing</span>
                    <span>Always visible</span>
                  </div>
                  <SectionPanel section={detailed} accent={accent} sources={sources} />
                </div>
              )}
            </div>
          );
        })()}

        {(() => {
          const tabSections = sections.filter(
            (s) => !/^(overview|detailed analysis)$/i.test(s.title.trim())
          );
          const tabActiveId = active && tabSections.some((s) => s.id === active) ? active : tabSections[0]?.id ?? null;
          const tabActiveSection = tabSections.find((s) => s.id === tabActiveId) ?? null;
          if (tabSections.length === 0) return null;
          return (
            <>
              <div className="flex flex-wrap gap-1.5 rounded-2xl border border-border bg-card/60 p-1.5 backdrop-blur">
                {tabSections.map((s) => {
                  const Icon = iconForTitle(s.title);
                  const isActive = s.id === tabActiveId;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActive(s.id)}
                      className={`group inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                        isActive ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" style={!isActive ? { color: accent } : undefined} />
                      {s.title}
                    </button>
                  );
                })}
              </div>

              {tabActiveSection && (
                <div className="rounded-2xl border border-border bg-card/55 p-5 backdrop-blur md:p-6">
                  <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    <span>§ {tabActiveSection.title}</span>
                    <span>Structured analysis</span>
                  </div>
                  <SectionPanel section={tabActiveSection} accent={accent} sources={sources} />
                </div>
              )}
            </>
          );
        })()}


        <ExportBar onCopy={copy} onShare={share} onDownload={download} copied={copied} />
      </div>
    </SourcesContext.Provider>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 px-3 py-2">
      <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold" style={{ color: accent }}>{value}</div>
    </div>
  );
}

function ExportBar({ onCopy, onShare, onDownload, copied }: { onCopy: () => void; onShare: () => void; onDownload: () => void; copied: boolean; }) {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <ExportButton onClick={onCopy} icon={copied ? Check : Copy}>{copied ? "Copied" : "Copy"}</ExportButton>
      <ExportButton onClick={onDownload} icon={Download}>Markdown</ExportButton>
      <ExportButton onClick={onShare} icon={Share2}>Share</ExportButton>
    </div>
  );
}

function ExportButton({ onClick, icon: Icon, children }: { onClick: () => void; icon: typeof Copy; children: React.ReactNode; }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-[color:var(--accent-amber)]/50 hover:bg-card hover:text-foreground">
      <Icon className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}

// ---------- Network Atlas Panel ----------

type NetNode = {
  id: string;
  label: string;
  lat: number;
  lon: number;
  importance: number;
  type?: string;
  role?: string;
  note?: string;
};
type NetEdge = {
  from: string;
  to: string;
  kind: string;
  strength: number;
  style: "solid" | "dashed";
  animated: boolean;
  note?: string;
};

const EDGE_COLORS: Record<string, string> = {
  trade: "#d4a84c",
  military: "#e0625a",
  diplomatic: "#7fb3d5",
  migration: "#b48ad6",
  religious: "#e9d8a6",
  cultural: "#7fc7a3",
  economic: "#e7b54a",
  colonial: "#c97a4a",
  knowledge: "#8ab6f0",
};

function parseNetwork(body: string): { era?: string; region?: string; nodes: NetNode[]; edges: NetEdge[]; insights: { label: string; value: string }[] } {
  const era = /\*\*Era:\*\*\s*([^\n]+)/i.exec(body)?.[1]?.trim();
  const region = /\*\*Region:\*\*\s*([^\n]+)/i.exec(body)?.[1]?.trim();
  const sectionOf = (h: string) => {
    const re = new RegExp(`###\\s*${h}\\s*\\n([\\s\\S]*?)(?=\\n###\\s|$)`, "i");
    return re.exec(body)?.[1] ?? "";
  };
  const nodeLines = sectionOf("Nodes").split("\n").filter((l) => /^\s*-\s/.test(l));
  const edgeLines = sectionOf("Edges").split("\n").filter((l) => /^\s*-\s/.test(l));
  const insightLines = sectionOf("Insights").split("\n").filter((l) => /^\s*-\s/.test(l));

  const nodes: NetNode[] = [];
  for (const line of nodeLines) {
    const raw = line.replace(/^\s*-\s*/, "");
    const parts = raw.split("|").map((p) => p.trim());
    if (parts.length < 4) continue;
    const lat = parseFloat(parts[2]);
    const lon = parseFloat(parts[3]);
    if (!isFinite(lat) || !isFinite(lon)) continue;
    nodes.push({
      id: parts[0].toLowerCase(),
      label: parts[1] || parts[0],
      lat,
      lon,
      importance: Math.max(0, Math.min(100, parseFloat(parts[4]) || 50)),
      type: parts[5]?.toLowerCase(),
      role: parts[6]?.toLowerCase(),
      note: parts[7],
    });
  }
  const edges: NetEdge[] = [];
  for (const line of edgeLines) {
    const raw = line.replace(/^\s*-\s*/, "");
    const parts = raw.split("|").map((p) => p.trim());
    if (parts.length < 4) continue;
    edges.push({
      from: parts[0].toLowerCase(),
      to: parts[1].toLowerCase(),
      kind: (parts[2] || "trade").toLowerCase(),
      strength: Math.max(0, Math.min(100, parseFloat(parts[3]) || 50)),
      style: /dashed/i.test(parts[4] || "") ? "dashed" : "solid",
      animated: /yes|true/i.test(parts[5] || ""),
      note: parts[6],
    });
  }
  const insights: { label: string; value: string }[] = [];
  for (const line of insightLines) {
    const m = /^\s*-\s*\*\*([^*]+):\*\*\s*(.+)$/.exec(line);
    if (m) insights.push({ label: m[1].trim(), value: m[2].trim() });
  }
  return { era, region, nodes, edges, insights };
}

function NetworkPanel({ body, accent }: { body: string; accent: string }) {
  const { era, region, nodes, edges, insights } = useMemo(() => parseNetwork(body), [body]);
  const [hover, setHover] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState<string>("all");

  if (nodes.length === 0) {
    return <CitedProse>{body}</CitedProse>;
  }

  // Equirectangular projection over actual node bbox with padding
  const W = 960, H = 520, PAD = 60;
  const lons = nodes.map((n) => n.lon);
  const lats = nodes.map((n) => n.lat);
  const minLon = Math.min(...lons), maxLon = Math.max(...lons);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const spanLon = Math.max(5, maxLon - minLon);
  const spanLat = Math.max(5, maxLat - minLat);
  const project = (lat: number, lon: number) => {
    const x = PAD + ((lon - minLon) / spanLon) * (W - 2 * PAD);
    const y = PAD + (1 - (lat - minLat) / spanLat) * (H - 2 * PAD);
    return { x, y };
  };

  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const visibleEdges = edges.filter((e) => nodeById.has(e.from) && nodeById.has(e.to) && (kindFilter === "all" || e.kind === kindFilter));
  const kinds = Array.from(new Set(edges.map((e) => e.kind)));

  const radiusFor = (imp: number) => 5 + (imp / 100) * 14;
  const strokeFor = (s: number) => 0.6 + (s / 100) * 3.2;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          {region ?? "Historical Network"} {era && <span className="text-foreground/70">· {era}</span>}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setKindFilter("all")} className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider transition ${kindFilter === "all" ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground"}`}>All</button>
          {kinds.map((k) => (
            <button key={k} onClick={() => setKindFilter(k)} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider transition ${kindFilter === k ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground"}`}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: EDGE_COLORS[k] ?? accent }} />
              {k}
            </button>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-[color:var(--accent-amber)]/25" style={{ background: "radial-gradient(ellipse at center, #1a1410 0%, #0c0a08 70%, #050403 100%)" }}>
        {/* parchment texture */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, #d4a84c 0%, transparent 40%), radial-gradient(circle at 80% 70%, #e9d8a6 0%, transparent 50%)" }} />
        <svg viewBox={`0 0 ${W} ${H}`} className="relative block h-auto w-full">
          <defs>
            <pattern id="atlas-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#d4a84c" strokeOpacity="0.08" strokeWidth="0.5" />
            </pattern>
            <radialGradient id="atlas-vignette" cx="50%" cy="50%" r="65%">
              <stop offset="60%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.6" />
            </radialGradient>
          </defs>
          <rect width={W} height={H} fill="url(#atlas-grid)" />

          {/* Edges */}
          <g>
            {visibleEdges.map((e, i) => {
              const a = nodeById.get(e.from)!;
              const b = nodeById.get(e.to)!;
              const pa = project(a.lat, a.lon);
              const pb = project(b.lat, b.lon);
              // curved path
              const mx = (pa.x + pb.x) / 2;
              const my = (pa.y + pb.y) / 2;
              const dx = pb.x - pa.x, dy = pb.y - pa.y;
              const norm = Math.sqrt(dx * dx + dy * dy) || 1;
              const cx = mx + (-dy / norm) * Math.min(60, norm * 0.18);
              const cy = my + (dx / norm) * Math.min(60, norm * 0.18);
              const d = `M ${pa.x} ${pa.y} Q ${cx} ${cy} ${pb.x} ${pb.y}`;
              const color = EDGE_COLORS[e.kind] ?? accent;
              const sw = strokeFor(e.strength);
              const dash = e.style === "dashed" ? "5 4" : undefined;
              const isHot = hover && (hover === e.from || hover === e.to);
              return (
                <g key={i} opacity={hover && !isHot ? 0.18 : 0.85}>
                  <path d={d} fill="none" stroke={color} strokeOpacity={0.18} strokeWidth={sw + 4} />
                  <path d={d} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={dash} strokeLinecap="round">
                    {e.animated && (
                      <animate attributeName="stroke-dashoffset" from="0" to={e.style === "dashed" ? "-18" : "-24"} dur="1.6s" repeatCount="indefinite" />
                    )}
                    {e.animated && !dash && (
                      <animate attributeName="stroke-dasharray" values="0 6;6 6;0 6" dur="0" />
                    )}
                  </path>
                  {e.animated && (
                    <circle r={sw + 1.2} fill={color}>
                      <animateMotion dur={`${3 + (100 - e.strength) / 30}s`} repeatCount="indefinite" path={d} rotate="auto" />
                      <animate attributeName="opacity" values="0;1;1;0" dur={`${3 + (100 - e.strength) / 30}s`} repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              );
            })}
          </g>

          {/* Nodes */}
          <g>
            {nodes.map((n) => {
              const p = project(n.lat, n.lon);
              const r = radiusFor(n.importance);
              const isHover = hover === n.id;
              const isCapital = n.type === "capital" || n.importance >= 85;
              const ring = isCapital ? "#e9d8a6" : "#d4a84c";
              return (
                <g key={n.id} transform={`translate(${p.x} ${p.y})`} onMouseEnter={() => setHover(n.id)} onMouseLeave={() => setHover(null)} style={{ cursor: "pointer" }}>
                  {isCapital && (
                    <circle r={r + 6} fill="none" stroke={ring} strokeOpacity="0.35" strokeWidth="0.8">
                      <animate attributeName="r" values={`${r + 4};${r + 10};${r + 4}`} dur="3s" repeatCount="indefinite" />
                      <animate attributeName="stroke-opacity" values="0.35;0.05;0.35" dur="3s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle r={r + 2} fill="#0c0a08" stroke={ring} strokeWidth={isHover ? 2 : 1} />
                  <circle r={r} fill={ring} fillOpacity={isCapital ? 0.95 : 0.7} />
                  <circle r={Math.max(1.2, r * 0.32)} fill="#0c0a08" />
                  <text y={-r - 6} textAnchor="middle" fontSize={isCapital ? 12 : 10.5} fontFamily="ui-serif, Georgia, serif" fontWeight={isCapital ? 600 : 500} fill="#f0e6cf" style={{ letterSpacing: isCapital ? "0.08em" : "0.04em" }}>
                    {n.label}
                  </text>
                  {isHover && n.note && (
                    <g transform={`translate(0 ${r + 14})`}>
                      <rect x={-90} y={0} width={180} height={26} rx={4} fill="#0c0a08" stroke="#d4a84c" strokeOpacity="0.5" />
                      <text x={0} y={17} textAnchor="middle" fontSize="10" fill="#e9d8a6" fontFamily="ui-serif, Georgia, serif">{n.note.replace(/\[\d+\]/g, "").slice(0, 38)}</text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          <rect width={W} height={H} fill="url(#atlas-vignette)" pointerEvents="none" />
        </svg>

        {/* legend */}
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1.5 rounded-lg border border-[color:var(--accent-amber)]/20 bg-black/50 px-2 py-1 backdrop-blur">
          <span className="font-mono text-[9px] uppercase tracking-wider text-[color:var(--accent-amber)]/80">Legend</span>
          {Array.from(new Set(visibleEdges.map((e) => e.kind))).slice(0, 6).map((k) => (
            <span key={k} className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-[#e9d8a6]/80">
              <span className="h-0.5 w-3 rounded" style={{ background: EDGE_COLORS[k] ?? accent }} />{k}
            </span>
          ))}
        </div>
        <div className="absolute right-2 top-2 font-mono text-[9px] uppercase tracking-[0.3em] text-[color:var(--accent-amber)]/70">
          {nodes.length} nodes · {visibleEdges.length} flows
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="grid gap-2 md:grid-cols-2">
          {insights.map((ins, i) => {
            const isStability = /stability/i.test(ins.label);
            const pct = isStability ? parseInt(/(\d{1,3})\s*%/.exec(ins.value)?.[1] ?? "0", 10) : null;
            return (
              <div key={i} className="rounded-xl border border-border bg-card/40 p-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{ins.label}</div>
                <div className="mt-1 text-[13px] leading-snug text-foreground">
                  <CitedText>{ins.value}</CitedText>
                </div>
                {pct !== null && (
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background/60">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${accent}, #e9d8a6)` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
