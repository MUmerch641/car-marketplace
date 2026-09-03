import Link from "next/link";
import { ArrowLeft, Navigation, LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { logoutAction } from "@/app/auth/actions";
import { requireRole } from "@/lib/auth/server";

export default async function InspectorLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireRole("inspector");
  const workerName = profile.full_name || user.email?.split("@")[0] || "Field Worker";

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-800 antialiased">
      {/* Field Worker Header */}
      <header className="sticky top-0 z-30 border-b border-[#203a52] bg-[#0b1f33] text-white shadow-md">
        <div className="mx-auto flex min-h-[64px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Logo & Workspace Title */}
          <div className="flex items-center gap-3">
            <Link href="/inspector" className="flex items-center gap-2.5">
              <Logo variant="dark" size="sm" />
              <span className="hidden h-5 w-[1px] bg-white/20 sm:block" />
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#fda29b] sm:text-sm">
                <Navigation size={15} className="text-[#fda29b]" />
                Shaz Field
              </span>
            </Link>
          </div>

          {/* Right Header Navigation: Worker Name, Back to website, Logout */}
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2 border-r border-white/15 pr-3 text-xs sm:pr-6 sm:text-sm">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d92d20] text-xs font-bold text-white uppercase">
                {workerName.slice(0, 1)}
              </div>
              <span className="hidden font-semibold text-slate-200 sm:inline">{workerName}</span>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 transition-colors hover:text-white sm:text-sm"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Back to website</span>
              <span className="sm:hidden">Website</span>
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white sm:text-sm"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
