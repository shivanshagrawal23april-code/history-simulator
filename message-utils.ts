import type { UIMessage } from "ai";

// Flatten the text parts of a UIMessage into a single string.
export function extractText(message: UIMessage): string {
  if (!message.parts) return "";
  return message.parts.map((part) => (part.type === "text" ? part.text : "")).join("");
}
