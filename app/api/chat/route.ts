import { ai, GEMINI_MODEL, GEMINI_FALLBACK_MODEL } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type ChatMessage = { role: "user" | "assistant"; content: string };

function isRateLimitError(err: unknown): boolean {
  if (!err) return false;
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("resource_exhausted") || msg.toLowerCase().includes("rate limit") || msg.includes("503") || msg.toLowerCase().includes("unavailable");
}

export async function POST(req: Request) {
  try {
    const { messages, guestResume } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages are required." }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    let resumeContext = "";
    if (guestResume) {
      resumeContext = `\n\nThe user's saved resume (for context):\n"""\n${guestResume.slice(0, 8000)}\n"""`;
    } else {
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from("profiles").select("resume_text, full_name").eq("id", user.id).single();
          if (data?.resume_text) resumeContext = `\n\nThe user's saved resume (for context):\n"""\n${data.resume_text.slice(0, 8000)}\n"""`;
        }
      } catch {}
    }

    const systemInstruction = `You are CareerCraft Copilot, a sharp, senior career consultant and resume writer. You are concise, specific, and actionable. ${resumeContext}`;

    const trimmed = messages.slice(-12);
    const firstUserIdx = trimmed.findIndex((m: ChatMessage) => m.role === "user");
    const sanitized = trimmed.slice(firstUserIdx === -1 ? 0 : firstUserIdx).map((m: ChatMessage) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const modelsToTry = [GEMINI_MODEL, GEMINI_FALLBACK_MODEL];
    let lastErr: unknown = null;

   
