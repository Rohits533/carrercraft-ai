"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  MessagesSquare,
  Sparkles,
  ArrowRight,
  RotateCcw
} from "lucide-react";

type Question = {
  question: string;
  category: string;
};

type Feedback = {
  score: number;
  strengths: string[];
  improvements: string[];
  sampleAnswer: string;
};

export default function InterviewPrep({
  hasResume
}: {
  hasResume: boolean;
}) {
  const [role, setRole] = useState("");
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQuestions = async () => {
    if (!hasResume) {
      setError("Please save a resume first in Resume Studio.");
      return;
    }
    setError(null);
    setLoadingQuestions(true);
    setQuestions(null);
    setFeedback(null);
    setCurrent(0);
    setAnswer("");
    try {
      const res = await fetch("/api/interview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });
      if (!res.ok) throw new Error("Failed to generate questions");
      const data = await res.json();
      setQuestions(data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const submitAnswer = async () => {
    if (!questions) return;
    if (answer.trim().length < 20) {
      setError("Please write a more complete answer (20+ characters).");
      return;
    }
    setError(null);
    setLoadingFeedback(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/interview/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questions[current].question,
          answer,
          role
        })
      });
      if (!res.ok) throw new Error("Failed to get feedback");
      const data = await res.json();
      setFeedback(data.feedback);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoadingFeedback(false);
    }
  };

  const nextQuestion = () => {
    if (!questions) return;
    setFeedback(null);
    setAnswer("");
    setError(null);
    setCurrent((c) => Math.min(c + 1, questions.length - 1));
  };

  const reset = () => {
    setQuestions(null);
    setFeedback(null);
    setAnswer("");
    setCurrent(0);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {!questions && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="font-display text-base font-semibold text-navy-900">
            Set up your practice session
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Questions are generated from your saved resume. Optionally specify a
            target role.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Target role (optional), e.g. Frontend Engineer"
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            <button
              onClick={generateQuestions}
              disabled={loadingQuestions}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-medium text-white shadow-soft transition hover:bg-navy-800 disabled:opacity-60"
            >
              {loadingQuestions ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate questions
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      )}

      <AnimatePresence>
        {questions && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <MessagesSquare className="h-4 w-4 text-indigo-500" />
                Question {current + 1} of {questions.length}
              </div>
              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-navy-900"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>

            <div className="mt-3 rounded-xl bg-slate-50 p-5">
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                {questions[current].category}
              </span>
              <p className="mt-3 font-display text-lg font-medium leading-relaxed text-navy-900">
                {questions[current].question}
              </p>
            </div>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
              placeholder="Type your answer..."
              className="mt-4 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-navy-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            <div className="mt-4 flex items-center justify-end gap-3">
              {feedback && current < questions.length - 1 && (
                <button
                  onClick={nextQuestion}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-navy-900 shadow-soft transition hover:border-slate-300"
                >
                  Next question <ArrowRight className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={submitAnswer}
                disabled={loadingFeedback}
                className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-medium text-white shadow-soft transition hover:bg-navy-800 disabled:opacity-60"
              >
                {loadingFeedback ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Get AI feedback
              </button>
            </div>

            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 space-y-4 border-t border-slate-200 pt-5"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 font-display text-lg font-semibold text-indigo-600">
                    {feedback.score}
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Answer score
                    </div>
                    <div className="text-sm text-slate-600">
                      Out of 100 based on clarity, depth, and relevance.
                    </div>
                  </div>
                </div>

                <FeedbackList
                  title="Strengths"
                  items={feedback.strengths}
                  color="text-emerald-600"
                />
                <FeedbackList
                  title="Improvements"
                  items={feedback.improvements}
                  color="text-amber-600"
                />

                <div>
                  <h4 className="text-sm font-semibold text-navy-900">
                    Sample answer
                  </h4>
                  <p className="mt-2 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                    {feedback.sampleAnswer}
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FeedbackList({
  title,
  items,
  color
}: {
  title: string;
  items: string[];
  color: string;
}) {
  if (!items?.length) return null;
  return (
    <div>
      <h4 className={`text-sm font-semibold ${color}`}>{title}</h4>
      <ul className="mt-2 space-y-1.5">
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
    </div>
  );
}
