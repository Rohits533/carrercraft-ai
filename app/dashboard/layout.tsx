import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import FloatingChat from "@/components/FloatingChat";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isGuest = !user;

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <aside className="hidden w-64 shrink-0 md:flex flex-col border-r border-slate-200 bg-white print:hidden">
        <Sidebar email={user?.email} isGuest={isGuest} />
      </aside>
      <main className="flex-1 flex flex-col overflow-y-auto scrollbar-thin">
        <div className="mx-auto w-full max-w-5xl px-6 py-10 print:max-w-full print:px-0 print:py-0">
          {children}
        </div>
      </main>
      <div className="print:hidden">
        <FloatingChat />
      </div>
    </div>
  );
}
