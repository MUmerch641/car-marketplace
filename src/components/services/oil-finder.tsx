"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, CarFront, CheckCircle2, Droplets, Search, ShieldCheck } from "lucide-react";
import { findOilForVehicleAction, type OilFinderState } from "@/app/service-actions";

const initialState: OilFinderState = {};

export function OilFinder({ compact = false }: { compact?: boolean }) {
  const [state, action, pending] = useActionState(findOilForVehicleAction, initialState);

  return (
    <div className={compact ? "" : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"}>
      <form action={action}>
        <label htmlFor="oil-registration" className="block text-sm font-bold text-[#082A30]">Vehicle registration</label>
        <p className="mt-1 text-sm leading-6 text-slate-500">Enter your registration and we&apos;ll identify your vehicle before matching its oil specification.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="flex min-h-14 flex-1 items-center overflow-hidden rounded-xl border border-slate-300 bg-[#F7F4EF] shadow-sm transition focus-within:border-[#E94A3F] focus-within:bg-white focus-within:ring-4 focus-within:ring-red-100">
            <span className="grid h-8 w-12 shrink-0 place-items-center border-r border-slate-300 text-[#082A30]" aria-hidden="true"><CarFront size={18} strokeWidth={2.25} /></span>
            <input id="oil-registration" name="registration" required defaultValue={state.registration ?? ""} placeholder="e.g. AB12 CDE" autoComplete="off" className="min-w-0 flex-1 bg-transparent px-4 text-[15px] font-semibold uppercase tracking-[.12em] text-[#082A30] outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400 sm:text-base" />
          </div>
          <button type="submit" disabled={pending} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-[#E94A3F] px-6 text-sm font-bold text-white transition hover:bg-[#C73830] disabled:cursor-wait disabled:opacity-60"><Search size={17} />{pending ? "Finding vehicle…" : "Find my vehicle"}</button>
        </div>
      </form>

      {state.error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700" role="alert">{state.error}</p>}

      {state.vehicle && (
        <div className="mt-6 border-t border-slate-200 pt-6">
          <div className="flex flex-col gap-4 rounded-xl bg-[#F7F4EF] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#082A30] text-white"><CarFront size={21} /></div><div><p className="text-xs font-bold uppercase tracking-[.12em] text-slate-500">Vehicle found</p><h3 className="mt-1 text-lg font-bold text-[#082A30]">{state.vehicle.year || ""} {state.vehicle.make} {state.vehicle.model}</h3><p className="mt-1 text-sm capitalize text-slate-600">{state.vehicle.fuel_type.replaceAll("_", " ")}{state.vehicle.engine_capacity_cc ? ` · ${state.vehicle.engine_capacity_cc}cc` : ""} · {state.vehicle.colour}</p></div></div>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700"><CheckCircle2 size={17} /> Registration confirmed</span>
          </div>

          {state.recommendations?.length ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-3">{state.recommendations.map((oil, index) => <article key={oil.id} className={`rounded-xl border p-5 ${oil.primary ? "border-[#E94A3F] bg-[#FFF7F6]" : "border-slate-200"}`}><div className="flex items-center justify-between"><Droplets size={22} className="text-[#E94A3F]" /><span className="text-xs font-bold uppercase tracking-wider text-[#E94A3F]">{oil.primary || index === 0 ? "Recommended" : "Suitable alternative"}</span></div><h4 className="mt-4 font-bold text-[#082A30]">{oil.brand} {oil.name}</h4><p className="mt-1 text-2xl font-black text-[#082A30]">{oil.viscosityGrade}</p><p className="mt-2 text-sm text-slate-600">{oil.volumeLitres}L · £{oil.price.toLocaleString("en-GB")}</p><Link href={`/services/oil-change/book?registration=${encodeURIComponent(state.vehicle!.registration)}&oil=${oil.id}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#E94A3F]">Choose this oil <ArrowRight size={15} /></Link></article>)}</div>
          ) : (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-5"><div className="flex gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-amber-700" size={21} /><div><h4 className="font-bold text-[#082A30]">We will confirm the exact oil before your appointment</h4><p className="mt-2 text-sm leading-6 text-slate-600">Your vehicle was identified, but its supplier-approved oil match has not been added to Shaz yet. Continue with your request and our team will verify the specification—no guessing.</p><Link href={`/services/oil-change/book?registration=${encodeURIComponent(state.vehicle.registration)}`} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#082A30] px-5 py-3 text-sm font-bold text-white">Continue booking <ArrowRight size={15} /></Link></div></div></div>
          )}
        </div>
      )}
    </div>
  );
}
