import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set");
}

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const GEMINI_MODEL = "gemini-3.8-flash";

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
