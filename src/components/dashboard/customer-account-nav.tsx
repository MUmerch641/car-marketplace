import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard#garage", label: "My Garage" },
  { href: "/dashboard/bookings", label: "Bookings" },
  { href: "/dashboard/verifications", label: "Inspections" },
  { href: "/dashboard#listings", label: "Listings" },
];

export function CustomerAccountNav() {
  return (
    <nav aria-label="Customer account" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <details className="group sm:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm font-semibold text-[#0b1f33]">
            Account navigation <span className="text-slate-500 transition group-open:rotate-180" aria-hidden>⌄</span>
          </summary>
          <div className="grid gap-1 border-t border-slate-100 py-2">
            {links.map((link) => <Link key={link.href} href={link.href} className="rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#d92d20]">{link.label}</Link>)}
          </div>
        </details>
        <div className="hidden items-center gap-1 sm:flex">
          {links.map((link, index) => <Link key={link.href} href={link.href} className={`px-3 py-3.5 text-sm hover:text-[#d92d20] ${index === 0 ? "font-semibold text-[#0b1f33]" : "font-medium text-slate-600"}`}>{link.label}</Link>)}
        </div>
      </div>
    </nav>
  );
}
