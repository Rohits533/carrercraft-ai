import MotionWrapper from "@/components/MotionWrapper";
import InterviewPrep from "@/components/InterviewPrep";

export default function InterviewPage() {
  return (
    <div className="space-y-6">
      <MotionWrapper>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-navy-900">
            Interview Prep
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Practice with questions tailored to your resume and get instant AI
            feedback.
          </p>
        </div>
      </MotionWrapper>
      <MotionWrapper delay={0.1}>
        <InterviewPrep />
      </MotionWrapper>
    </div>
  );
}
