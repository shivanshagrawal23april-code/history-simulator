'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, Copy, Check, Square, Sparkles, RotateCcw } from 'lucide-react';
import { MODES, getMode, type ModeId } from '@/lib/modes';
import { Markdown } from '@/components/Markdown';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function HistorianChat() {
  const searchParams = useSearchParams();
  const [modeId, setModeId] = useState<ModeId>(() => {
    const m = searchParams.get('mode');
    return MODES.some((x) => x.id === m) ? (m as ModeId) : 'explorer';
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);

  const mode = getMode(modeId);

  const send = useCallback(
    async (text: string, history: Message[]) => {
      const content = text.trim();
      if (!content || streaming) return;
      setError(null);
      const next: Message[] = [...history, { role: 'user', content }];
      setMessages([...next, { role: 'assistant', content: '' }]);
      setInput('');
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: next, mode: modeId }),
          signal: controller.signal,
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error ?? `Request failed (${res.status}).`);
        }
        const reader = res.body?.getReader();
        if (!reader) throw new Error('No response stream.');
        const decoder = new TextDecoder();
        let acc = '';
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          const current = acc;
          setMessages([...next, { role: 'assistant', content: current }]);
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError((err as Error).message);
          setMessages(next);
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [modeId, streaming],
  );

  useEffect(() => {
    const q = searchParams.get('q');
    if (q && !sentInitial.current) {
      sentInitial.current = true;
      void send(q, []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const stop = () => abortRef.current?.abort();

  const copyMessage = async (i: number, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-4xl flex-col px-4 sm:px-6">
      {/* Mode selector */}
      <div className="flex gap-2 overflow-x-auto py-4 [scrollbar-width:thin]">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setModeId(m.id)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-1.5 text-xs transition-all',
              m.id === modeId
                ? 'border-gold-border bg-gold-soft text-primary'
                : 'border-line text-secondary hover:text-primary',
            )}
            aria-pressed={m.id === modeId}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pb-4" aria-live="polite">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Sparkles size={28} className="text-gold" />
            <h1 className="mt-4 font-display text-3xl">{mode.name}</h1>
            <p className="mt-2 max-w-md text-sm text-secondary">{mode.description}</p>
            <div className="mt-8 grid w-full max-w-lg gap-2 sm:grid-cols-2">
              {mode.suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => void send(s, messages)}
                  className="glass rounded-xl px-4 py-3 text-left text-xs text-secondary transition-all hover:border-gold-border hover:text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-6 py-2">
          {messages.map((m, i) =>
            m.role === 'user' ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-gold-soft px-5 py-3 text-sm leading-relaxed">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={i} className="glass-card group relative p-6">
                {m.content ? (
                  <Markdown>{m.content}</Markdown>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-secondary">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-gold" />
                    Consulting the archives…
                  </div>
                )}
                {m.content && (
                  <button
                    onClick={() => void copyMessage(i, m.content)}
                    className="absolute right-4 top-4 rounded-lg border border-line p-1.5 text-secondary opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
                    aria-label="Copy answer"
                  >
                    {copied === i ? <Check size={13} className="text-gold" /> : <Copy size={13} />}
                  </button>
                )}
              </div>
            ),
          )}
        </div>
        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
            <button
              onClick={() => {
                const lastUser = [...messages].reverse().find((m) => m.role === 'user');
                if (lastUser)
                  void send(lastUser.content, messages.slice(0, messages.lastIndexOf(lastUser)));
              }}
              className="ml-3 inline-flex items-center gap-1 text-xs text-red-200 underline underline-offset-2"
            >
              <RotateCcw size={11} /> Retry
            </button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input, messages);
        }}
        className="glass-card mb-6 flex items-end gap-3 p-3"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send(input, messages);
            }
          }}
          rows={1}
          placeholder={`Ask the ${mode.name}…`}
          aria-label="Message"
          className="max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-relaxed placeholder:text-secondary/60 focus:outline-none"
        />
        {streaming ? (
          <button
            type="button"
            onClick={stop}
            className="btn-ghost !rounded-xl !px-4 !py-2.5"
            aria-label="Stop generating"
          >
            <Square size={15} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="btn-gold !rounded-xl !px-4 !py-2.5 disabled:opacity-40"
            aria-label="Send"
          >
            <Send size={15} />
          </button>
        )}
      </form>
    </div>
  );
}
