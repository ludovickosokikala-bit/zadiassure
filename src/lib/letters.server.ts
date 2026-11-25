import { generateResponse, GatewayError } from "@lovable.dev/ai-gateway";
import { letterAnalysisSchema, type LetterAnalysis } from "./phase5Core";

/** Model that reads client letters (OpenAI via Lovable AI Gateway, zero data retention). */
export const LETTER_MODEL = "openai/gpt-6-astra" as const;
const LANG: Record<string, string> = { nl: "Dutch", fr: "French", en: "English" };

type Part = { type: "input_text"; text: string } | { type: "input_image"; image_url: string; detail: "auto" } | { type: "input_file"; filename: string; file_data: string };

function outputText(res: unknown): string {
  const out = (res as { output?: { type: string; content?: { type: string; text?: string }[] }[] }).output ?? [];
  return out.flatMap((o) => o.content ?? []).filter((c) => c.type === "output_text").map((c) => c.text ?? "").join("");
}

export async function analyzeLetter(files: { mime: string; base64: string; name: string }[], languages: string[]): Promise<LetterAnalysis> {
  const langs = [...new Set(languages)].map((l) => LANG[l] ?? "Dutch");
  const parts: Part[] = [
    {
      type: "input_text",
      text: `You help an administrative guidance office in Belgium. Read this letter (all pages). Explain in simple, plain words (short sentences, no jargon). Return JSON only. Give one entry in "summaries" for each of these languages: ${langs.join(", ")} (use language codes ${[...new Set(languages)].join(", ")}). "about" = what the letter is about; "asked" = what is asked from the recipient. "deadline" = the response or payment deadline as YYYY-MM-DD, or null if none is stated. "amounts" = every amount mentioned with a short description. "sender_reference" = the sender's reference or file number, or "". "letter_language" = language code of the letter (nl, fr, en, de or other). Do not give legal advice.`,
    },
    ...files.map((f): Part =>
      f.mime === "application/pdf"
        ? { type: "input_file", filename: f.name, file_data: `data:application/pdf;base64,${f.base64}` }
        : { type: "input_image", image_url: `data:${f.mime};base64,${f.base64}`, detail: "auto" },
    ),
  ];
  const res = await generateResponse({
    model: LETTER_MODEL,
    input: [{ role: "user", content: parts }],
    text: {
      format: {
        type: "json_schema",
        name: "letter",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["sender", "sender_reference", "letter_language", "deadline", "amounts", "summaries"],
          properties: {
            sender: { type: "string" },
            sender_reference: { type: "string" },
            letter_language: { type: "string" },
            deadline: { type: ["string", "null"] },
            amounts: { type: "array", items: { type: "object", additionalProperties: false, required: ["amount", "description"], properties: { amount: { type: "string" }, description: { type: "string" } } } },
            summaries: { type: "array", items: { type: "object", additionalProperties: false, required: ["language", "about", "asked"], properties: { language: { type: "string" }, about: { type: "string" }, asked: { type: "string" } } } },
          },
        },
      },
    },
  });
  const parsed = letterAnalysisSchema.parse(JSON.parse(outputText(res)));
  if (parsed.deadline && !/^\d{4}-\d{2}-\d{2}$/.test(parsed.deadline)) parsed.deadline = null;
  return parsed;
}

export async function draftReply(a: LetterAnalysis, client: { name: string; address: string }, instructions: string) {
  const lang = LANG[a.letter_language] ?? "French";
  const res = await generateResponse({
    model: LETTER_MODEL,
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Write a short, polite reply letter in ${lang}, from the client (${client.name}, ${client.address || "address to complete"}) to ${a.sender}${a.sender_reference ? `, reference ${a.sender_reference}` : ""}. Context of the received letter: ${a.summaries[0]?.about ?? ""} What was asked: ${a.summaries[0]?.asked ?? ""}. ${instructions ? `Extra instructions from staff: ${instructions}.` : ""} Use placeholders in [brackets] for anything unknown. Plain text only, ready to print, with date line, subject line with the reference, body and signature. No legal advice, no promises on behalf of ZADIASSURE.`,
          },
        ],
      },
    ],
  });
  return outputText(res).trim();
}

export function aiErrorCode(e: unknown) {
  if (e instanceof GatewayError) {
    console.error("[letters] gateway error", e.code, e.httpStatus, e.ids);
    if (e.httpStatus === 402) return "AI_CREDITS";
    if (e.httpStatus === 429) return "AI_RATE";
  } else console.error("[letters] error", e);
  return "AI_FAILED";
}
