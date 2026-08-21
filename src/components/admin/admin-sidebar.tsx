"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CarFront, ClipboardCheck, LayoutDashboard, Mail, Settings2, ShieldCheck, UsersRound, Wrench } from "lucide-react";
import { Logo } from "@/components/Logo";

const navigation = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Vehicle moderation", href: "/admin/cars", icon: CarFront },
  { label: "Service bookings", href: "/admin/bookings", icon: ClipboardCheck },
  { label: "Verifications", href: "/admin/verifications", icon: ShieldCheck },
  { label: "Service catalogue", href: "/admin/services", icon: Wrench },
  { label: "Parts catalogue", href: "/admin/parts", icon: Wrench },
  { label: "Email templates", href: "/admin/emails", icon: Mail },
  { label: "People", href: "/admin/users", icon: UsersRound },
  { label: "Staff access", href: "/admin/staff", icon: Settings2 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex min-h-full w-full flex-col bg-[#071a2d] text-slate-300 md:fixed md:inset-y-0 md:left-0 md:z-30 md:h-screen md:w-64">
      <div className="flex h-[76px] items-center border-b border-white/10 px-5">
        <Link href="/admin" aria-label="Fengxing operations home"><Logo size="sm" /></Link>
      </div>
      <div className="border-b border-white/10 px-5 py-4"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Control centre</p><p className="mt-1 text-sm font-semibold text-white">Operations workspace</p></div>
      <nav className="flex gap-1 overflow-x-auto p-3 md:flex-1 md:flex-col md:gap-1 md:space-y-0 md:overflow-x-hidden md:overflow-y-auto md:p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {navigation.map(({ label, href, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return <Link key={href} href={href} className={`group flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${active ? "bg-[#d92d20] text-white shadow-lg shadow-red-950/30" : "hover:bg-white/8 hover:text-white"}`}>
            <Icon size={18} strokeWidth={active ? 2.3 : 1.8} />{label}
          </Link>;
        })}
      </nav>
      <div className="mt-auto hidden border-t border-white/10 p-4 md:block"><Link href="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-white/8 hover:text-white">View public site <span aria-hidden>↗</span></Link></div>
    </aside>
  );
}
