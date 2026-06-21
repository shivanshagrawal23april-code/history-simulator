import type { UIMessage } from "ai";
import { DEFAULT_MODE, type ModeId } from "./historyverse-modes";

const STORAGE_KEY = "historyverse.threads.v1";

export interface Thread {
  id: string;
  title: string;
  modeId: ModeId;
  updatedAt: number;
  messages: UIMessage[];
}

export function loadThreads(): Thread[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Thread[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveThreads(threads: Thread[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  } catch {
    /* quota — ignore */
  }
}

export function newThreadId() {
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function newThread(modeId: ModeId = DEFAULT_MODE): Thread {
  return {
    id: newThreadId(),
    title: "New exploration",
    modeId,
    updatedAt: Date.now(),
    messages: [],
  };
}
