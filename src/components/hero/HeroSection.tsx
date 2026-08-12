"use client";

import Image from "next/image";
import Link from "next/link";
import BlurText from "@/components/BlurText";
import AnimatedContent from "@/components/AnimatedContent";
import FadeContent from "@/components/FadeContent";
import { HeroSearchPanel } from "./HeroSearchPanel";

const trustLinks = [
  { label: "Used Cars", href: "/cars" },
  { label: "Sell My Car", href: "/sell-car" },
  { label: "Vehicle Inspection", href: "/verification" },
  { label: "Mobile Services", href: "/services" },
];

const popularMakes = ["BMW", "Audi", "Mercedes-Benz", "Volkswagen", "Ford"];

export function HeroSection() {
  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0B1F33]">
        {/* Subtle diagonal texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px)",
          }}
        />

        {/* Sentinel div — NavbarClient IntersectionObserver watches this */}
        <div id="hero-sentinel" className="absolute bottom-0 left-0 h-px w-px" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-0 px-5 lg:grid-cols-[1fr_1px_1.05fr] lg:px-8">
          {/* ── Left: Content ─────────────────────────────────── */}
          <div className="py-14 lg:py-20 lg:pr-10">
            {/* Eyebrow */}
            <AnimatedContent distance={20} duration={0.5} delay={0}>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#D92D20]" />
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#D0D5DD]">
                  UK&apos;s Trusted Car Marketplace
                </span>
              </div>
            </AnimatedContent>

            {/* Headline */}
            <div className="mt-5">
              <BlurText
                text="Find Your Next Car"
                delay={80}
                animateBy="words"
                direction="bottom"
                stepDuration={0.3}
                className="text-[2.6rem] font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]"
              />
            </div>

            {/* Supporting copy */}
            <AnimatedContent distance={24} duration={0.65} delay={0.3}>
              <p className="mt-5 max-w-md text-base leading-7 text-[#94A3B8]">
                Browse thousands of quality used vehicles from verified sellers
                across the UK — inspected, trusted, and ready to drive away.
              </p>
            </AnimatedContent>

            {/* Trust / quick links */}
            <AnimatedContent distance={16} duration={0.6} delay={0.45}>
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
                {trustLinks.map((link, i) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center gap-1.5 text-sm font-semibold text-[#94A3B8] transition-colors hover:text-white"
                  >
                    {i > 0 && (
                      <span className="mr-0 h-3.5 w-px bg-white/15" />
                    )}
                    {link.label}
                  </Link>
                ))}
              </div>
            </AnimatedContent>

            {/* Popular searches */}
            <AnimatedContent distance={16} duration={0.6} delay={0.55}>
              <div className="mt-7 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                  Popular:
                </span>
                {popularMakes.map((make) => (
                  <Link
                    key={make}
                    href={`/cars?make=${make}`}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-[#CBD5E1] transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
                  >
                    {make}
                  </Link>
                ))}
              </div>
            </AnimatedContent>
          </div>

          {/* Vertical divider (desktop only) */}
          <div className="hidden h-full w-px bg-white/5 lg:block" />

          {/* ── Right: Vehicle Image — slides in from right ───────────── */}
          <AnimatedContent
            direction="horizontal"
            reverse
            distance={45}
            duration={0.85}
            delay={0.2}
            ease="power2.out"
            animateOpacity
            className="relative hidden overflow-hidden lg:block"
            style={{ height: "520px" }}
          >
            {/* Left-side fade blending into navy */}
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#0B1F33] to-transparent" />
            {/* Bottom fade */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-[#0B1F33] to-transparent" />

            <Image
              src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=2000&q=90"
              alt="Premium silver sports car on an open road"
              fill
              priority
              sizes="50vw"
              className="object-cover object-center"
            />
          </AnimatedContent>
        </div>

        {/* Mobile image — subtle fade, no directional movement */}
        <FadeContent delay={400} duration={700} className="relative mx-5 mb-0 aspect-[16/9] overflow-hidden rounded-t-2xl lg:hidden">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-[#0B1F33] to-transparent" />
          <Image
            src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=85"
            alt="Premium silver sports car on an open road"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </FadeContent>
      </section>

      {/* ── Floating Search Panel — premium entrance ─────────────────────── */}
      <AnimatedContent
        distance={24}
        scale={0.98}
        duration={0.7}
        delay={0.15}
        ease="power2.out"
        className="relative z-20 -mt-8 px-5 pb-2 lg:px-8"
      >
        <div className="mx-auto max-w-5xl">
          <HeroSearchPanel />
        </div>
      </AnimatedContent>
    </>
  );
}
