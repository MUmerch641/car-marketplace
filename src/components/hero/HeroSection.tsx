import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Droplets, ShieldCheck } from "lucide-react";

const trustPoints = ["We come to your home or work", "Oil matched to your vehicle", "Clear service updates"];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#082A30]">
      <div className="shaz-road-lines pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(135deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px)" }} />
      <div id="hero-sentinel" className="absolute bottom-0 left-0 h-px w-px" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-0 px-5 lg:grid-cols-[1fr_1px_1.05fr] lg:px-8">
        <div className="py-14 lg:py-20 lg:pr-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-sm"><Droplets size={14} className="text-[#FF8A73]" /><span className="text-xs font-bold uppercase tracking-[0.14em] text-[#D0D5DD]">Mobile oil &amp; filter change</span></div>

          <h1 className="mt-5 max-w-2xl text-[2.6rem] font-black leading-[1.08] tracking-[-0.045em] text-white sm:text-5xl lg:text-[3.25rem]">Car care that comes to you.</h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-[#B8C4D1]">Book a mobile oil and filter change at home or work. You can also buy or sell cars and arrange an independent vehicle inspection with Shaz.</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/services" className="shaz-button inline-flex items-center gap-2 rounded-xl bg-[#E94A3F] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-950/20 transition hover:-translate-y-0.5 hover:bg-[#C73830]">Book an oil change <ArrowRight size={16} /></Link>
            <Link href="/cars" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3.5 text-sm font-bold text-white transition hover:border-white/40 hover:bg-white/10">Browse cars</Link>
          </div>

          <ul className="mt-8 grid gap-2.5 text-sm text-[#D0D5DD] sm:grid-cols-2">{trustPoints.map((point) => <li key={point} className="flex items-center gap-2"><CheckCircle2 size={16} className="shrink-0 text-[#7FDBCA]" />{point}</li>)}</ul>
          <Link href="/verification" className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-[#B8C4D1] transition hover:text-white"><ShieldCheck size={15} /> Need confidence before buying? Request an inspection <ArrowRight size={15} /></Link>
        </div>

        <div className="hidden h-full w-px bg-white/5 lg:block" />
        <div className="relative hidden h-[520px] overflow-hidden lg:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#082A30] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-gradient-to-t from-[#082A30] to-transparent" />
          <Image src="https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=2000&q=90" alt="Shaz automotive professional working on a vehicle" fill priority sizes="50vw" className="object-cover object-center" />
        </div>
      </div>

      <div className="relative mx-5 aspect-[16/9] overflow-hidden rounded-t-2xl lg:hidden"><div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-[#082A30] to-transparent" /><Image src="https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=1200&q=85" alt="Shaz automotive professional working on a vehicle" fill priority sizes="100vw" className="object-cover object-center" /></div>
    </section>
  );
}
