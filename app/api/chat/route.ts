import { NextResponse } from "next/server";
import { ai, GEMINI_MODEL } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: ChatMessage[] };
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required." }, { status: 400 });
    }

    let resumeContext = "";
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("resume_text, full_name")
          .eq("id", user.id)
          .single();
        if (data?.resume_text) {
          resumeContext = `\n\nThe user's saved resume (for context):\n"""\n${data.resume_text.slice(0, 8000)}\n"""`;
        }
      }
    } catch {}

    const systemInstruction = `You are CareerCraft Copilot...${resumeContext}`;

    const trimmed = messages.slice(-12);
    const firstUserIdx = trimmed.findIndex((m) => m.role === "user");
    const sanitized = trimmed
      .slice(firstUserIdx === -1 ? 0 : firstUserIdx)
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: sanitized,
      config: { systemInstruction }
    });

    return NextResponse.json({ reply: result.text });
  } catch (err) {
    console.error("chat error:", err);
    return NextResponse.json({ error: "Chat failed." }, { status: 500 });
  }
}
