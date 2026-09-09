import Image from "next/image";
import { Car, CheckCircle2, Droplets, MapPin, ShieldCheck } from "lucide-react";
import { CarCard } from "@/components/cars/car-card";
import { OilFinder } from "@/components/services/oil-finder";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { HeroSection } from "@/components/hero/HeroSection";
import AnimatedContent from "@/components/AnimatedContent";
import { getHomepageCars } from "@/lib/marketplace/cars";
import { getActiveServices } from "@/lib/services/services";

const serviceBenefits = [
  { icon: MapPin, title: "We come to you", copy: "Book your oil change at home, work, or another suitable location." },
  { icon: Droplets, title: "The right oil", copy: "We match the oil and filter to the details of your vehicle." },
  { icon: ShieldCheck, title: "Buy with confidence", copy: "Arrange an in-person inspection before committing to a car." },
];

export default async function HomePage() {
  const [cars, activeServices] = await Promise.all([getHomepageCars(), getActiveServices()]);
  const oilService = activeServices.find((service) => service.slug === "oil-change" || /oil/i.test(service.name));

  return (
    <>
      <HeroSection />

      <section className="bg-white py-14">
        <AnimatedContent className="mx-auto max-w-7xl px-5 lg:px-8" distance={34} duration={0.82}>
          <SectionHeading eyebrow="Shaz mobile car care" title="Oil and filter changes without the garage trip" copy="Start with your registration. We identify the car and verify the right oil before your appointment." link={{ href: "/services", label: "About the service" }} />
          <div className="mt-8 grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[1.2fr_.8fr]">
            <div className="p-5 sm:p-7"><OilFinder compact /></div>
            <aside className="bg-[#082A30] p-6 text-white sm:p-7"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#FF8A73]">Oil &amp; filter change</p><p className="mt-4 text-3xl font-black">{oilService ? `From £${oilService.basePrice.toLocaleString("en-GB")}` : "Coming soon"}</p><p className="mt-3 text-sm leading-6 text-[#C6D1DC]">The final total depends on your car&apos;s approved oil specification and the quantity required.</p><ul className="mt-6 space-y-3 text-sm text-[#D0D5DD]">{["Oil specification checked", "New filter included", "Mobile visit", "Used oil handled responsibly"].map((item) => <li key={item} className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#FF8A73]" />{item}</li>)}</ul></aside>
          </div>
        </AnimatedContent>
      </section>

      <section className="border-y border-slate-200 bg-[#F7F4EF] py-14">
        <AnimatedContent className="mx-auto max-w-7xl px-5 lg:px-8" distance={34} duration={0.82}>
          <SectionHeading eyebrow="Everything around your car" title="Care for it. Check it. Buy or sell it." copy="Shaz connects practical car care with a trusted place to buy and sell vehicles." />
          <div className="mt-8 grid gap-5 md:grid-cols-3">{serviceBenefits.map(({ icon: Icon, title, copy }) => <article key={title} className="h-full rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#FFF0EE] text-[#E94A3F]"><Icon size={22} /></div><h3 className="mt-5 text-xl font-bold text-[#082A30]">{title}</h3><p className="mt-2 leading-7 text-slate-600">{copy}</p></article>)}</div>
        </AnimatedContent>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-2 lg:items-center lg:gap-14 lg:px-8">
          <AnimatedContent direction="horizontal" distance={42} duration={0.86}><div className="relative min-h-[330px] overflow-hidden rounded-2xl shadow-xl"><Image src="https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=1200&q=85" alt="Inspector reviewing a vehicle" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div></AnimatedContent>
          <AnimatedContent direction="horizontal" reverse distance={42} duration={0.86} delay={0.08}><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#E94A3F]">Vehicle inspection</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#082A30] sm:text-4xl">Know the car before you buy it</h2><p className="mt-4 max-w-lg leading-7 text-slate-600">Our inspector visits the vehicle in person and provides a clear condition report, helping you make an informed decision before you hand over money.</p><ul className="mt-6 grid gap-3 sm:grid-cols-2">{["Physical vehicle visit", "Condition assessment", "Photo evidence", "Detailed report"].map((item) => <li key={item} className="flex items-center gap-2 text-sm font-semibold text-slate-700"><CheckCircle2 size={16} className="text-emerald-600" />{item}</li>)}</ul><Button href="/verification" className="mt-8 px-7 py-3.5">Request an inspection</Button></div></AnimatedContent>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-[#F7F4EF] py-14">
        <AnimatedContent className="mx-auto max-w-7xl px-5 lg:px-8" distance={34} duration={0.82}>
          <SectionHeading eyebrow="Shaz car marketplace" title="Looking for your next car?" copy="Browse quality used-car listings, or list your own vehicle when you are ready to sell." link={{ href: "/cars", label: "Browse all cars" }} />
          {cars.length ? <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{cars.map((car) => <CarCard key={car.id} car={car} />)}</div> : <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><Car size={26} className="mx-auto text-slate-400" /><p className="mt-4 text-sm text-slate-600">New listings will appear here soon.</p><Button href="/sell-car" variant="outline" className="mt-5">Sell your car with Shaz</Button></div>}
          <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-[#082A30] p-7 text-white sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#FF8A73]">Selling a car?</p><h2 className="mt-2 text-2xl font-bold">Reach buyers and build confidence with an inspection.</h2></div><Button href="/sell-car" className="shrink-0">Sell my car</Button></div>
        </AnimatedContent>
      </section>
    </>
  );
}
