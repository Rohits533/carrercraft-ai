import { NextResponse } from "next/server";
import { getModel, extractJSON } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const SYSTEM = `You are an expert ATS (Applicant Tracking System) analyzer and resume coach.
Analyze resumes objectively and return ONLY valid JSON with this exact shape:
{
  "score": <integer 0-100>,
  "summary": "<2-3 sentence assessment>",
  "missingKeywords": ["..."],       // up to 8 high-impact keywords/phrases likely expected for this candidate's target roles that are missing or weak
  "strengths": ["..."],              // up to 5 concrete strengths
  "improvements": ["..."],           // up to 6 concrete, actionable improvements
  "structureNotes": ["..."]          // up to 4 notes on formatting, sections, readability, quantified impact
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

    const model = getModel(SYSTEM);
    const result = await model.generateContent(
      `Analyze the following resume:\n\n${resume.slice(0, 12000)}`
    );
    const text = result.response.text();
    const analysis = extractJSON<Analysis>(text);

    // Persist if user is signed in
    try {
      const supabase = await createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .upsert({
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
