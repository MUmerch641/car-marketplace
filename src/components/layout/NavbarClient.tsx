"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/auth/actions";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";


interface NavbarClientProps {
  profile: { role: string } | null;
}

const navItems = [
  { href: "/cars", label: "Buy Cars" },
  { href: "/parts", label: "Parts" },
  { href: "/sell-car", label: "Sell My Car" },
  { href: "/verification", label: "Vehicle Inspection" },
  { href: "/services", label: "Mobile Services" },
  { href: "/about", label: "About" },
];

export function NavbarClient({ profile }: NavbarClientProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Use IntersectionObserver on a sentinel below the hero to detect scroll-past
    const sentinel = document.getElementById("hero-sentinel");
    if (!sentinel) {
      // Fallback: simple scroll listener if sentinel isn't on the page
      const onScroll = () => setScrolled(window.scrollY > 60);
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Close mobile menu on route change (if user clicks a link)
  const closeMobile = () => setMobileOpen(false);

  const dashboardHref =
    profile?.role === "admin"
      ? "/admin"
      : profile?.role === "inspector"
        ? "/inspector"
        : "/dashboard";

  return (
    <header
      className={[
        "sticky top-0 z-50 border-b border-[#203A52] bg-ink text-white",
        "transition-shadow duration-300",
        scrolled ? "shadow-[0_2px_16px_rgba(0,0,0,0.35)]" : "shadow-none",
      ].join(" ")}
    >
      <div className="mx-auto flex h-17 max-w-7xl items-center justify-between px-5 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center"
          onClick={closeMobile}
          aria-label="Fengxing — Go to homepage"
        >
          <Logo variant="dark" size="sm" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 xl:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "group relative text-sm font-semibold text-[#D0D5DD]",
                "transition-colors duration-200 hover:text-white",
                "after:absolute after:-bottom-0.5 after:left-0 after:h-0.5",
                "after:w-0 after:bg-[#D92D20] after:transition-[width] after:duration-200",
                "hover:after:w-full",
              ].join(" ")}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {profile ? (
            <>
            <div className="hidden sm:block relative group">
              <Link
                href={dashboardHref}
                className="flex items-center gap-1.5 text-sm font-bold text-white transition-opacity hover:opacity-80 py-2"
              >
                Account <span className="text-[10px] opacity-70">▼</span>
              </Link>
              <div className="absolute right-0 top-full w-48 pt-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-900/5">
                  <Link href={dashboardHref} className="px-4 py-3 text-sm font-semibold text-[#0b1f33] hover:bg-slate-50">Dashboard</Link>
                  <Link href="/dashboard/cars" className="px-4 py-3 text-sm font-semibold text-[#0b1f33] hover:bg-slate-50">My Cars</Link>
                  <Link href="/dashboard/garage" className="px-4 py-3 text-sm font-semibold text-[#0b1f33] hover:bg-slate-50">My Garage</Link>
                  <Link href="/dashboard/bookings" className="px-4 py-3 text-sm font-semibold text-[#0b1f33] border-b border-slate-100 hover:bg-slate-50">Bookings</Link>
                  <form action={logoutAction} className="block w-full">
                    <button type="submit" className="w-full px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">Logout</button>
                  </form>
                </div>
              </div>
            </div>
            </>
          ) : (
            <Link
              href="/login"
              className="hidden text-sm font-bold text-white transition-opacity hover:opacity-80 sm:block"
            >
              Login
            </Link>
          )}
          <Button href="/sell-car" className="px-4 py-2.5">
            Post Your Car
          </Button>

          {/* Mobile hamburger */}
          <button
            className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 xl:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span
              className={[
                "block h-0.5 w-5 bg-white transition-transform duration-300",
                mobileOpen ? "translate-y-2 rotate-45" : "",
              ].join(" ")}
            />
            <span
              className={[
                "block h-0.5 w-5 bg-white transition-opacity duration-200",
                mobileOpen ? "opacity-0" : "",
              ].join(" ")}
            />
            <span
              className={[
                "block h-0.5 w-5 bg-white transition-transform duration-300",
                mobileOpen ? "-translate-y-2 -rotate-45" : "",
              ].join(" ")}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu — smooth max-height transition */}
      <div
        className={[
          "overflow-hidden border-t border-[#1A3050] xl:hidden",
          "transition-[max-height,opacity] duration-300 ease-in-out",
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        ].join(" ")}
        aria-hidden={!mobileOpen}
      >
        <nav
          className="flex flex-col gap-1 px-5 py-4"
          aria-label="Mobile navigation"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobile}
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#D0D5DD] transition-colors hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 border-t border-[#1A3050] pt-3">
            {profile ? (
              <>
                <Link
                  href={dashboardHref}
                  onClick={closeMobile}
                  className="block rounded-lg px-3 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/5"
                >
                  Account
                </Link>
                <form action={logoutAction}>
                  <button className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-bold text-[#D0D5DD] transition-colors hover:bg-white/5 hover:text-white">
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                onClick={closeMobile}
                className="block rounded-lg px-3 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/5"
              >
                Login
              </Link>
            )}
          </div>
        </nav>
      </div>

      {/* Invisible ref for scroll detection */}
      <div ref={sentinelRef} />
    </header>
  );
}
