"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/cars", label: "My Cars" },
  { href: "/dashboard/garage", label: "My Garage" },
  { href: "/dashboard/bookings", label: "Bookings" },
  { href: "/dashboard/verifications", label: "Inspections" },
];

export function CustomerAccountNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Customer account" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <details className="group sm:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm font-semibold text-[#0b1f33]">
            Account navigation <span className="text-slate-500 transition group-open:rotate-180" aria-hidden>⌄</span>
          </summary>
          <div className="grid gap-1 border-t border-slate-100 py-2">
            {links.map((link) => {
              const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={`rounded-md px-3 py-2.5 text-[15px] font-bold ${isActive ? 'bg-slate-50 text-[#d92d20]' : 'text-slate-700 hover:bg-slate-50 hover:text-[#d92d20]'}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </details>
        <div className="hidden items-center gap-8 sm:flex">
          {links.map((link) => {
            const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`relative py-4 text-[15px] transition-colors hover:text-[#0b1f33] ${isActive ? "font-bold text-[#0b1f33]" : "font-semibold text-slate-500"}`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-sm bg-[#d92d20]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
