import Image from "next/image";
import { Car, CheckCircle2, MapPin, ShieldCheck, Wrench } from "lucide-react";
import { CarCard } from "@/components/cars/car-card";
import { ServiceCard } from "@/components/services/service-card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { HeroSection } from "@/components/hero/HeroSection";
import AnimatedContent from "@/components/AnimatedContent";
import SpotlightCard from "@/components/SpotlightCard";
import { getHomepageCars } from "@/lib/marketplace/cars";
import { getActiveServices } from "@/lib/services/services";
import { CSS_STAGGER } from "@/lib/motion";

const serviceBenefits = [
  { icon: MapPin, title: "We come to you", copy: "Book at home, work, or another suitable location." },
  { icon: Wrench, title: "Qualified support", copy: "Choose practical care for the car you already own." },
  { icon: ShieldCheck, title: "Buy with confidence", copy: "Arrange an in-person inspection before committing to a car." },
];

export default async function HomePage() {
  const [cars, services] = await Promise.all([getHomepageCars(), getActiveServices(4)]);

  return (
    <>
      <HeroSection />

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <AnimatedContent distance={28} duration={0.7}>
            <SectionHeading eyebrow="Shaz mobile services" title="Care for your car without the garage trip" copy="Choose the service you need and book a time that works around your day." link={{ href: "/services", label: "View all services" }} />
          </AnimatedContent>
          {services.length ? (
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((service, index) => <AnimatedContent key={service.slug} distance={22} duration={0.65} delay={index * CSS_STAGGER.card / 1000}><ServiceCard service={service} /></AnimatedContent>)}
            </div>
          ) : (
            <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center"><p className="text-sm text-slate-600">Mobile services will be available soon.</p><Button href="/services" className="mt-5">Explore mobile services</Button></div>
          )}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-[#F5F6F7] py-14">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <AnimatedContent distance={28} duration={0.7}><SectionHeading eyebrow="Built around real car ownership" title="One place for the moments that matter" copy="From regular care to buying your next vehicle, Shaz keeps the important steps connected." /></AnimatedContent>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {serviceBenefits.map(({ icon: Icon, title, copy }, index) => <AnimatedContent key={title} distance={22} duration={0.65} delay={index * CSS_STAGGER.card / 1000}><SpotlightCard className="h-full rounded-2xl bg-white p-7 shadow-sm"><div className="grid h-11 w-11 place-items-center rounded-xl bg-[#FFF0EE] text-[#D92D20]"><Icon size={22} /></div><h3 className="mt-5 text-xl font-bold text-[#0B1F33]">{title}</h3><p className="mt-2 leading-7 text-slate-600">{copy}</p></SpotlightCard></AnimatedContent>)}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-2 lg:items-center lg:gap-14 lg:px-8">
          <AnimatedContent direction="horizontal" distance={45} duration={0.75} ease="power2.out"><div className="relative min-h-[330px] overflow-hidden rounded-2xl shadow-xl"><Image src="https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=1200&q=85" alt="Inspector reviewing a vehicle" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div></AnimatedContent>
          <AnimatedContent direction="horizontal" reverse distance={45} duration={0.75} delay={0.1} ease="power2.out"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D92D20]">Vehicle inspection</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0B1F33] sm:text-4xl">Know the car before you buy it</h2><p className="mt-4 max-w-lg leading-7 text-slate-600">Our inspector visits the vehicle in person and provides a clear condition report, helping you make an informed decision before you hand over money.</p><ul className="mt-6 grid gap-3 sm:grid-cols-2">{["Physical vehicle visit", "Condition assessment", "Photo evidence", "Detailed report"].map((item) => <li key={item} className="flex items-center gap-2 text-sm font-semibold text-slate-700"><CheckCircle2 size={16} className="text-emerald-600" />{item}</li>)}</ul><Button href="/verification" className="mt-8 px-7 py-3.5">Request an inspection</Button></div></AnimatedContent>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-[#F5F6F7] py-14">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <AnimatedContent distance={28} duration={0.7}><SectionHeading eyebrow="Car marketplace" title="Looking for your next car?" copy="Browse quality used-car listings when you are ready. Request an inspection for extra peace of mind before you buy." link={{ href: "/cars", label: "Browse all cars" }} /></AnimatedContent>
          {cars.length ? <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{cars.map((car, index) => <AnimatedContent key={car.id} distance={22} duration={0.65} delay={index * CSS_STAGGER.card / 1000}><CarCard car={car} /></AnimatedContent>)}</div> : <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><Car size={26} className="mx-auto text-slate-400" /><p className="mt-4 text-sm text-slate-600">New listings will appear here soon.</p><Button href="/sell-car" variant="outline" className="mt-5">Sell your car with Shaz</Button></div>}
          <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-[#0B1F33] p-7 text-white sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#F97066]">Selling a car?</p><h2 className="mt-2 text-2xl font-bold">Start with an inspection that builds buyer confidence.</h2></div><Button href="/sell-car" className="shrink-0">Sell my car</Button></div>
        </div>
      </section>
    </>
  );
}
