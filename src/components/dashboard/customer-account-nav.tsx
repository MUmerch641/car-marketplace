"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, CarFront, Search } from "lucide-react";
const links = [
  { href: "/dashboard", label: "Home", icon: Home, exact: true },
  { href: "/dashboard/bookings", label: "Visits", icon: CalendarDays },
  { href: "/dashboard/garage", label: "Garage", icon: CarFront },
  { href: "/cars", label: "Cars", icon: Search },
];
export function CustomerAccountNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Your Shaz account"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E4E7E3] bg-sand pb-[env(safe-area-inset-bottom)] sm:sticky sm:top-18 sm:border-b sm:border-t-0 sm:pb-0"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-around px-3 sm:justify-start sm:gap-7 sm:px-5 lg:px-8">
        {links.map(({ icon: Icon, ...link }) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-1 border-b-2 py-2 text-[11px] font-bold sm:min-h-14 sm:flex-none sm:flex-row sm:gap-2 sm:text-sm ${active ? "border-brand text-brand-hover" : "border-transparent text-[#526568] hover:text-ink"}`}
            >
              <Icon size={20} />
              {link.label}
            </Link>
          );
        })}
        <div className="ml-auto hidden gap-5 lg:flex">
          <Link
            href="/dashboard/cars"
            className={`py-4 text-xs font-semibold ${pathname.startsWith("/dashboard/cars") ? "text-brand-hover" : "text-[#526568]"}`}
          >
            My listings
          </Link>
          <Link
            href="/dashboard/verifications"
            className={`py-4 text-xs font-semibold ${pathname.startsWith("/dashboard/verifications") ? "text-brand-hover" : "text-[#526568]"}`}
          >
            Reports
          </Link>
          <Link
            href="/help"
            className="py-4 text-xs font-semibold text-[#526568]"
          >
            Help
          </Link>
        </div>
      </div>
    </nav>
  );
}
