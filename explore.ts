import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { getMode } from "@/lib/historyverse-modes";

export type ExplorationSuggestion = {
  label: string;
  prompt: string;
  category: string;
};

const CATEGORIES = [
  "Chronological",
  "Geopolitical",
  "Economic",
  "Technological",
  "Social",
  "Military",
  "Cultural",
  "Modern Implications",
  "Future Forecast",
  "Counter-Scenario",
];

function parseSuggestions(raw: string): ExplorationSuggestion[] {
  if (!raw) return [];
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1) s = s.slice(start, end + 1);
  try {
    const parsed = JSON.parse(s) as { suggestions?: unknown };
    const arr = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
    return arr
      .map((it) => {
        const o = it as Record<string, unknown>;
        return {
          label: typeof o.label === "string" ? o.label : "",
          prompt: typeof o.prompt === "string" ? o.prompt : "",
          category: typeof o.category === "string" ? o.category : "Continue",
        };
      })
      .filter((x) => x.label && x.prompt)
      .slice(0, 6);
  } catch {
    return [];
  }
}

export const Route = createFileRoute("/api/explore")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          lastUser?: string;
          lastAssistant?: string;
          modeId?: string | null;
          language?: string;
        };

        const lastUser = (body.lastUser ?? "").slice(0, 1500);
        const lastAssistant = (body.lastAssistant ?? "").slice(0, 6000);
        const language = body.language ?? "en";

        if (!lastAssistant || lastAssistant.trim().length < 40) {
          return Response.json({ suggestions: [] });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const mode = getMode(body.modeId ?? null);

        const langInstruction =
          language === "hi"
            ? "Write the `label` and `prompt` fields in हिन्दी (Devanagari)."
            : language === "hinglish"
            ? "Write `label` and `prompt` in natural Hinglish (Roman script)."
            : "Write `label` and `prompt` in clear English.";

        const system = `You are the EXPLORATION GUIDE layer of HistoryVerse AI's simulator (mode: ${mode.name}).
Read the simulator's most recent answer and propose 4–6 *next* directions the user could explore that NATURALLY CONTINUE this exact scenario.

HARD RULES:
- Suggestions MUST be specific to the scenario discussed — never generic.
- Preserve full continuity with the established alternate timeline.
- Cover DIFFERENT analytical angles: pick from ${CATEGORIES.join(", ")}.
- Each suggestion needs:
  • label: a short clickable chip (max ~7 words)
  • prompt: a complete first-person question the user would actually send, referencing the scenario's specifics
  • category: one of the categories above
- ${langInstruction}
- Return ONLY raw JSON. No prose, no markdown, no code fences.
- Shape: {"suggestions":[{"label":"...","prompt":"...","category":"..."}]}
- Exactly 4–6 items, each unique in category/angle.`;

        const userMsg = `USER'S LAST QUESTION:
${lastUser}

SIMULATOR'S LAST ANSWER (the established scenario to continue):
${lastAssistant}

Now produce the JSON of 4–6 next-direction suggestions.`;

        try {
          const gateway = createLovableAiGatewayProvider(key);
          const model = gateway("google/gemini-3-flash-preview");
          const { text } = await generateText({ model, system, prompt: userMsg });
          return Response.json({ suggestions: parseSuggestions(text) });
        } catch (err) {
          console.error("[explore] error", err);
          return Response.json({ suggestions: [] }, { status: 200 });
        }
      },
    },
  },
});
