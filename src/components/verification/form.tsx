"use client";

import { useActionState } from "react";
import { createVerificationAction } from "@/app/verification-actions";

export function VerificationForm({ carId, inspectionType = "buyer_inspection" }: { carId?: string; inspectionType?: "seller_pre_inspection" | "buyer_inspection" }) {
  const [state, action, pending] = useActionState(createVerificationAction, {} as { error?: string });
  const linked = Boolean(carId);

  return <form action={action} className="grid gap-4 md:grid-cols-2">
    <input name="carId" value={carId ?? ""} type="hidden" />
    {!linked && <><Field name="registration" label="Vehicle registration" required /><Field name="make" label="Make" required /><Field name="model" label="Model" required /><Field name="year" label="Year (if known)" type="number" /><Field name="sellerName" label="Seller/contact name" required /><Field name="sellerPhone" label="Seller/contact phone" required /></>}
    <Field name="address" label="Inspection address" required />
    <Field name="city" label="City" required />
    <Field name="postcode" label="Postcode" required />
    <Field name="date" label="Preferred date" type="date" required />
    <Field name="time" label="Preferred time" type="time" required />
    <label className="md:col-span-2 text-sm font-semibold text-slate-700">Notes (optional)<textarea name="notes" rows={4} className="mt-1.5 block w-full resize-y rounded-md border border-slate-300 p-3 text-sm font-normal outline-none focus:border-[#d92d20] focus:ring-2 focus:ring-red-100" /></label>
    {state.error && <p role="alert" className="md:col-span-2 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{state.error}</p>}
    <button disabled={pending} className="md:col-span-2 rounded-lg bg-[#d92d20] px-5 py-3 text-sm font-semibold text-white hover:bg-[#b42318] disabled:cursor-not-allowed disabled:opacity-60">{pending ? "Requesting inspection…" : inspectionType === "seller_pre_inspection" ? "Request Shaz Inspection" : "Request inspection"}</button>
  </form>;
}

function Field({ name, label, type = "text", required = false }: { name: string; label: string; type?: string; required?: boolean }) {
  return <label className="text-sm font-semibold text-slate-700">{label}<input name={name} type={type} required={required} min={type === "date" ? new Date().toISOString().slice(0, 10) : undefined} className="mt-1.5 block w-full rounded-md border border-slate-300 p-3 text-sm font-normal outline-none focus:border-[#d92d20] focus:ring-2 focus:ring-red-100" /></label>;
}
