import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set");
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const GEMINI_MODEL = "gemini-2.0-flash";

export function getModel(systemInstruction?: string) {
  return genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    ...(systemInstruction ? { systemInstruction } : {})
  });
}

export function extractJSON<T = unknown>(text: string): T {
  // Handles ```json ... ``` wrapped responses or raw JSON
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
