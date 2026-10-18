import { NextResponse } from "next/server";
import { ai, GEMINI_MODEL, extractJSON } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const SYSTEM = `You are a senior interview coach. Evaluate a candidate's interview answer with honesty and precision.
Return ONLY valid JSON with this exact shape:
{
  "score": <integer 0-100>,
  "strengths": ["..."],
  "improvements": ["..."],
  "sampleAnswer": "<a strong model answer, 3-6 sentences>"
}
No markdown, no code fences, only JSON.`;

export async function POST(req: Request) {
  try {
    const { question, answer, role } = await req.json();
    if (!question || !answer || answer.trim().length < 20) {
      return NextResponse.json(
        { error: "Question and a complete answer are required." },
        { status: 400 }
      );
    }

    let resumeContext = "";
    try {
      const supabase = await createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("resume_text")
          .eq("id", user.id)
          .single();
        if (data?.resume_text) {
          resumeContext = `\nCandidate resume (for tailoring the sample answer):\n${data.resume_text.slice(0, 6000)}`;
        }
      }
    } catch {
      // ignore
    }

    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Target role: ${role || "Not specified"}\nInterview question: ${question}\nCandidate answer:\n${answer}${resumeContext}`,
      config: { systemInstruction: SYSTEM }
    });

    const feedback = extractJSON<{
      score: number;
      strengths: string[];
      improvements: string[];
      sampleAnswer: string;
    }>(result.text ?? "");

    return NextResponse.json({ feedback });
  } catch (err) {
    console.error("interview/feedback error:", err);
    return NextResponse.json(
      { error: "Failed to generate feedback." },
      { status: 500 }
    );
  }
}
