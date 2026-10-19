"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Save, User as UserIcon, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import MotionWrapper from "@/components/MotionWrapper";

export default function ProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [resumeText, setResumeText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handlePdfUpload = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-resume", {
        method: "POST",
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setResumeText(data.text);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error: upsertError } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      full_name: fullName,
      resume_text: resumeText,
      updated_at: new Date().toISOString()
    });
    setSaving(false);
    if (upsertError) {
      setError("Couldn't save. Check Supabase schema.");
      return;
    }
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
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-navy-900">
                  Saved resume
                </label>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handlePdfUpload(f);
                      e.target.value = "";
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-navy-900 shadow-soft transition hover:border-slate-300 disabled:opacity-60"
                  >
                    {uploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    {uploading ? "Extracting..." : "Upload PDF"}
                  </button>
                </div>
              </div>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={10}
                placeholder="Paste your resume here, or upload a PDF above..."
                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm leading-relaxed text-navy-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-medium text-white shadow-soft transition hover:bg-navy-800 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save changes
            </button>
            {saved && (
              <span className="text-sm font-medium text-emerald-600">
                Saved!
              </span>
            )}
          </div>
        </div>
      </MotionWrapper>
    </div>
  );
}
