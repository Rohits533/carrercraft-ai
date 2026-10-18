import { NextResponse } from "next/server";
import { ai, GEMINI_MODEL, extractJSON } from "@/lib/gemini";

export const runtime = "nodejs";

const SYSTEM = `You are a career strategist who matches candidate resumes to job roles.
Return ONLY valid JSON with this exact shape:
{
  "roles": [
    {
      "role": "<job title>",
      "match": <integer 0-100>,
      "reasoning": "<2 sentence justification grounded in resume evidence>",
      "skillGaps": ["...", "..."]
    }
  ]
}
Return exactly 3 roles, ordered by match descending.
No markdown, no code fences, only JSON.`;

type RoleResult = {
  roles: {
    role: string;
    match: number;
    reasoning: string;
    skillGaps: string[];
  }[];
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
      contents: `Suggest the top 3 best-fit roles for this resume:\n\n${resume.slice(0, 12000)}`,
      config: { systemInstruction: SYSTEM }
    });

    const data = extractJSON<RoleResult>(result.text ?? "");
    return NextResponse.json(data);
  } catch (err) {
    console.error("suggest-roles error:", err);
    return NextResponse.json(
      { error: "Failed to suggest roles." },
      { status: 500 }
    );
  }
}
