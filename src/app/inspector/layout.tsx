import Link from "next/link";
import { ArrowLeft, LogOut, UserRound } from "lucide-react";
import { Logo } from "@/components/Logo";
import { logoutAction } from "@/app/auth/actions";
import { requireRole } from "@/lib/auth/server";
export default async function InspectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireRole("inspector");
  const name = profile.full_name || user.email?.split("@")[0] || "Inspector";
  return (
    <div className="min-h-screen bg-sand text-ink">
      <header className="sticky top-0 z-30 border-b border-[#E4E7E3] bg-sand/95 backdrop-blur-lg">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-3 px-5 lg:px-8">
          <Link
            href="/inspector"
            aria-label="Shaz inspector home"
            className="flex items-center gap-3"
          >
            <Logo variant="light" />
            <span className="hidden border-l border-[#B8C5BE] pl-3 text-xs font-semibold text-[#526568] sm:block">
              Inspector workspace
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/inspector/profile"
              className="flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-semibold"
            >
              <UserRound size={18} />
              <span className="hidden sm:inline">{name}</span>
            </Link>
            <Link
              href="/"
              aria-label="Go to website"
              className="grid h-11 w-11 place-items-center rounded-xl border border-[#E4E7E3] bg-white"
            >
              <ArrowLeft size={18} />
            </Link>
            <form action={logoutAction}>
              <button className="flex min-h-11 items-center gap-2 rounded-xl px-2 text-xs font-bold text-[#526568]">
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-6 lg:px-8">{children}</main>
    </div>
  );
}
