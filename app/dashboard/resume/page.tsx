import { createClient } from "@/lib/supabase/server";
import MotionWrapper from "@/components/MotionWrapper";
import ResumeAnalyzer from "@/components/ResumeAnalyzer";

export default async function ResumePage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("resume_text")
    .eq("id", user!.id)
    .single();

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
