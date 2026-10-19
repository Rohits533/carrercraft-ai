import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Max 5MB." },
        { status: 400 }
      );
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const pdfParse = (await import("pdf-parse")).default;
    const parsed = await pdfParse(buffer);
    const text = (parsed.text || "").trim();

    if (text.length < 60) {
      return NextResponse.json(
        {
          error:
            "Couldn't extract enough text from this PDF. It may be image-based. Please paste the text manually."
        },
        { status: 400 }
      );
    }

    // 1. Save the PDF file to Supabase Storage (best-effort)
    try {
      const storagePath = `${user.id}/resume.pdf`;
      const { error: storageError } = await supabase.storage
        .from("resumes")
        .upload(storagePath, buffer, {
          contentType: "application/pdf",
          upsert: true
        });
      if (storageError) {
        console.warn("storage upload failed (non-fatal):", storageError.message);
      }
    } catch (storageErr) {
      console.warn("storage upload exception (non-fatal):", storageErr);
    }

    // 2. Save the extracted text to profiles (required for AI features)
    const { error: updateError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email,
        resume_text: text,
        updated_at: new Date().toISOString()
      });

    if (updateError) {
      console.error("profiles upsert error:", updateError);
      return NextResponse.json(
        { error: "Failed to save resume." },
        { status: 500 }
      );
    }

    return NextResponse.json({ text });
  } catch (err) {
    console.error("upload-resume error:", err);
    return NextResponse.json(
      { error: "Failed to process PDF. Try pasting the text instead." },
      { status: 500 }
    );
  }
}
