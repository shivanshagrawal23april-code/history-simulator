import { createFileRoute } from "@tanstack/react-router";
import {
  LOVABLE_AI_GATEWAY_BASE_URL,
  getLovableApiKey,
  lovableGatewayHeaders,
  missingApiKeyResponse,
} from "@/lib/ai-gateway.server";

type Body = { text?: unknown; voice?: unknown };

export const Route = createFileRoute("/api/voice-tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { text, voice } = (await request.json()) as Body;
        if (typeof text !== "string" || !text.trim()) {
          return new Response("text required", { status: 400 });
        }
        const key = getLovableApiKey();
        if (!key) return missingApiKeyResponse();

        // Cap input to stay well under model limits
        const input = text.slice(0, 3500);
        const v = typeof voice === "string" ? voice : "sage";

        const upstream = await fetch(
          `${LOVABLE_AI_GATEWAY_BASE_URL}/audio/speech`,
          {
            method: "POST",
            headers: {
              ...lovableGatewayHeaders(key),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "openai/gpt-4o-mini-tts",
              input,
              voice: v,
              response_format: "mp3",
              instructions:
                "Speak as a warm, knowledgeable documentary historian. Calm, measured pacing, clear enunciation, gentle gravitas. Bring stories to life without melodrama.",
            }),
          }
        );

        if (!upstream.ok) {
          const errText = await upstream.text().catch(() => "");
          return new Response(errText || "TTS failed", { status: upstream.status });
        }
        return new Response(upstream.body, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
