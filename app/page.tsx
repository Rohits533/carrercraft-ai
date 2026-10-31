"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  FileSearch,
  Target,
  MessagesSquare,
  ArrowRight,
  ShieldCheck,
  Zap
} from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "ATS Resume Scoring",
    description: "Instant, honest scoring against real ATS heuristics — with actionable keyword and structural gaps."
  },
  {
    icon: Target,
    title: "Role Matching Engine",
    description: "Discover the top 3 roles that fit your profile, complete with match percentages and skill gaps."
  },
  {
    icon: MessagesSquare,
    title: "Gemini Career Copilot",
    description: "A floating AI consultant that knows your resume and helps rewrite bullets and prep answers."
  },
  {
    icon: Zap,
    title: "Live Interview Drill",
    description: "Practice role-specific questions generated from your resume, with instant AI feedback."
  }
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-20%] h-[480px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-100/60 blur-3xl" />
        <div className="absolute right-[-10%] top-[40%] h-[360px] w-[360px] rounded-full bg-slate-200/70 blur-3xl" />
      </div>

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white shadow-soft">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">CareerCraft AI</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm font-medium text-slate-600 hover:text-navy-900 sm:block">
            Sign in
          </Link>
          <Link href="/login" className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-navy-800">
            Get started
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-16 sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-soft">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
            Powered by Google Gemini
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-navy-900 text-balance sm:text-5xl md:text-6xl">
            Land the role you&apos;re{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
              actually built for.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-600 sm:text-lg">
            CareerCraft AI evaluates your resume the way ATS systems do, matches you to roles with real signal, and drills you with tailored interview prep.
          </p>
          
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-xl bg-navy-900 px-6 py-3 text-sm font-medium text-white shadow-card transition hover:bg-navy-800"
            >
              Create account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/dashboard/resume?guest=true"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-navy-900 shadow-soft transition hover:border-slate-300"
            >
              <Zap className="h-4 w-4 text-indigo-600" />
              Try for free (No login)
            </Link>
          </div>
        </motion.div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="rounded-2xl border border-slate-200 bg-white p-7 shadow-soft transition hover:shadow-card"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-navy-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
