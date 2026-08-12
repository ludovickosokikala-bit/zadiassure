import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/** Provider helper for Lovable AI Gateway. Server-only. */
export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

export const CRM_AI_MODEL = "google/gemini-2.5-flash";

export function requireLovableApiKey() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is niet geconfigureerd (LOVABLE_API_KEY ontbreekt).");
  return key;
}
