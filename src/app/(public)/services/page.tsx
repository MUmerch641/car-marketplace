import { CheckCircle2, Clock3, Droplets, MapPin, Recycle } from "lucide-react";
import { PageHero } from "@/components/shared/page-hero";
import { OilFinder } from "@/components/services/oil-finder";
import AnimatedContent from "@/components/AnimatedContent";
import { Button } from "@/components/ui/button";
import { ShazGuide } from "@/components/shaz/guide";
import { getActiveServices } from "@/lib/services/services";

const included = ["Manufacturer-approved oil specification", "New oil filter", "Mobile visit at your chosen location", "Responsible handling of used oil"];

export default async function ServicesPage() {
  const activeServices = await getActiveServices();
  const oilService = activeServices.find((service) => service.slug === "oil-change" || /oil/i.test(service.name));

  return (
    <>
      <PageHero eyebrow="Shaz mobile car care" title="Let’s look after your car" copy="Request an oil and filter change at home or work. Shaz confirms your full quote before you pay." />

      <section className="bg-sand py-8 sm:py-10">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[1.1fr_.9fr] lg:px-8">
          <AnimatedContent distance={30} duration={0.78}><OilFinder /></AnimatedContent>
          <AnimatedContent direction="horizontal" reverse distance={34} duration={0.82} delay={0.08}><aside className="h-full rounded-2xl bg-[#082A30] p-7 text-white sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[.15em] text-[#FF8A73]">One service, done properly</p>
            <h2 className="mt-3 text-3xl font-bold">What is included</h2>
            <ul className="mt-7 space-y-4">{included.map((item) => <li key={item} className="flex gap-3 text-sm leading-6 text-[#B8C5BE]"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#7FDBCA]" />{item}</li>)}</ul>
            <Button href="/services/oil-change/book" className="mt-6 w-full">Request my visit</Button>
            <div className="mt-6 border-t border-white/10 pt-6"><p className="text-sm text-[#98A2B3]">Starting service price</p><p className="mt-1 text-4xl font-black">{oilService ? `£${oilService.basePrice.toLocaleString("en-GB")}` : "Coming soon"}</p><p className="mt-2 text-sm text-[#98A2B3]">The final price depends on the approved oil and quantity required.</p></div>
          </aside></AnimatedContent>
        </div>
      </section>

      <section className="bg-sand pb-10"><div className="mx-auto max-w-7xl px-5 lg:px-8"><ShazGuide title="The whole quote, before you pay">Review your confirmed parts and service costs together, then pay the full amount before the visit. Your preferred slot is a request until Shaz confirms it.</ShazGuide></div></section>
      <section className="bg-white py-12">
        <AnimatedContent className="mx-auto max-w-7xl px-5 lg:px-8" distance={34} duration={0.82}>
          <p className="text-xs font-bold uppercase tracking-[.15em] text-[#E94A3F]">How it works</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-[#082A30]">From registration to a completed oil change</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-4">{[
            { icon: Droplets, title: "Match", copy: "We identify your vehicle and verify its oil specification." },
            { icon: Clock3, title: "Book", copy: "Choose a preferred date and time that suits you." },
            { icon: MapPin, title: "Quote & pay", copy: "Review the confirmed total and pay in full before your visit." },
            { icon: Recycle, title: "We visit", copy: "Your mechanic carries out the service and records its completion." },
          ].map(({ icon: Icon, title, copy }, index) => <article key={title} className="rounded-xl border border-slate-200 p-6"><span className="text-xs font-black text-[#E94A3F]">0{index + 1}</span><Icon size={22} className="mt-5 text-[#082A30]" /><h3 className="mt-4 font-bold text-[#082A30]">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p></article>)}</div>
        </AnimatedContent>
      </section>
    </>
  );
}
