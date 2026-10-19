import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set");
}

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Primary model, with automatic fallback to a model with a separate free-tier quota
export const GEMINI_MODEL = "gemini-3.8-flash";
export const GEMINI_FALLBACK_MODEL = "gemini-2.5-flash";

function isRateLimitError(err: unknown): boolean {
  if (!err) return false;
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("429") ||
    msg.toLowerCase().includes("quota") ||
    msg.toLowerCase().includes("resource_exhausted") ||
    msg.toLowerCase().includes("rate limit")
  );
}

/**
 * Runs a generateContent call with exponential backoff on 429s,
 * then falls back to GEMINI_FALLBACK_MODEL if the primary model keeps failing.
 */
export async function generateWithRetry(
  params: {
    model?: string;
    contents: unknown;
    config?: Record<string, unknown>;
  },
  maxRetries = 2
) {
  const primaryModel = params.model ?? GEMINI_MODEL;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent({
        model: primaryModel,
        contents: params.contents as never,
        config: params.config as never
      });
    } catch (err) {
      if (!isRateLimitError(err) || attempt === maxRetries) {
        // If it's a rate limit and we've exhausted retries, try fallback below
        if (isRateLimitError(err) && primaryModel !== GEMINI_FALLBACK_MODEL) {
          console.warn(
            `Primary model ${primaryModel} rate-limited. Trying fallback ${GEMINI_FALLBACK_MODEL}.`
          );
          try {
            return await ai.models.generateContent({
              model: GEMINI_FALLBACK_MODEL,
              contents: params.contents as never,
              config: params.config as never
            });
          } catch (fallbackErr) {
            console.error("Fallback model also failed:", fallbackErr);
            throw fallbackErr;
          }
        }
        throw err;
      }
      // Exponential backoff: 1s, 2s
      const delayMs = Math.pow(2, attempt) * 1000;
      console.warn(
        `Rate-limited on ${primaryModel}. Retrying in ${delayMs}ms (attempt ${attempt + 1}/${maxRetries}).`
      );
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  throw new Error("Unreachable");
}

export function extractJSON<T = unknown>(text: string): T {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in model response");
  }
  return JSON.parse(cleaned.slice(start, end + 1)) as T;
}
