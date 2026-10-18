"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Target } from "lucide-react";

type Role = {
  role: string;
  match: number;
  reasoning: string;
  skillGaps: string[];
};

export default function RoleSuggester({ resume }: { resume: string }) {
  const [roles, setRoles] = useState<Role[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/suggest-roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume })
        });
        if (!res.ok) throw new Error("Failed to suggest roles");
        const data = await res.json();
        if (!cancelled) setRoles(data.roles);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [resume]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-indigo-500" />
        <h3 className="font-display text-base font-semibold text-navy-900">
          Role Matches
        </h3>
      </div>

      {loading && (
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Matching your profile to roles...
        </div>
      )}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {roles && (
        <div className="mt-4 space-y-3">
          {roles.map((role, i) => (
            <motion.div
              key={role.role}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium text-navy-900">{role.role}</div>
                <div className="flex items-center gap-1 text-sm font-semibold text-indigo-600">
                  {role.match}%
                </div>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-indigo-500"
                  style={{ width: `${role.match}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-slate-600">{role.reasoning}</p>
              {role.skillGaps?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {role.skillGaps.map((gap) => (
                    <span
                      key={gap}
                      className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200"
                    >
                      {gap}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
