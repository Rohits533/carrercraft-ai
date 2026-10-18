"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, User as UserIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import MotionWrapper from "@/components/MotionWrapper";

export default function ProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [resumeText, setResumeText] = useState("");

  useEffect(() => {
    const load = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || "");
      const { data } = await supabase
        .from("profiles")
        .select("full_name, resume_text")
        .eq("id", user.id)
        .single();
      setFullName(data?.full_name || "");
      setResumeText(data?.resume_text || "");
      setLoading(false);
    };
    load();
  }, [supabase]);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      full_name: fullName,
      resume_text: resumeText,
      updated_at: new Date().toISOString()
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading profile...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MotionWrapper>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-navy-900">
            Profile
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Keep your saved resume up to date — it powers analysis and interview
            prep.
          </p>
        </div>
      </MotionWrapper>

      <MotionWrapper delay={0.1}>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-indigo-50 text-indigo-600">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="font-medium text-navy-900">
                {fullName || "Your account"}
              </div>
              <div className="text-sm text-slate-500">{email}</div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-900">
                Full name
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-navy-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-navy-900">
                Saved resume
              </label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={10}
                placeholder="Paste your resume
