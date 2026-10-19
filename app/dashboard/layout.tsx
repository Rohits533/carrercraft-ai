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
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Sidebar Container - fixed width, hidden on mobile, hidden on print */}
      <aside className="hidden w-64 shrink-0 md:flex flex-col border-r border-slate-200 bg-white print:hidden">
        <Sidebar email={user.email} />
      </aside>

      {/* Main Content Area - takes up remaining space, scrollable */}
      <main className="flex-1 flex flex-col overflow-y-auto scrollbar-thin">
        <div className="mx-auto w-full max-w-5xl px-6 py-10 print:max-w-full print:px-0 print:py-0">
          {children}
        </div>
      </main>

      {/* Floating Chat - hidden on print */}
      <div className="print:hidden">
        <FloatingChat />
      </div>
    </div>
  );
}
