"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  LayoutDashboard,
  FileSearch,
  MessagesSquare,
  User,
  LogOut
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/resume", label: "Resume Studio", icon: FileSearch },
  { href: "/dashboard/interview", label: "Interview Prep", icon: MessagesSquare },
  { href: "/dashboard/profile", label: "Profile", icon: User }
];

export default function Sidebar({ email }: { email?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="flex h-full w-full flex-col justify-between border-r border-slate-200 bg-white p-5">
      <div>
        <Link href="/dashboard" className="mb-8 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-white shadow-soft">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-display text-base font-semibold tracking-tight text-navy-900">
            CareerCraft
          </span>
        </Link>

        <nav className="space-y-1">
          {navItems.map((item) => {
           
