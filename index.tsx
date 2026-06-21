import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Compass,
  GitBranch,
  Crown,
  Users,
  Milestone,
  Globe2,
  Scale,
  Telescope,
  BookMarked,
  GraduationCap,
  ArrowRight,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import logoSrc from "@/assets/logo.png";
import heroMonument from "@/assets/hero-monument.jpg";
import heroCollage from "@/assets/hero-collage.jpg";
import { MODES, type ModeId } from "@/lib/historyverse-modes";
import {
  loadThreads,
  newThread,
  saveThreads,
} from "@/lib/historyverse-storage";

const ICONS: Record<string, LucideIcon> = {
  Compass,
  GitBranch,
  Crown,
  Users,
  Milestone,
  Globe2,
  Scale,
  Telescope,
  BookMarked,
  GraduationCap,
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HistoryVerse AI — An intelligence engine for the past, present, and futures" },
      {
        name: "description",
        content:
          "Investigate any era, run rigorous alternate-history scenarios, simulate civilizations, converse with historical figures, and forecast the next 100 years — grounded in a 23-point analytical framework.",
      },
      { property: "og:title", content: "HistoryVerse AI" },
      {
        property: "og:description",
        content:
          "An evidence-based intelligence engine for history, geopolitics, alternate timelines, civilization simulation, and 100-year forecasting.",
      },
    ],
  }),
  component: Landing,
});

