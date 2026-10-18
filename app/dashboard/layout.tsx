import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import FloatingChat from "@/components/FloatingChat";

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <div className="hidden w-64 shrink-0 md:block">
        <Sidebar email={user.email} />
      </div>
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
      </main>
      <FloatingChat />
    </div>
  );
}
