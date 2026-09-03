"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Wrench } from "lucide-react";
import BlurText from "@/components/BlurText";
import AnimatedContent from "@/components/AnimatedContent";
import FadeContent from "@/components/FadeContent";

const trustPoints = ["We come to your home or work", "Clear service updates", "Detailed inspection reports"];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0B1F33]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "repeating-linear-gradient(135deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px)" }}
      />
      <div id="hero-sentinel" className="absolute bottom-0 left-0 h-px w-px" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-0 px-5 lg:grid-cols-[1fr_1px_1.05fr] lg:px-8">
        <div className="py-14 lg:py-20 lg:pr-10">
          <AnimatedContent distance={20} duration={0.5}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-sm">
              <Wrench size={14} className="text-[#F97066]" />
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#D0D5DD]">Mobile car care across the UK</span>
            </div>
          </AnimatedContent>

          <div className="mt-5">
            <BlurText
              text="Car care and inspections, wherever you are."
              delay={70}
              animateBy="words"
              direction="bottom"
              stepDuration={0.3}
              className="text-[2.6rem] font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]"
            />
          </div>

          <AnimatedContent distance={24} duration={0.65} delay={0.3}>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#B8C4D1]">
              Book a qualified mobile service at home or work, or arrange an independent inspection before you buy. Shaz makes car ownership simpler.
            </p>
          </AnimatedContent>

          <AnimatedContent distance={20} duration={0.6} delay={0.42}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/services" className="inline-flex items-center gap-2 rounded-xl bg-[#D92D20] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-[#B42318]">
                Book a mobile service <ArrowRight size={16} />
              </Link>
              <Link href="/verification" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3.5 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/10">
                <ShieldCheck size={17} /> Request an inspection
              </Link>
            </div>
          </AnimatedContent>

          <AnimatedContent distance={16} duration={0.6} delay={0.54}>
            <ul className="mt-8 grid gap-2.5 text-sm text-[#D0D5DD] sm:grid-cols-2">
              {trustPoints.map((point) => (
                <li key={point} className="flex items-center gap-2"><CheckCircle2 size={16} className="shrink-0 text-[#7FDBCA]" />{point}</li>
              ))}
            </ul>
            <Link href="/cars" className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-[#B8C4D1] transition hover:text-white">
              Looking for a car instead? Browse the marketplace <ArrowRight size={15} />
            </Link>
          </AnimatedContent>
        </div>

        <div className="hidden h-full w-px bg-white/5 lg:block" />

        <AnimatedContent direction="horizontal" reverse distance={45} duration={0.85} delay={0.2} ease="power2.out" animateOpacity className="relative hidden overflow-hidden lg:block" style={{ height: "520px" }}>
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#0B1F33] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-[#0B1F33] to-transparent" />
          <Image src="https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=2000&q=90" alt="Shaz vehicle inspector reviewing a car" fill priority sizes="50vw" className="object-cover object-center" />
        </AnimatedContent>
      </div>

      <FadeContent delay={400} duration={700} className="relative mx-5 aspect-[16/9] overflow-hidden rounded-t-2xl lg:hidden">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-[#0B1F33] to-transparent" />
        <Image src="https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=1200&q=85" alt="Shaz vehicle inspector reviewing a car" fill priority sizes="100vw" className="object-cover object-center" />
      </FadeContent>
    </section>
  );
}
