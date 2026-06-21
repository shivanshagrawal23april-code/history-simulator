import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import {
  Plus,
  Trash2,
  ArrowLeft,
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
  Sparkles,
  ChevronDown,
  RefreshCw,
  Lightbulb,
  FlaskConical,
  Wand2,
  Mic,
  MicOff,
  Languages,
  type LucideIcon,
} from "lucide-react";
import { StructuredMessage } from "@/components/structured-message";
import { ExplorationPaths } from "@/components/exploration-paths";
import logoSrc from "@/assets/logo.png";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  loadThreads,
  newThread,
  saveThreads,
  type Thread,
} from "@/lib/historyverse-storage";
import { MODES, getMode, type ModeId } from "@/lib/historyverse-modes";

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

type ChatSearch = { q?: string };

export const Route = createFileRoute("/chat/$threadId")({
  validateSearch: (search: Record<string, unknown>): ChatSearch => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "HistoryVerse AI — Exploration" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { threadId } = Route.useParams();
  const { q } = Route.useSearch();
  return <ChatShell key={threadId} threadId={threadId} initialQuery={q} />;
}

function ChatShell({
  threadId,
  initialQuery,
}: {
  threadId: string;
  initialQuery?: string;
}) {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const [depth, setDepth] = useState<"simple" | "standard" | "deep">("standard");
  const [language, setLanguage] = useState<"en" | "hi" | "hinglish">("en");


  // hydrate threads + ensure current exists
  useEffect(() => {
    const all = loadThreads();
    let current = all.find((t) => t.id === threadId);
    if (!current) {
      current = newThread();
      current.id = threadId;
      all.unshift(current);
      saveThreads(all);
    }
    setThreads(all);
    setHydrated(true);
  }, [threadId]);

  const activeThread = threads.find((t) => t.id === threadId);
  const mode = getMode(activeThread?.modeId);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages, id, body }) => ({
          body: { id, messages, modeId: mode.id, depth, language, ...(body ?? {}) },
        }),
      }),
    [mode.id, depth, language]
  );

  const { messages, sendMessage, status, setMessages, error, regenerate } = useChat({
    id: threadId,
    messages: activeThread?.messages ?? [],
    transport,
    onError: (err) => {
      console.error(err);
      toast.error("The engine encountered an error. Please retry.");
    },
  });

  // Persist messages whenever they change
  useEffect(() => {
    if (!hydrated) return;
    setThreads((prev) => {
      const idx = prev.findIndex((t) => t.id === threadId);
      if (idx === -1) return prev;
      const cur = prev[idx];
      const firstUser = messages.find((m) => m.role === "user");
      const title =
        cur.title && cur.title !== "New exploration"
          ? cur.title
          : firstUser
            ? extractText(firstUser).slice(0, 60) || "New exploration"
            : "New exploration";
      const updated: Thread = {
        ...cur,
        title,
        updatedAt: Date.now(),
        messages,
      };
      const next = [updated, ...prev.filter((_, i) => i !== idx)];
      saveThreads(next);
      return next;
    });
  }, [messages, threadId, hydrated]);

  // Seed from initialQuery (one-time)
  const seeded = useRef(false);
  useEffect(() => {
    if (!hydrated || seeded.current) return;
    if (initialQuery && messages.length === 0) {
      seeded.current = true;
      sendMessage({ text: initialQuery });
    }
  }, [hydrated, initialQuery, messages.length, sendMessage]);

  // Focus textarea on mount + thread change
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    composerRef.current?.focus();
  }, [threadId]);

  const handleSubmit = (message: PromptInputMessage) => {
    const text = message.text?.trim();
    if (!text) return;
    sendMessage({ text });
    requestAnimationFrame(() => composerRef.current?.focus());
  };

  // Voice input via Web Speech API
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);
  const toggleVoice = () => {
    if (typeof window === "undefined") return;
    const W = window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown };
    const SR = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!SR) { toast.error("Voice input not supported in this browser."); return; }
    if (listening) { recognitionRef.current?.stop(); return; }
    const rec = new SR() as {
      lang: string; interimResults: boolean; continuous: boolean;
      start: () => void; stop: () => void;
      onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
      onerror: () => void; onend: () => void;
    };
    rec.lang = language === "hi" ? "hi-IN" : language === "hinglish" ? "en-IN" : "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = "";
    rec.onresult = (e) => {
      finalText = "";
      for (let i = 0; i < e.results.length; i++) finalText += e.results[i][0].transcript;
      if (composerRef.current) {
        composerRef.current.value = finalText;
        composerRef.current.dispatchEvent(new Event("input", { bubbles: true }));
      }
    };
    rec.onerror = () => { setListening(false); toast.error("Voice error"); };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };


  const changeMode = (modeId: ModeId) => {
    if (!activeThread) return;
    setThreads((prev) => {
      const next = prev.map((t) => (t.id === threadId ? { ...t, modeId } : t));
      saveThreads(next);
      return next;
    });
  };

  const createThread = () => {
    const t = newThread(mode.id);
    const next = [t, ...threads];
    saveThreads(next);
    setMessages([]);
    navigate({ to: "/chat/$threadId", params: { threadId: t.id } });
  };

  const deleteThread = (id: string) => {
    const next = threads.filter((t) => t.id !== id);
    saveThreads(next);
    setThreads(next);
    if (id === threadId) {
      if (next.length > 0) {
        navigate({ to: "/chat/$threadId", params: { threadId: next[0].id } });
      } else {
        navigate({ to: "/" });
      }
    }
  };

  const Icon = ICONS[mode.icon] ?? Sparkles;
  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="relative flex h-screen min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-aurora opacity-40" />

      {/* Sidebar */}
      <aside className="relative z-10 hidden w-72 flex-col border-r border-border/60 bg-sidebar/80 backdrop-blur md:flex">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoSrc} alt="" width={28} height={28} />
            <div>
              <div className="font-display text-sm leading-none">HistoryVerse</div>
              <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                Engine
              </div>
            </div>
          </Link>
          <button
            onClick={createThread}
            className="grid h-8 w-8 place-items-center rounded-full border border-border bg-background transition hover:bg-accent"
            title="New exploration"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
          Recent
        </div>
        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          {threads.length === 0 && (
            <div className="px-3 py-6 text-xs text-muted-foreground">
              No explorations yet.
            </div>
          )}
          <ul className="space-y-1">
            {threads.map((t) => {
              const tMode = getMode(t.modeId);
              const TIcon = ICONS[tMode.icon] ?? Sparkles;
              const active = t.id === threadId;
              return (
                <li
                  key={t.id}
                  className={`group flex items-center gap-2 rounded-lg px-2 py-2 transition ${
                    active
                      ? "bg-accent/80"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <Link
                    to="/chat/$threadId"
                    params={{ threadId: t.id }}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <TIcon
                      className="h-3.5 w-3.5 shrink-0"
                      style={{ color: tMode.accent }}
                    />
                    <span className="truncate text-sm">{t.title}</span>
                  </Link>
                  <button
                    onClick={() => deleteThread(t.id)}
                    className="opacity-0 transition group-hover:opacity-100 hover:text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border/60 p-3 text-[11px] text-muted-foreground">
          Chats stored locally in this browser.
        </div>
      </aside>

      {/* Main */}
      <section className="relative z-10 flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center justify-between gap-3 border-b border-border/60 bg-background/70 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/"
              className="grid h-8 w-8 place-items-center rounded-full border border-border hover:bg-accent md:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div
              className="grid h-9 w-9 place-items-center rounded-xl"
              style={{
                background: `color-mix(in oklab, ${mode.accent} 20%, transparent)`,
                color: mode.accent,
              }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate font-display text-base leading-tight">
                {activeThread?.title ?? "New exploration"}
              </div>
              <div className="truncate text-[11px] text-muted-foreground">
                {mode.name} · {mode.tagline}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <div className="hidden items-center rounded-full border border-border bg-card/60 p-0.5 backdrop-blur lg:flex">
              <Languages className="ml-2 mr-1 h-3 w-3 text-muted-foreground" />
              {(
                [
                  { v: "en", label: "EN" },
                  { v: "hi", label: "हिं" },
                  { v: "hinglish", label: "Hi-En" },
                ] as const
              ).map((l) => {
                const active = language === l.v;
                return (
                  <button
                    key={l.v}
                    onClick={() => setLanguage(l.v)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                      active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                    }`}
                    title={l.v === "hi" ? "Hindi" : l.v === "hinglish" ? "Hinglish" : "English"}
                  >
                    {l.label}
                  </button>
                );
              })}
            </div>

            {/* Depth toggle */}
            <div className="hidden items-center rounded-full border border-border bg-card/60 p-0.5 backdrop-blur sm:flex">
              {(
                [
                  { v: "simple", label: "Simple", icon: Lightbulb },
                  { v: "standard", label: "Standard", icon: Wand2 },
                  { v: "deep", label: "Deep", icon: FlaskConical },
                ] as const
              ).map((d) => {
                const DIcon = d.icon;
                const active = depth === d.v;
                return (
                  <button
                    key={d.v}
                    onClick={() => setDepth(d.v)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
                      active
                        ? "bg-foreground text-background shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title={`${d.label} depth`}
                  >
                    <DIcon className="h-3 w-3" />
                    {d.label}
                  </button>
                );
              })}
            </div>

            <Select value={mode.id} onValueChange={(v) => changeMode(v as ModeId)}>
              <SelectTrigger className="h-9 w-[160px] rounded-full border-border bg-card/60">
                <SelectValue />
                <ChevronDown className="ml-1 h-3 w-3 opacity-60" />
              </SelectTrigger>
              <SelectContent>
                {MODES.map((m) => {
                  const MIcon = ICONS[m.icon] ?? Sparkles;
                  return (
                    <SelectItem key={m.id} value={m.id}>
                      <span className="inline-flex items-center gap-2">
                        <MIcon className="h-3.5 w-3.5" style={{ color: m.accent }} />
                        {m.name}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </header>

        {/* Conversation */}
        <Conversation className="flex-1">
          <ConversationContent className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
            {messages.length === 0 && (
              <ConversationEmptyState
                className="rounded-3xl border border-border bg-card/50 backdrop-blur"
                icon={
                  <img
                    src={logoSrc}
                    alt=""
                    width={64}
                    height={64}
                    className="opacity-90"
                  />
                }
                title={mode.name}
                description={mode.description}
              >
                <div className="mt-4 grid w-full max-w-xl gap-2">
                  {mode.suggestions.map((s) => (
                    <SuggestionButton
                      key={s}
                      onClick={() => sendMessage({ text: s })}
                    >
                      {s}
                    </SuggestionButton>
                  ))}
                </div>
              </ConversationEmptyState>
            )}

            {messages.map((m, idx) => {
              const isLastAssistant =
                m.role === "assistant" &&
                idx === messages.length - 1 &&
                !isLoading;
              const prevUser = isLastAssistant
                ? [...messages.slice(0, idx)].reverse().find((x) => x.role === "user")
                : undefined;
              return (
                <div key={m.id}>
                  <MessageRow message={m} accent={mode.accent} />
                  {isLastAssistant && (
                    <ExplorationPaths
                      messageId={m.id}
                      lastUser={prevUser ? extractText(prevUser) : ""}
                      lastAssistant={extractText(m)}
                      modeId={mode.id}
                      depth={depth}
                      language={language}
                      accent={mode.accent}
                      onSelect={(p) => sendMessage({ text: p })}
                    />
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="px-1 pt-1">
                <Shimmer className="text-sm">
                  {status === "submitted"
                    ? "Consulting the historical record…"
                    : "Reasoning across causes and consequences…"}
                </Shimmer>
              </div>
            )}

            {error && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <span>{error.message || "An error occurred while reasoning."}</span>
                <button
                  onClick={() => regenerate()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 px-3 py-1 text-xs font-medium hover:bg-destructive/15"
                >
                  <RefreshCw className="h-3 w-3" /> Retry
                </button>
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Composer */}
        <div className="border-t border-border/60 bg-background/80 px-4 py-4 backdrop-blur md:px-6">
          <div className="mx-auto w-full max-w-3xl">
            <PromptInput
              onSubmit={handleSubmit}
              className="rounded-2xl border-border bg-card/70 shadow-elevated"
            >
              <PromptInputTextarea
                ref={composerRef as never}
                placeholder={`Ask in ${mode.name} mode… (Shift+Enter for new line)`}
                className="min-h-[64px] text-[15px]"
              />
              <PromptInputFooter className="justify-between gap-2">
                <div className="text-[11px] text-muted-foreground">
                  Grounded · cited · confidence-rated · {language === "hi" ? "हिन्दी" : language === "hinglish" ? "Hinglish" : "English"}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleVoice}
                    className={`grid h-8 w-8 place-items-center rounded-full border transition ${
                      listening
                        ? "border-red-500/50 bg-red-500/15 text-red-300 animate-pulse"
                        : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
                    }`}
                    title={listening ? "Stop listening" : "Voice input"}
                  >
                    {listening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                  </button>
                  <PromptInputSubmit
                    status={status}
                    disabled={isLoading}
                    size="icon-sm"
                  />
                </div>
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      </section>
    </div>
  );
}

function MessageRow({
  message,
  accent,
}: {
  message: UIMessage;
  accent: string;
}) {
  const text = extractText(message);
  const isUser = message.role === "user";

  return (
    <Message from={message.role}>
      {isUser ? (
        <MessageContent className="bg-primary text-primary-foreground">
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed">{text}</div>
        </MessageContent>
      ) : (
        <div className="flex w-full gap-3">
          <div
            className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border bg-card"
            style={{ color: accent }}
          >
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <StructuredMessage text={text} accent={accent} />
          </div>
        </div>
      )}
    </Message>
  );
}

function SuggestionButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-left text-sm transition hover:border-[color:var(--accent-amber)] hover:bg-background"
    >
      <span className="text-foreground">{children}</span>
    </button>
  );
}

function extractText(m: UIMessage): string {
  if (!m.parts) return "";
  return m.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");
}
