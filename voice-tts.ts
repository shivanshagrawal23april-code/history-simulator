import { createFileRoute } from "@tanstack/react-router";

type Body = { text?: unknown; voice?: unknown };

export const Route = createFileRoute("/api/voice-tts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { text, voice } = (await request.json()) as Body;
        if (typeof text !== "string" || !text.trim()) {
          return new Response("text required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        // Cap input to stay well under model limits
        const input = text.slice(0, 3500);
        const v = typeof voice === "string" ? voice : "sage";

        const upstream = await fetch(
          "https://ai.gateway.lovable.dev/v1/audio/speech",
          {
            method: "POST",
            headers: {
              "Lovable-API-Key": key,
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
