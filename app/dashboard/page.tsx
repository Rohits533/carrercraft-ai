import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MotionWrapper from "@/components/MotionWrapper";
import {
  FileSearch,
  MessagesSquare,
  Target,
  ArrowRight,
  TrendingUp
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const analysis = profile?.latest_analysis as
    | { score?: number; roles?: { role: string; match: number }[] }
    | null;

  const cards = [
    {
      title: "ATS Score",
      value: analysis?.score ?? "—",
      sub: analysis?.score ? "Latest resume analysis" : "Run your first analysis",
      icon: TrendingUp,
      href: "/dashboard/resume"
    },
    {
      title: "Top Match",
      value: analysis?.roles?.[0]?.role ?? "—",
      sub: analysis?.roles?.[0]
        ? `${analysis.roles[0].match}% match`
        : "Discover roles",
      icon: Target,
      href: "/dashboard/resume"
    },
    {
      title: "Practice Sessions",
      value: "—",
      sub: "Sharpen your interview skills",
      icon: MessagesSquare,
      href: "/dashboard/interview"
    }
  ];

  return (
    <div className="space-y-8">
      <MotionWrapper>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-navy-900">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Here&apos;s a snapshot of your career readiness.
          </p>
        </div>
      </MotionWrapper>

      <div className="grid gap-5 sm:grid-cols-3">
        {cards.map((card, i) => (
          <MotionWrapper key={card.title} delay={0.05 * (i + 1)}>
            <Link
              href={card.href}
              className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-soft transition hover:shadow-card"
            >
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                  <card.icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
              </div>
              <div className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
                {card.title}
              </div>
              <div className="mt-1 font-display text-2xl font-semibold text-navy-900">
                {card.value}
              </div>
              <div className="mt-1 text-xs text-slate-500">{card.sub}</div>
            </Link>
          </MotionWrapper>
        ))}
      </div>

      <MotionWrapper delay={0.2}>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-soft">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <FileSearch className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold text-navy-900">
              Resume Studio
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Paste or upload your resume to get an ATS score, missing keywords,
              and structural fixes.
            </p>
            <Link
              href="/dashboard/resume"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Analyze resume <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-soft">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <MessagesSquare className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-display text-lg font-semibold text-navy-900">
              Interview Prep
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Generate tailored questions from your resume and get instant
              feedback on every answer.
            </p>
            <Link
              href="/dashboard/interview"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Start practicing <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </MotionWrapper>
    </div>
  );
}
