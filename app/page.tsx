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
    description:
      "Instant, honest scoring against real ATS heuristics — with actionable keyword and structural gaps."
  },
  {
    icon: Target,
    title: "Role Matching Engine",
    description:
      "Discover the top 3 roles that fit your profile, complete with match percentages and skill gaps."
  },
  {
    icon: MessagesSquare,
    title: "Gemini Career Copilot",
    description:
      "A floating AI consultant that knows your resume and helps rewrite bullets and prep answers."
  },
  {
    icon: Zap,
    title: "Live Interview Drill",
    description:
      "Practice role-specific questions generated from your resume, with instant AI feedback."
  }
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-20%] h-[480px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-100/60 blur-3xl" />
        <div className="absolute right-[-10%] top-[40%] h-[360px] w-[360px] rounded-full bg-slate-200/70 blur-3xl" />
      </div>

      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white shadow-soft">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            CareerCraft AI
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-slate-600 hover:text-navy-900 sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-white shadow-soft transition hover:bg-navy-800"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
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
            CareerCraft AI evaluates your resume the way ATS systems do, matches
            you to roles with real signal, and drills you with tailored
            interview prep — all in one refined workspace.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-xl bg-navy-900 px-6 py-3 text-sm font-medium text-white shadow-card transition hover:bg-navy-800"
            >
              Start free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-navy-900 shadow-soft transition hover:border-slate-300"
            >
              Explore features
            </Link>
          </div>
        </motion.div>

        {/* Product preview */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-16 max-w-4xl rounded-2xl border border-slate-200 bg-white p-2 shadow-card"
        >
          <div className="rounded-xl bg-slate-50 p-6 sm:p-10">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "ATS Score", value: "87", sub: "+12 vs last" },
                { label: "Best Match", value: "Product", sub: "94% fit" },
                { label: "Skills Gaps", value: "3", sub: "to close" }
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft"
                >
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {stat.label}
                  </div>
                  <div className="mt-2 font-display text-3xl font-semibold text-navy-900">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs text-indigo-600">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl">
            A workspace built for outcomes.
          </h2>
          <p className="mt-4 text-slate-600">
            Every feature removes friction between where you are and where you
            want to be.
          </p>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
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
              <h3 className="mt-4 font-display text-lg font-semibold text-navy-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-navy-900 px-8 py-16 text-center shadow-card sm:px-16">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 rounded-full bg-indigo-500/30 blur-3xl" />
          </div>
          <div className="relative">
            <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
              Your next offer starts with a better resume.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-300">
              Get a free ATS score, role matches, and a personalized interview
              plan in under two minutes.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-medium text-navy-900 shadow-soft transition hover:bg-slate-100"
            >
              Create your account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} CareerCraft AI. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
