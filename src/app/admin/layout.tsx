import Link from "next/link";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { requireRole } from "@/lib/auth/server";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole("admin");

  return (
    <div className="min-h-screen bg-[#f6f8fb] md:h-screen md:overflow-hidden">
      <AdminSidebar />
      <section className="min-w-0 md:ml-64 md:h-screen md:overflow-y-auto">
        <div className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">
          <div>
            <p className="text-xs font-semibold text-slate-400">Shaz / Admin</p>
            <p className="text-sm font-bold text-[#0b1f33]">Operations centre</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs font-semibold text-slate-600 hover:text-[#d92d20] sm:text-sm">View Shaz website ↗</Link>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-slate-800">{profile.full_name || "Administrator"}</p>
              <p className="text-xs text-slate-500">Admin account</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0b1f33] text-sm font-bold text-white">{(profile.full_name || "A").slice(0, 1).toUpperCase()}</div>
          </div>
        </div>
        {children}
      </section>
    </div>
  );
}
