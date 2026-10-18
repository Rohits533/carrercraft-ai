import { NextResponse } from "next/server";
import { ai, GEMINI_MODEL, extractJSON } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const SYSTEM = `You are a senior interview coach. Return ONLY valid JSON with shape { score, strengths, improvements, sampleAnswer }.`;

export async function POST(req: Request) {
  try {
    const { question, answer, role } = await req.json();
    if (!question || !answer || answer.trim().length < 20) {
      return NextResponse.json({ error: "Question and complete answer required." }, { status: 400 });
    }

    let resumeContext = "";
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("resume_text").eq("id", user.id).single();
        if (data?.resume_text) {
          resumeContext = `\nCandidate resume:\n${data.resume_text.slice(0, 6000)}`;
        }
      }
    } catch {}

    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Target role: ${role || "Not specified"}\nQuestion: ${question}\nAnswer:\n${answer}${resumeContext}`,
      config: { systemInstruction: SYSTEM }
    });

    return NextResponse.json({ feedback: extractJSON(result.text) });
  } catch (err) {
    console.error("interview/feedback error:", err);
    return NextResponse.json({ error: "Failed to generate feedback." }, { status: 500 });
  }
}
