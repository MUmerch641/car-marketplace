import type { ReactNode } from "react";

export function AdminPageHeader({ eyebrow = "Operations", title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d92d20]">{eyebrow}</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0b1f33] sm:text-4xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}</div>{action && <div className="shrink-0">{action}</div>}</header>;
}

export function AdminStatus({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "amber" | "green" | "red" | "blue" }) {
  const styles = { slate: "bg-slate-100 text-slate-700 ring-slate-200", amber: "bg-amber-50 text-amber-800 ring-amber-200", green: "bg-emerald-50 text-emerald-800 ring-emerald-200", red: "bg-red-50 text-red-700 ring-red-200", blue: "bg-blue-50 text-blue-800 ring-blue-200" };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ring-inset ${styles[tone]}`}>{children}</span>;
}

export const adminInput = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#d92d20] focus:ring-4 focus:ring-red-100";
export const adminButton = "inline-flex items-center justify-center rounded-lg bg-[#d92d20] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#b42318] focus:outline-none focus:ring-4 focus:ring-red-100";
export const adminSecondaryButton = "inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100";
