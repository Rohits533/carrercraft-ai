import { createClient } from "@/lib/supabase/server";
import MotionWrapper from "@/components/MotionWrapper";
import ResumeAnalyzer from "@/components/ResumeAnalyzer";

export default async function ResumePage() {
  const supabase = await createClient();
  
  // Safely fetch user without throwing an unhandled exception
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialResumeText = "";

  // Only query Supabase database if a real user is signed in
  if (user?.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("resume_text")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.resume_text) {
      initialResumeText = profile.resume_text;
    }
  }

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
          {!user && (
            <div className="mt-2 rounded-md bg-amber-50 p-2 text-xs text-amber-800 border border-amber-200">
              ⚡ <strong>Guest Mode:</strong> You are using Resume Studio as a guest. Log in to save your results automatically.
            </div>
          )}
        </div>
      </MotionWrapper>
      <MotionWrapper delay={0.1}>
        <ResumeAnalyzer initialResume={initialResumeText} />
      </MotionWrapper>
    </div>
  );
}
