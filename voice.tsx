import { createFileRoute, Link } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, MicOff, Square, ArrowLeft, Volume2, VolumeX, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import logoSrc from "@/assets/logo.png";
import { StructuredMessage } from "@/components/structured-message";
import { ExplorationPaths } from "@/components/exploration-paths";

export const Route = createFileRoute("/voice")({
  head: () => ({
    meta: [
      { title: "HistoryVerse Voice — Talk to a historian" },
      {
        name: "description",
        content:
          "Ask history questions out loud and hear a documentary-style historian answer back, with live timelines, maps, images and sources.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VoicePage,
});

type SRType = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> & { length: number } }) => void;
  onerror: (e: { error?: string }) => void;
  onend: () => void;
};

function extractText(m: UIMessage): string {
  return m.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")
    .trim();
}

// Pull the most "speakable" portion of a structured answer.
function buildSpokenScript(full: string): string {
  if (!full) return "";
  // Strip code blocks / tables / citations.
  const cleaned = full
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\|.*\|/g, "")
    .replace(/\[\d+\]/g, "")
    .replace(/\*\*/g, "")
    .replace(/^#+\s.*$/gm, "")
    .replace(/^\s*[-*]\s+/gm, "");

  // Prefer Overview, then Detailed Analysis intro.
  const sections = full.split(/\n##\s+/);
  const get = (name: RegExp) =>
    sections.find((s) => name.test(s.split("\n")[0]?.trim() ?? ""));
  const overview = get(/^overview/i);
  const detailed = get(/^detailed analysis/i);

  const clean = (s: string) =>
    s
      .replace(/^[^\n]*\n/, "") // drop title line
      .replace(/```[\s\S]*?```/g, "")
      .replace(/\|.*\|/g, "")
      .replace(/\[\d+\]/g, "")
      .replace(/\*\*/g, "")
      .replace(/^#+\s.*$/gm, "")
      .replace(/^\s*[-*]\s+/gm, "")
      .replace(/\n{2,}/g, "\n\n")
      .trim();

  let script = "";
  if (overview) script += clean(overview) + "\n\n";
  if (detailed) {
    const det = clean(detailed);
    // first ~3 paragraphs
    script += det.split(/\n\n/).slice(0, 3).join("\n\n");
  }
  if (!script) script = cleaned.slice(0, 2000);
  return script.slice(0, 3500).trim();
}

function VoicePage() {
  const [listening, setListening] = useState(false);
  const [partial, setPartial] = useState("");
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const recognitionRef = useRef<SRType | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSpokenIdRef = useRef<string | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages, id, body }) => ({
          body: {
            id,
            messages,
            modeId: "explorer",
            depth: "standard",
            language: "en",
            ...(body ?? {}),
          },
        }),
      }),
    []
  );

  const { messages, sendMessage, status, error } = useChat({
    id: "voice-session",
    transport,
    onError: (err) => {
      console.error(err);
      toast.error("The historian lost the thread. Please try again.");
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setSpeaking(false);
  };

  const speak = async (text: string) => {
    if (muted || !text.trim()) return;
    stopAudio();
    setTtsLoading(true);
    try {
      const res = await fetch("/api/voice-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: "sage" }),
      });
      if (!res.ok) throw new Error(`TTS ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onplay = () => setSpeaking(true);
      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setSpeaking(false);
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch (e) {
      console.error(e);
      toast.error("Couldn't play the spoken response.");
    } finally {
      setTtsLoading(false);
    }
  };

  // When the assistant finishes a message, narrate it.
  useEffect(() => {
    if (isLoading) return;
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (!last) return;
    if (lastSpokenIdRef.current === last.id) return;
    const text = extractText(last);
    if (!text) return;
    lastSpokenIdRef.current = last.id;
    const script = buildSpokenScript(text);
    if (script) void speak(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isLoading, muted]);

  const startListening = () => {
    if (typeof window === "undefined") return;
    const W = window as unknown as {
      SpeechRecognition?: new () => SRType;
      webkitSpeechRecognition?: new () => SRType;
    };
    const SR = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!SR) {
      toast.error("Voice input isn't supported in this browser. Try Chrome.");
      return;
    }
    // Barge-in: stop ongoing narration.
    stopAudio();

    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = "";
    rec.onresult = (e) => {
      finalText = "";
      for (let i = 0; i < e.results.length; i++) {
        finalText += e.results[i][0].transcript;
      }
      setPartial(finalText);
    };
    rec.onerror = (e) => {
      console.error("STT error", e);
      setListening(false);
      if (e.error && e.error !== "aborted" && e.error !== "no-speech") {
        toast.error(`Mic error: ${e.error}`);
      }
    };
    rec.onend = () => {
      setListening(false);
      const text = finalText.trim();
      setPartial("");
      if (text) {
        sendMessage({ text });
      }
    };
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  const toggleMic = () => {
    if (listening) stopListening();
    else startListening();
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (next) stopAudio();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort?.();
      stopAudio();
    };
  }, []);

  const suggestions = [
    "Tell me the story of the fall of Constantinople.",
    "Why did the Mongol Empire rise so quickly?",
    "What if Alexander the Great had lived another 20 years?",
    "Walk me through the causes of World War I.",
    "Who was Mansa Musa and why did he matter?",
  ];

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const lastUser = [...messages].reverse().find((m) => m.role === "user");

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-aurora opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-paper-grain opacity-[0.25] mix-blend-overlay" />

      <header className="relative z-10 mx-auto flex max-w-[1200px] items-center justify-between px-6 py-5 md:px-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex items-center gap-3">
          <img src={logoSrc} alt="" width={28} height={28} />
          <div className="leading-tight">
            <div className="font-display text-sm">HistoryVerse Voice</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Talk to a historian
            </div>
          </div>
        </div>
        <button
          onClick={toggleMute}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs backdrop-blur hover:bg-card"
          title={muted ? "Unmute narration" : "Mute narration"}
        >
          {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          {muted ? "Muted" : "Voice on"}
        </button>
      </header>

      <section className="relative z-10 mx-auto max-w-[1100px] px-6 pb-32 md:px-10">
        {/* Hero / mic */}
        <div className="mt-6 flex flex-col items-center text-center">
          <div className="font-mono text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
            § Live · Voice session
          </div>
          <h1 className="mt-3 font-display text-4xl leading-tight md:text-6xl">
            Ask history{" "}
            <span className="italic text-[color:var(--accent-amber)]">out loud.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
            Tap the mic and ask anything — wars, leaders, economies, cultures, alternate
            timelines. The historian listens, answers in voice, and brings the visuals to life.
          </p>

          {/* Mic orb */}
          <div className="relative mt-10 flex flex-col items-center">
            <div
              className={`absolute inset-0 -m-8 rounded-full blur-2xl transition ${
                listening
                  ? "bg-[color:var(--accent-rose)]/35 animate-pulse"
                  : speaking
                    ? "bg-[color:var(--accent-amber)]/30 animate-pulse"
                    : "bg-[color:var(--accent-amber)]/10"
              }`}
            />
            <button
              onClick={toggleMic}
              disabled={isLoading && !listening}
              className={`relative grid h-28 w-28 place-items-center rounded-full border text-background shadow-glow transition md:h-32 md:w-32 ${
                listening
                  ? "border-[color:var(--accent-rose)] bg-[color:var(--accent-rose)]"
                  : "border-[color:var(--accent-amber)] bg-[image:var(--gradient-gold)] hover:scale-[1.03]"
              } disabled:opacity-60`}
              aria-label={listening ? "Stop listening" : "Start speaking"}
            >
              {listening ? <Square className="h-9 w-9" /> : <Mic className="h-10 w-10" />}
            </button>
            <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              {listening
                ? "Listening — speak now"
                : isLoading
                  ? "Historian is thinking…"
                  : speaking
                    ? "Narrating — tap mic to interrupt"
                    : ttsLoading
                      ? "Preparing voice…"
                      : "Tap to speak"}
            </div>

            {(partial || (listening && !partial)) && (
              <div className="mt-5 max-w-xl rounded-2xl border border-border bg-card/60 px-5 py-3 text-sm italic text-foreground/90 backdrop-blur">
                {partial || "…"}
              </div>
            )}
          </div>

          {messages.length === 0 && !listening && (
            <div className="mt-10 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage({ text: s })}
                  className="group rounded-2xl border border-border bg-card/55 px-4 py-3 text-left text-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-[color:var(--accent-amber)]/60 hover:bg-card"
                >
                  <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    <Sparkles className="h-3 w-3" /> Try
                  </span>
                  <p className="mt-2 font-display text-base leading-snug">{s}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Conversation */}
        {messages.length > 0 && (
          <div className="mt-14 space-y-10">
            {messages.map((m) => {
              const text = extractText(m);
              if (m.role === "user") {
                return (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl border border-border bg-card/70 px-4 py-3 text-sm backdrop-blur">
                      <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                        You asked
                      </div>
                      {text}
                    </div>
                  </div>
                );
              }
              return (
                <div key={m.id} className="rounded-3xl border border-border bg-card/50 p-4 backdrop-blur md:p-6">
                  <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-[color:var(--accent-amber)]" />
                    Historian
                    {m === lastAssistant && (ttsLoading || speaking) && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[color:var(--accent-amber)]">
                        {ttsLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Volume2 className="h-3 w-3" />}
                        {ttsLoading ? "Voicing" : "Speaking"}
                      </span>
                    )}
                  </div>
                  {text ? (
                    <StructuredMessage text={text} accent="var(--accent-amber)" />
                  ) : (
                    <div className="text-sm text-muted-foreground">Thinking…</div>
                  )}
                  {m === lastAssistant && !isLoading && lastUser && (
                    <div className="mt-6">
                      <ExplorationPaths
                        messageId={m.id}
                        lastUser={extractText(lastUser)}
                        lastAssistant={text}
                        modeId="explorer"
                        depth="standard"
                        language="en"
                        accent="var(--accent-amber)"
                        onSelect={(q) => sendMessage({ text: q })}
                      />
                    </div>
                  )}
                </div>
              );
            })}
            {error && (
              <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                Something went wrong. Tap the mic to try again.
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
