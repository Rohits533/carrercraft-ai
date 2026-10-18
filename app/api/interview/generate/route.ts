import { NextResponse } from "next/server";
import { ai, GEMINI_MODEL, extractJSON } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const SYSTEM = `You are a hiring manager. Return ONLY valid JSON with shape { questions: [{ question, category }] }. Produce exactly 5 questions.`;

export async function POST(req: Request) {
  try {
    const { role } = await req.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("resume_text")
      .eq("id", user.id)
      .single();

    if (!profile?.resume_text) {
      return NextResponse.json({ error: "Please save a resume first." }, { status: 400 });
    }

    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Target role: ${role || "infer from resume"}\nResume:\n${profile.resume_text.slice(0, 10000)}`,
      config: { systemInstruction: SYSTEM }
    });

    return NextResponse.json(extractJSON<{ questions: { question: string; category: string }[] }>(result.text));
  } catch (err) {
    console.error("interview/generate error:", err);
    return NextResponse.json({ error: "Failed to generate questions." }, { status: 500 });
  }
}
