"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  FileSearch,
  Sparkles,
  CheckCircle2,
  XCircle,
  Lightbulb
} from "lucide-react";
import RoleSuggester from "./RoleSuggester";

type Analysis = {
  score: number;
  summary: string;
  missingKeywords: string[];
  strengths: string[];
  improvements: string[];
  structureNotes: string[];
};

export default function ResumeAnalyzer({
  initialResume = ""
}: {
  initialResume?: string;
}) {
  const [resume, setResume] = useState(initialResume);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const handleAnalyze = async () => {
    if (resume.trim().length < 60) {
      setError("Please paste a more complete resume (at least 60 characters).");
      return;
    }
    setError(null);
    setLoading(true);
    setAnalysis(null);

    try {
      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to analyze resume");
      }
      const data = await res.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor =
    analysis && analysis.score >= 80
      ? "text-emerald-600"
      : analysis && analysis.score >= 60
        ? "text-amber-600"
        : "text-red-600";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <label className="mb-2 block text-sm font-medium text-navy-900">
          Your resume
        </label>
        <textarea
          value={resume}
          onChange={(e) => setResume(e.target.value)}
          rows={12}
          placeholder="Paste your resume text here..."
          className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm leading-relaxed text-navy-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {resume.length.toLocaleString()} characters
          </span>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-medium text-white shadow-soft transition hover:bg-navy-800 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSearch className="h-4 w-4" />
            )}
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Score card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    ATS Compatibility Score
                  </div>
                  <div className="mt-1 flex items-end gap-2">
                    <span className={`font-display text-5xl font-semibold ${scoreColor}`}>
                      {analysis.score}
                    </span>
                    <span className="mb-2 text-sm text-slate-400">/ 100</span>
                  </div>
                </div>
                <div className="flex-1 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  {analysis.summary}
                </div>
              </div>

              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${analysis.score}%` }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className={`h-full ${
                    analysis.score >= 80
                      ? "bg-emerald-500"
                      : analysis.score >= 60
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                />
              </div>
            </div>

            {/* Detail grids */}
            <div className="grid gap-5 md:grid-cols-2">
              <DetailCard
                title="Missing Keywords"
                icon={XCircle}
                iconColor="text-red-500"
                items={analysis.missingKeywords}
                empty="No critical keywords missing."
              />
              <DetailCard
                title="Strengths"
                icon={CheckCircle2}
                iconColor="text-emerald-500"
                items={analysis.strengths}
                empty="No strengths detected."
              />
              <DetailCard
                title="Improvements"
                icon={Lightbulb}
                iconColor="text-amber-500"
                items={analysis.improvements}
                empty="No improvement suggestions."
              />
              <DetailCard
                title="Structure Notes"
                icon={Sparkles}
                iconColor="text-indigo-500"
                items={analysis.structureNotes}
                empty="Structure looks good."
              />
            </div>

            <RoleSuggester resume={resume} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailCard({
  title,
  icon: Icon,
  iconColor,
  items,
  empty
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  items: string[];
  empty: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${iconColor}`} />
        <h3 className="font-display text-sm font-semibold text-navy-900">
          {title}
        </h3>
      </div>
      {items?.length ? (
        <ul className="mt-3 space-y-2">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex gap-2 text-sm leading-relaxed text-slate-600"
            >
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-400">{empty}</p>
      )}
    </div>
  );
}
