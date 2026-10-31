import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MotionWrapper from "@/components/MotionWrapper";
import ResumeAnalyzer from "@/components/ResumeAnalyzer";

export default async function ResumePage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Guard against unauthenticated visitors (Prevents null.id crash)
  if (!user) {
    redirect("/login");
  }

  // 2. Safely query using validated user.id
  // Switched .single() to .maybeSingle() to prevent crash if profile row does not exist yet
  const { data: profile } = await supabase
    .from("profiles")
    .select("resume_text")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <MotionWrapper>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-navy-900">
            Resume Studio
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Get an ATS score, keyword gaps, and role matches in one pass.
          </p>
        </div>
      </MotionWrapper>
      <MotionWrapper delay={0.1}>
        <ResumeAnalyzer initialResume={profile?.resume_text || ""} />
      </MotionWrapper>
    </div>
  );
}
