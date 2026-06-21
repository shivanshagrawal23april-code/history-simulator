import { useEffect, useState } from "react";
import { Compass, RefreshCw, Sparkles } from "lucide-react";

export type ExplorationSuggestion = {
  label: string;
  prompt: string;
  category: string;
};

type Props = {
  messageId: string;
  lastUser: string;
  lastAssistant: string;
  modeId?: string | null;
  depth: string;
  language: string;
  accent: string;
  onSelect: (prompt: string) => void;
};

const categoryStyle: Record<string, string> = {
  Chronological: "border-amber-500/40 text-amber-200",
  Geopolitical: "border-sky-500/40 text-sky-200",
  Economic: "border-emerald-500/40 text-emerald-200",
  Technological: "border-violet-500/40 text-violet-200",
  Social: "border-rose-500/40 text-rose-200",
  Military: "border-red-500/40 text-red-200",
  Cultural: "border-fuchsia-500/40 text-fuchsia-200",
  "Modern Implications": "border-cyan-500/40 text-cyan-200",
  "Future Forecast": "border-teal-500/40 text-teal-200",
  "Counter-Scenario": "border-orange-500/40 text-orange-200",
};

export function ExplorationPaths({
  messageId,
  lastUser,
  lastAssistant,
  modeId,
  language,
  accent,
  onSelect,
}: Props) {
  const [suggestions, setSuggestions] = useState<ExplorationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!lastAssistant || lastAssistant.trim().length < 40) return;
    const controller = new AbortController();
    setLoading(true);
    setErrored(false);
    setSuggestions([]);
    fetch("/api/explore", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lastUser, lastAssistant, modeId, language }),
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data: { suggestions?: ExplorationSuggestion[] }) => {
        setSuggestions(data.suggestions ?? []);
      })
      .catch((e) => {
        if (e?.name === "AbortError") return;
        setErrored(true);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageId, nonce]);

  if (!loading && !errored && suggestions.length === 0) return null;

  return (
    <div className="mt-5 rounded-2xl border border-border/70 bg-card/40 p-4 backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Compass className="h-3.5 w-3.5" style={{ color: accent }} />
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            Continue exploring
          </span>
        </div>
        <button
          type="button"
          onClick={() => setNonce((n) => n + 1)}
          className="inline-flex items-center gap-1 rounded-full border border-border/60 px-2 py-0.5 text-[10px] text-muted-foreground transition hover:text-foreground"
          title="Regenerate paths"
        >
          <RefreshCw className={`h-2.5 w-2.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="grid gap-2 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-xl border border-border/50 bg-muted/30"
            />
          ))}
        </div>
      )}

      {errored && !loading && (
        <div className="text-xs text-muted-foreground">
          Could not generate exploration paths.
        </div>
      )}

      {!loading && suggestions.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(s.prompt)}
              className="group flex flex-col gap-1.5 rounded-xl border border-border/60 bg-background/60 p-3 text-left transition hover:border-[color:var(--accent-amber)] hover:bg-background"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] ${
                    categoryStyle[s.category] ?? "border-border text-muted-foreground"
                  }`}
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  {s.category}
                </span>
              </div>
              <span className="text-sm leading-snug text-foreground">
                {s.label}
              </span>
              <span className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                {s.prompt}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
