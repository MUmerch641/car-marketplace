import Link from "next/link";
import { ArrowLeft, Wrench } from "lucide-react";
import { Logo } from "@/components/Logo";
import { logoutAction } from "@/app/auth/actions";

export default function InspectorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-[#203a52] bg-[#0b1f33] text-white">
        <div className="mx-auto flex min-h-17 max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="Fengxing homepage"><Logo variant="dark" size="sm" /></Link>
            <span className="hidden border-l border-white/20 pl-4 text-sm font-semibold text-slate-300 sm:inline-flex"><Wrench size={16} className="mr-2" /> Inspector tools</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/" className="inline-flex items-center gap-1 text-slate-300 hover:text-white"><ArrowLeft size={15} /> Back to main website</Link>
            <form action={logoutAction}><button className="text-white hover:text-slate-300">Logout</button></form>
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
