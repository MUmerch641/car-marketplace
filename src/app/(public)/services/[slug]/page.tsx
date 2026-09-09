import { notFound } from "next/navigation";
import { CheckCircle2, Clock3, MapPin, ShieldCheck } from "lucide-react";
import { OilFinder } from "@/components/services/oil-finder";
import { getActiveService } from "@/lib/services/services";

export default async function ServiceDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getActiveService(slug);
  if (!service || service.slug !== "oil-change") notFound();
  const duration = service.estimatedDurationMinutes ? `Around ${service.estimatedDurationMinutes} minutes` : "Confirmed with your booking";

  return (
    <main>
      <section className="bg-[#082A30] py-12 text-white lg:py-16"><div className="mx-auto grid max-w-7xl gap-8 px-5 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:px-8"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#FF8A73]">Shaz mobile car care</p><h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{service.name}</h1><p className="mt-5 max-w-xl text-lg leading-8 text-[#C6D1DC]">{service.description}</p><div className="mt-7 flex flex-wrap gap-5 text-sm font-semibold text-[#D0D5DD]"><span className="inline-flex items-center gap-2"><MapPin size={17} className="text-[#FF8A73]" /> At home or work</span><span className="inline-flex items-center gap-2"><Clock3 size={17} className="text-[#FF8A73]" /> {duration}</span></div></div><div className="rounded-2xl bg-white p-5 text-[#082A30] shadow-2xl"><p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">Starting service price</p><p className="mt-2 text-4xl font-black">£{service.basePrice.toLocaleString("en-GB")}</p><p className="mt-3 text-sm leading-6 text-slate-600">Oil price varies by specification and quantity. We confirm the total before your appointment.</p></div></div></section>
      <section className="bg-[#F7F4EF] py-12 lg:py-16"><div className="mx-auto max-w-5xl px-5 lg:px-8"><div className="mb-7 text-center"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#E94A3F]">Start here</p><h2 className="mt-2 text-3xl font-bold text-[#082A30]">Find the right oil for your car</h2></div><OilFinder /></div></section>
      <section className="bg-white py-14"><div className="mx-auto max-w-5xl px-5 lg:px-8"><h2 className="text-2xl font-bold text-[#082A30]">What you can expect</h2><div className="mt-6 grid gap-4 sm:grid-cols-3">{[
        { icon: ShieldCheck, text: "The oil specification is verified before the appointment." },
        { icon: MapPin, text: "The work is completed where your car is safely parked." },
        { icon: CheckCircle2, text: "You receive clear booking and completion updates." },
      ].map(({ icon: Icon, text }) => <div key={text} className="rounded-xl border border-slate-200 p-5"><Icon size={21} className="text-[#E94A3F]" /><p className="mt-4 text-sm leading-6 text-slate-600">{text}</p></div>)}</div></div></section>
    </main>
  );
}
