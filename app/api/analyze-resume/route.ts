import { NextResponse } from "next/server";
import { ai, GEMINI_MODEL, extractJSON } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM = `You are an expert ATS (Applicant Tracking System) analyzer and resume coach.
Analyze resumes objectively and return ONLY valid JSON with this exact shape:
{
  "score": <integer 0-100>,
  "summary": "<2-3 sentence assessment>",
  "missingKeywords": ["..."],
  "strengths": ["..."],
  "improvements": ["..."],
  "structureNotes": ["..."]
}
Do not include markdown, commentary, or code fences. Return only the JSON object.`;

type Analysis = {
  score: number;
  summary: string;
  missingKeywords: string[];
  strengths: string[];
  improvements: string[];
  structureNotes: string[];
};

export async function POST(req: Request) {
  try {
    const { resume } = await req.json();
    if (!resume || typeof resume !== "string" || resume.trim().length < 60) {
      return NextResponse.json(
        { error: "Resume text is too short." },
        { status: 400 }
      );
    }

    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Analyze the following resume:\n\n${resume.slice(0, 12000)}`,
      config: { systemInstruction: SYSTEM }
    });

    const analysis = extractJSON<Analysis>(result.text ?? "");

    try {
      const supabase = await createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email,
          resume_text: resume,
          latest_ats_score: analysis.score,
          latest_analysis: analysis,
          updated_at: new Date().toISOString()
        });
      }
    } catch {
      // Persistence is best-effort
    }

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("analyze-resume error:", err);
    return NextResponse.json(
      { error: "Failed to analyze resume. Please try again." },
      { status: 500 }
    );
  }
}
