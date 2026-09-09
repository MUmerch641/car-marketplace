"use client";

import { useActionState, useEffect } from "react";
import { CarFront, CheckCircle2, Droplets, Search, ShieldCheck } from "lucide-react";
import { createServiceBookingAction, findOilForVehicleAction, type OilFinderState } from "@/app/service-actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { toast } from "@/components/ui/toast";

type Props = {
  service: { id: string; name: string; basePrice: number };
  initialRegistration?: string;
  initialOilId?: string;
};

export function BookingForm({ service, initialRegistration = "", initialOilId = "" }: Props) {
  const [lookup, lookupAction, lookupPending] = useActionState(findOilForVehicleAction, { registration: initialRegistration } as OilFinderState);
  const [state, bookingAction] = useActionState(createServiceBookingAction, {});

  useEffect(() => { if (state?.error) toast.error(state.error); }, [state?.error]);

  const selectedOilId = lookup.recommendations?.some((oil) => oil.id === initialOilId)
    ? initialOilId
    : lookup.recommendations?.find((oil) => oil.primary)?.id ?? lookup.recommendations?.[0]?.id ?? "";

  return (
    <div className="space-y-7">
      <div className="rounded-xl border border-[#E94A3F]/30 bg-[#FFF5F4] p-5"><p className="font-h4 text-ink">{service.name}</p><p className="mt-2 text-sm text-[#667085]">Service from £{service.basePrice.toLocaleString("en-GB")}. Any oil cost is shown before confirmation.</p></div>

      <section>
        <div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#082A30] text-xs font-bold text-white">1</span><div><h2 className="font-h4 text-[#082A30]">Find your vehicle</h2><p className="text-sm text-slate-500">Enter your registration so we can identify the vehicle.</p></div></div>
        <form action={lookupAction} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="flex min-h-14 flex-1 items-center overflow-hidden rounded-xl border border-slate-300 bg-[#F7F4EF] shadow-sm transition focus-within:border-[#E94A3F] focus-within:bg-white focus-within:ring-4 focus-within:ring-red-100"><span className="grid h-8 w-12 shrink-0 place-items-center border-r border-slate-300 text-[#082A30]" aria-hidden="true"><CarFront size={18} strokeWidth={2.25} /></span><input name="registration" required defaultValue={lookup.registration ?? initialRegistration} placeholder="e.g. AB12 CDE" autoComplete="off" className="min-w-0 flex-1 bg-transparent px-4 text-[15px] font-semibold uppercase tracking-[.12em] text-[#082A30] outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 sm:text-base" /></div>
          <button type="submit" disabled={lookupPending} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-[#082A30] px-5 text-sm font-bold text-white hover:bg-[#132F49] disabled:opacity-60"><Search size={16} />{lookupPending ? "Checking…" : "Find vehicle"}</button>
        </form>
        {lookup.error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700" role="alert">{lookup.error}</p>}
      </section>

      {lookup.vehicle && (
        <form action={bookingAction} className="space-y-7 border-t border-slate-200 pt-7">
          <input type="hidden" name="serviceId" value={service.id} />
          <input type="hidden" name="carRegistration" value={lookup.vehicle.registration} />

          <div className="rounded-xl bg-[#F7F4EF] p-5"><div className="flex items-center gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#082A30] text-white"><CarFront size={21} /></div><div><p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">Vehicle confirmed</p><p className="mt-1 font-bold text-[#082A30]">{lookup.vehicle.year || ""} {lookup.vehicle.make} {lookup.vehicle.model}</p><p className="mt-1 text-sm capitalize text-slate-600">{lookup.vehicle.fuel_type.replaceAll("_", " ")}{lookup.vehicle.engine_capacity_cc ? ` · ${lookup.vehicle.engine_capacity_cc}cc` : ""}</p></div><CheckCircle2 size={20} className="ml-auto shrink-0 text-emerald-600" /></div></div>

          <section>
            <div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#082A30] text-xs font-bold text-white">2</span><div><h2 className="font-h4 text-[#082A30]">Oil selection</h2><p className="text-sm text-slate-500">Only supplier-verified matches are recommended automatically.</p></div></div>
            {lookup.recommendations?.length ? <div className="mt-4 grid gap-3">{lookup.recommendations.map((oil, index) => <label key={oil.id} className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 p-4 has-[:checked]:border-[#E94A3F] has-[:checked]:bg-[#FFF7F6]"><input type="radio" name="oilProductId" value={oil.id} defaultChecked={oil.id === selectedOilId} className="mt-1 accent-[#E94A3F]" /><Droplets size={20} className="mt-0.5 shrink-0 text-[#E94A3F]" /><span className="flex-1"><span className="flex flex-wrap items-center justify-between gap-2"><span className="font-bold text-[#082A30]">{oil.brand} {oil.name} · {oil.viscosityGrade}</span><span className="font-bold">£{oil.price.toLocaleString("en-GB")}</span></span><span className="mt-1 block text-sm text-slate-600">{oil.volumeLitres} litres{oil.primary || index === 0 ? " · Recommended" : " · Suitable alternative"}</span></span></label>)}</div> : <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"><ShieldCheck size={20} className="mt-0.5 shrink-0 text-amber-700" /><div><p className="font-bold text-[#082A30]">Manual oil confirmation</p><p className="mt-1 text-sm leading-6 text-slate-600">Our team will verify the manufacturer specification and confirm the oil and final price before the appointment.</p></div></div>}
          </section>

          <section><StepHeading number="3" title="Where should we come?" /><div className="mt-4 grid gap-4 md:grid-cols-2"><Field name="postcode" label="Postcode" required /><Field name="addressLine1" label="Address line 1" required /><div className="md:col-span-2"><Field name="addressLine2" label="Address line 2 (optional)" /></div><Field name="city" label="City" required /></div></section>
          <section><StepHeading number="4" title="Choose your preferred time" /><div className="mt-4 grid gap-4 md:grid-cols-2"><Field name="preferredDate" label="Preferred date" type="date" required /><Field name="preferredTime" label="Preferred time" type="time" required /></div></section>
          <div><label htmlFor="notes" className="input-label">Anything we should know? (optional)</label><textarea id="notes" name="notes" rows={4} className="input-standard w-full resize-none" placeholder="Parking access, vehicle notes or other useful information…" /></div>
          {state.error && <p className="input-error" role="alert">{state.error}</p>}
          <SubmitButton variant="primary" size="lg" loadingText="Submitting booking…" className="w-full py-3.5">Request oil change</SubmitButton>
        </form>
      )}
    </div>
  );
}

function StepHeading({ number, title }: { number: string; title: string }) {
  return <div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#082A30] text-xs font-bold text-white">{number}</span><h2 className="font-h4 text-[#082A30]">{title}</h2></div>;
}

function Field({ name, label, required, type = "text" }: { name: string; label: string; required?: boolean; type?: string }) {
  return <div><label htmlFor={name} className="input-label">{label}</label><input id={name} name={name} type={type} required={required} min={type === "date" ? new Date().toISOString().slice(0, 10) : undefined} className="input-standard w-full" /></div>;
}
