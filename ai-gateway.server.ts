import process from "node:process";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const LOVABLE_AI_GATEWAY_BASE_URL = "https://ai.gateway.lovable.dev/v1";

export const DEFAULT_MODEL = "google/gemini-3-flash-preview";

export function lovableGatewayHeaders(apiKey: string) {
  return { "Lovable-API-Key": apiKey };
}

export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable-ai-gateway",
    baseURL: LOVABLE_AI_GATEWAY_BASE_URL,
    headers: lovableGatewayHeaders(apiKey),
  });
}

export function createLovableModel(apiKey: string, modelId: string = DEFAULT_MODEL) {
  return createLovableAiGatewayProvider(apiKey)(modelId);
}

// Read at request time — on Cloudflare Workers module-scope env reads are undefined.
export function getLovableApiKey(): string | null {
  return process.env.LOVABLE_API_KEY ?? null;
}

export function missingApiKeyResponse(): Response {
  return new Response("Missing LOVABLE_API_KEY", { status: 500 });
}
