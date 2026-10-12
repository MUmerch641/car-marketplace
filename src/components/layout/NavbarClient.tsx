"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ChevronDown, UserRound, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { logoutAction } from "@/app/auth/actions";
import { WebPushBootstrap } from "@/components/notifications/web-push-bootstrap";
const links = [
  { href: "/services", label: "Service my car" },
  { href: "/verification", label: "Inspect a car" },
  { href: "/cars", label: "Cars" },
  { href: "/help", label: "Help" },
];
export function NavbarClient({
  profile,
}: {
  profile: { id: string; role: string } | null;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const account = useRef<HTMLDivElement>(null);
  const dashboardHref =
    profile?.role === "admin"
      ? "/admin"
      : profile?.role === "inspector"
        ? "/inspector"
        : "/dashboard";
  const customer =
    profile && profile.role !== "admin" && profile.role !== "inspector";
  const close = () => {
    setMobileOpen(false);
    setAccountOpen(false);
  };
  useEffect(() => {
    const click = (event: PointerEvent) => {
      if (account.current && !account.current.contains(event.target as Node))
        setAccountOpen(false);
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setAccountOpen(false);
      }
    };
    document.addEventListener("pointerdown", click);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", click);
      document.removeEventListener("keydown", key);
    };
  }, []);
  return (
    <header className="sticky top-0 z-50 border-b border-[#E4E7E3] bg-sand/95 text-ink backdrop-blur-lg">
      <WebPushBootstrap userId={profile?.id ?? null} />
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-3 px-5 lg:px-8">
        <Link href="/" onClick={close} aria-label="Shaz home">
          <Logo variant="light" />
        </Link>
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-7 lg:flex"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname.startsWith(link.href) ? "page" : undefined}
              className={`py-3 text-sm font-bold transition-colors hover:text-brand-hover ${pathname.startsWith(link.href) ? "text-brand-hover" : "text-[#526568]"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {profile && (
            <Link
              href="/notifications"
              aria-label="Notification settings"
              className="grid h-11 w-11 place-items-center rounded-xl hover:bg-white"
            >
              <Bell size={20} />
            </Link>
          )}

          {profile ? (
            <div ref={account} className="relative hidden sm:block">
              <button
                type="button"
                aria-expanded={accountOpen}
                aria-controls="account-menu"
                onClick={() => setAccountOpen((value) => !value)}
                className="flex min-h-12 items-center gap-2 rounded-xl px-3 text-sm font-bold"
              >
                <UserRound size={18} />
                Account
                <ChevronDown size={14} />
              </button>
              {accountOpen && (
                <div
                  id="account-menu"
                  className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl border border-[#E4E7E3] bg-white p-2 shadow-lg"
                >
                  <Link
                    href={dashboardHref}
                    onClick={close}
                    className="block rounded-xl px-3 py-3 text-sm font-semibold hover:bg-sand"
                  >
                    {customer ? "Home" : "Workspace"}
                  </Link>
                  {customer &&
                    [
                      { href: "/dashboard/bookings", label: "Visits" },
                      { href: "/dashboard/garage", label: "Garage" },
                      { href: "/dashboard/cars", label: "My listings" },
                      {
                        href: "/dashboard/verifications",
                        label: "Inspection reports",
                      },
                    ].map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={close}
                        className="block rounded-xl px-3 py-3 text-sm font-semibold hover:bg-sand"
                      >
                        {link.label}
                      </Link>
                    ))}
                  <form action={logoutAction}>
                    <button className="w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-brand-hover hover:bg-sand">
                      Sign out
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden min-h-12 items-center px-3 text-sm font-bold sm:inline-flex"
            >
              Sign in
            </Link>
          )}
          <Button href="/services" className="hidden sm:inline-flex">
            Book a service
          </Button>
          <button
            type="button"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen((value) => !value)}
            className="grid h-12 w-12 place-items-center rounded-2xl border border-[#E4E7E3] bg-white lg:hidden"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="border-t border-[#E4E7E3] bg-sand px-5 pb-5 pt-3 lg:hidden"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={close}
              className="block rounded-xl px-3 py-3 text-sm font-semibold hover:bg-white"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={profile ? dashboardHref : "/login"}
            onClick={close}
            className="block rounded-xl px-3 py-3 text-sm font-bold"
          >
            {profile ? "My account" : "Sign in"}
          </Link>
          <Link
            href="/services"
            onClick={close}
            className="mt-2 flex min-h-12 items-center justify-center rounded-[14px] bg-brand-hover text-sm font-bold text-white"
          >
            Book a service
          </Link>
        </nav>
      )}
    </header>
  );
}