const TODAY = new Date().toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function Landing() {
  const navigate = useNavigate();
  const [recentCount, setRecentCount] = useState(0);

  useEffect(() => {
    setRecentCount(loadThreads().length);
  }, []);

  const startWithMode = (modeId: ModeId, seed?: string) => {
    const threads = loadThreads();
    const t = newThread(modeId);
    if (seed) t.title = seed.slice(0, 60);
    saveThreads([t, ...threads]);
    navigate({
      to: "/chat/$threadId",
      params: { threadId: t.id },
      search: seed ? { q: seed } : {},
    });
  };

  const featuredPrompts = useMemo(
    () => [
      { mode: "alternate" as ModeId, text: "What if World War I never happened?", tag: "Counterfactual" },
      { mode: "alternate" as ModeId, text: "What if Napoleon had won at Waterloo?", tag: "Counterfactual" },
      { mode: "civilization" as ModeId, text: "Found a maritime civilization in 3000 BCE on the Aegean coast.", tag: "Simulation" },
      { mode: "figure" as ModeId, text: "Interview Marie Curie about her last decade of research.", tag: "Dialogue" },
      { mode: "forecast" as ModeId, text: "Model the global order in 2075 under three energy scenarios.", tag: "Forecast" },
      { mode: "explorer" as ModeId, text: "Why did the Roman Empire really fall — primary versus modern theories?", tag: "Research" },
    ],
    []
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Ambient warmth & paper grain */}
      <div className="pointer-events-none absolute inset-0 bg-aurora opacity-70 animate-aurora" />
      <div className="pointer-events-none absolute inset-0 bg-paper-grain opacity-[0.35] mix-blend-overlay" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] [background:radial-gradient(ellipse_at_50%_-20%,color-mix(in_oklab,var(--accent-amber)_18%,transparent),transparent_60%)]" />

      {/* Nav */}
      <header className="relative z-20 mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-3">
          <img
            src={logoSrc}
            alt="HistoryVerse AI"
            width={32}
            height={32}
            className="drop-shadow-[0_0_24px_color-mix(in_oklab,var(--accent-amber)_55%,transparent)]"
          />
          <div className="leading-tight">
            <div className="font-display text-base tracking-tight">HistoryVerse</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
              Intelligence · Est. MMXXVI
            </div>
          </div>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#modes" className="transition hover:text-foreground">Modes</a>
          <a href="#framework" className="transition hover:text-foreground">Framework</a>
          <a href="#prompts" className="transition hover:text-foreground">Dossiers</a>
          <a href="#manifesto" className="transition hover:text-foreground">Manifesto</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/voice"
            className="hidden items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-2 text-xs font-medium backdrop-blur transition hover:bg-card sm:inline-flex"
          >
            🎙 Voice
          </Link>
          <button
            onClick={() => startWithMode("explorer")}
            className="group inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
          >
            Open the engine
            <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </header>

      {/* Editorial poster hero */}
      <section className="relative z-10 mx-auto max-w-[1400px] px-6 pt-6 md:px-10 md:pt-12">
        {/* Editorial metadata strip */}
        <div className="flex items-start justify-between gap-6 font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          <div className="max-w-[12rem]">
            <div className="text-foreground/80">{TODAY}</div>
            <div className="mt-1">No. 001 · Vol. I</div>
          </div>
          <div className="hidden flex-1 items-center justify-center md:flex">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent-rose)]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent-amber)]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent-bronze)]" />
            </div>
          </div>
          <div className="text-right">
            <div className="text-foreground/80">A research-grade</div>
            <div>historical intelligence engine</div>
          </div>
        </div>

        {/* Massive serif display */}
        <div className="relative mt-10 md:mt-14">
          <h1 className="font-display font-light leading-[0.86] tracking-[-0.04em]">
            <span className="block text-[18vw] md:text-[14vw] lg:text-[12.5rem]">
              <span
                className="text-image-fill"
                style={{ backgroundImage: `url(${heroMonument})` }}
              >
                HISTORY
              </span>
            </span>
            <span className="-mt-2 block text-right text-[14vw] md:text-[10vw] lg:text-[9rem] italic text-foreground/95">
              <span className="text-[color:var(--accent-amber)]">verse</span>
              <span className="text-foreground/40">.</span>
            </span>
          </h1>
        </div>

        {/* Lede + actions */}
        <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-[1.05fr_1fr] md:gap-16">
          <div>
            <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
              <span className="h-px w-10 bg-foreground/40" />
              Manifesto
            </div>
            <p className="mt-4 font-display text-2xl leading-snug text-foreground/95 md:text-[2rem]">
              The past is not a museum. It is a living dataset of human choices —
              <span className="italic text-[color:var(--accent-amber)]"> branches taken, branches abandoned</span>,
              and the consequences that still shape every map we draw today.
            </p>
            <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              HistoryVerse AI is a research-grade engine for historical analysis,
              counterfactual scenarios, civilization simulation, geopolitics,
              and evidence-based forecasting — every answer structured across a
              23-point analytical framework, with cited sources and explicit
              confidence levels.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => startWithMode("explorer")}
                className="group inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-gold)] px-6 py-3 text-sm font-semibold text-[color:var(--primary-foreground)] shadow-glow transition hover:scale-[1.02]"
              >
                Enter the archive
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={() => startWithMode("alternate", "What if World War I never happened?")}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-6 py-3 text-sm font-medium backdrop-blur transition hover:bg-card"
              >
                Try: &ldquo;What if WWI never happened?&rdquo;
              </button>
            </div>

            {recentCount > 0 && (
              <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                {recentCount} dossier{recentCount === 1 ? "" : "s"} saved in this browser
              </div>
            )}
          </div>

          {/* Editorial sidebar card */}
          <aside className="relative">
            <div className="relative overflow-hidden rounded-[1.25rem] border border-border bg-card/70 backdrop-blur">
              <div className="relative h-64 w-full overflow-hidden">
                <img
                  src={heroCollage}
                  alt="A collage of historical landmarks"
                  width={1536}
                  height={1024}
                  className="h-full w-full object-cover opacity-90"
                />
                <div className="absolute inset-0 [background:linear-gradient(180deg,transparent_30%,color-mix(in_oklab,var(--card)_88%,transparent)_100%)]" />
                <div className="absolute left-5 top-4 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground/80">
                  Featured dossier
                </div>
              </div>
              <div className="p-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-[color:var(--accent-amber)]">
                  Counterfactual · Medium confidence
                </div>
                <h3 className="mt-2 font-display text-2xl leading-tight">
                  &ldquo;What if Napoleon had won at Waterloo?&rdquo;
                </h3>
                <div className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                  <p>
                    <span className="mr-1 rounded bg-[color:var(--accent-amber)]/15 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[color:var(--accent-amber)]">
                      Fact
                    </span>
                    The Seventh Coalition fielded ~118,000 troops on 18 June 1815.
                  </p>
                  <p>
                    <span className="mr-1 rounded bg-[color:var(--accent-rose)]/15 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[color:var(--accent-rose)]">
                      Projection
                    </span>
                    A French victory likely buys 6–18 months; Russia &amp; Austria still mobilize ~400k.
                  </p>
                  <p>
                    <span className="mr-1 rounded bg-[color:var(--accent-bronze)]/15 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[color:var(--accent-bronze)]">
                      Long-term
                    </span>
                    Bonapartist Europe accelerates legal codification; British naval-trade hegemony delayed ~15 yrs.
                  </p>
                </div>
                <button
                  onClick={() => startWithMode("alternate", "What if Napoleon had won at Waterloo?")}
                  className="mt-5 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.28em] text-foreground transition hover:text-[color:var(--accent-amber)]"
                >
                  Open full dossier <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Section divider */}
      <div className="relative z-10 mx-auto mt-24 max-w-[1400px] px-6 md:px-10">
        <div className="hairline" />
      </div>

      {/* Featured dossiers */}
      <section id="prompts" className="relative z-10 mx-auto max-w-[1400px] px-6 pt-16 md:px-10">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
              § II — Starting points
            </p>
            <h2 className="mt-3 font-display text-3xl md:text-5xl">
              Six dossiers, six different shapes of inquiry.
            </h2>
          </div>
          <p className="hidden max-w-sm text-sm text-muted-foreground md:block">
            Each opens a fresh conversation in the relevant mode — research,
            counterfactual, simulation, dialogue, or forecast.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {featuredPrompts.map((p, i) => {
            const mode = MODES.find((m) => m.id === p.mode)!;
            const Icon = ICONS[mode.icon];
            return (
              <button
                key={p.text}
                onClick={() => startWithMode(p.mode, p.text)}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card/55 p-6 text-left backdrop-blur transition hover:-translate-y-0.5 hover:border-[color:var(--accent-amber)]/60 hover:bg-card hover:shadow-elevated"
              >
                <div
                  className="absolute inset-x-0 -top-px h-px"
                  style={{ background: "var(--gradient-gold)" }}
                />
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" style={{ color: mode.accent }} />
                    {p.tag}
                  </span>
                  <span>№ {String(i + 1).padStart(2, "0")}</span>
                </div>
                <p className="mt-5 font-display text-xl leading-snug md:text-[1.4rem]">
                  {p.text}
                </p>
                <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{mode.name}</span>
                  <span className="inline-flex items-center gap-1 transition group-hover:text-[color:var(--accent-amber)]">
                    Open <ArrowUpRight className="h-3 w-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Modes */}
      <section id="modes" className="relative z-10 mx-auto mt-24 max-w-[1400px] px-6 md:px-10">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
              § III — Ten modes · One engine
            </p>
            <h2 className="mt-3 font-display text-3xl md:text-5xl">
              A specialist for every question.
            </h2>
          </div>
          <p className="hidden max-w-md text-sm text-muted-foreground md:block">
            Each mode rewires the engine with a distinct analytical framework,
            output discipline, and tone — from rigorous research to live
            simulation, in-character dialogue, and forecasting.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {MODES.map((mode, i) => {
            const Icon = ICONS[mode.icon];
            return (
              <button
                key={mode.id}
                onClick={() => startWithMode(mode.id)}
                className="group relative flex h-full flex-col rounded-2xl border border-border bg-card/55 p-5 text-left backdrop-blur transition hover:-translate-y-0.5 hover:bg-card hover:shadow-elevated"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="grid h-10 w-10 place-items-center rounded-xl"
                    style={{
                      background: `color-mix(in oklab, ${mode.accent} 18%, transparent)`,
                      color: mode.accent,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="mt-4 font-display text-lg">{mode.name}</div>
                <div className="mt-1 text-sm text-muted-foreground">{mode.tagline}</div>
                <div className="mt-auto pt-4 text-xs text-muted-foreground/80">
                  {mode.description}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 23-point framework */}
      <section id="framework" className="relative z-10 mx-auto mt-24 max-w-[1400px] px-6 md:px-10">
        <div className="overflow-hidden rounded-[1.5rem] border border-border bg-card/65 p-8 backdrop-blur md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
                § IV — The 23-point framework
              </p>
              <h2 className="mt-3 font-display text-3xl md:text-5xl">
                Rigorous by construction.
              </h2>
              <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
                Every counterfactual answer is structured across causes,
                immediate / medium / long-term effects, political, economic,
                social, technological, military, cultural, and environmental
                consequences — with explicit confidence levels, named winners
                and losers, and cited primary or scholarly sources.
              </p>
              <div className="mt-7 grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
                {[
                  "Causes & Variables",
                  "0–5 yr effects",
                  "5–25 yr effects",
                  "25–100 yr effects",
                  "Economic impact",
                  "Geopolitical shift",
                  "Tech & science",
                  "Military balance",
                  "Culture & religion",
                  "Environment",
                  "Winners / losers",
                  "Confidence levels",
                ].map((l, i) => (
                  <div
                    key={l}
                    className="flex items-center gap-2 rounded-lg border border-border/70 bg-background/30 px-3 py-2"
                  >
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate">{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative rounded-2xl border border-border bg-background/40 p-6">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground">
                <span>Sample structured output</span>
                <span>Mode · Alternate History</span>
              </div>
              <h3 className="mt-3 font-display text-2xl leading-tight">
                &ldquo;What if the printing press had been invented in China?&rdquo;
              </h3>
              <div className="mt-5 space-y-3 text-sm">
                <p>
                  <span className="mr-1 rounded bg-[color:var(--accent-amber)]/15 px-1.5 py-0.5 font-mono text-[10px] uppercase text-[color:var(--accent-amber)]">
                    Fact
                  </span>
                  Bi Sheng developed movable clay type c. 1040 CE — four centuries before Gutenberg.
                </p>
                <p>
                  <span className="mr-1 rounded bg-[color:var(--accent-rose)]/15 px-1.5 py-0.5 font-mono text-[10px] uppercase text-[color:var(--accent-rose)]">
                    Projection
                  </span>
                  Mass literacy reaches Song-dynasty cities by 1150 CE. Confidence: <span className="text-foreground">Medium-High</span>.
                </p>
                <p>
                  <span className="mr-1 rounded bg-[color:var(--accent-bronze)]/15 px-1.5 py-0.5 font-mono text-[10px] uppercase text-[color:var(--accent-bronze)]">
                    Long-term
                  </span>
                  Scientific revolution likely originates in East Asia; European Renaissance arrives ~120 yrs later, reshapes colonial timelines.
                </p>
              </div>
              <div className="mt-6 border-t border-border/60 pt-4 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                Sources · Needham, J. (1954) · Tsien, T-H. (1985) · Mokyr, J. (2016)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto + capabilities */}
      <section id="manifesto" className="relative z-10 mx-auto mt-24 max-w-[1400px] px-6 md:px-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
              § V — Designed for serious work
            </p>
            <h2 className="mt-3 font-display text-3xl md:text-5xl">
              Built for historians, strategists, and the curious.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { k: "Evidence-graded", v: "Every claim tagged Fact, Projection, or Speculation with confidence." },
              { k: "Multi-perspective", v: "Outputs balance Western, non-Western, and contested viewpoints." },
              { k: "Citable", v: "Primary sources and scholarly references attached to every output." },
              { k: "Composable", v: "Switch modes mid-conversation; save dossiers; resume any thread." },
            ].map((c) => (
              <div key={c.k} className="rounded-2xl border border-border bg-card/55 p-5 backdrop-blur">
                <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-[color:var(--accent-amber)]">
                  {c.k}
                </div>
                <p className="mt-3 text-sm text-foreground/90">{c.v}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-6 rounded-[1.5rem] border border-border bg-card/65 p-8 backdrop-blur md:flex-row md:items-center md:p-10">
          <div>
            <h3 className="font-display text-2xl md:text-3xl">
              Open the archive. Begin a dossier.
            </h3>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Choose any of the ten modes — or start with a question and let the
              engine route you. Your conversations are saved privately in this
              browser.
            </p>
          </div>
          <button
            onClick={() => startWithMode("explorer")}
            className="group inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-gold)] px-6 py-3 text-sm font-semibold text-[color:var(--primary-foreground)] shadow-glow transition hover:scale-[1.02]"
          >
            Enter the engine
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </button>
        </div>
      </section>

      <footer className="relative z-10 mt-20 border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-6 font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground md:px-10">
          <span>HistoryVerse AI · An evidence-based intelligence engine</span>
          <span>{TODAY}</span>
        </div>
      </footer>
    </main>
  );
}
