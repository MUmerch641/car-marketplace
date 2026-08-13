"use client";

import { useActionState } from "react";
import type { InputHTMLAttributes } from "react";
import { createStaffAction } from "@/app/admin/actions";

export function StaffCreateForm() {
  const [state, action, pending] = useActionState(createStaffAction, {});
  return <form action={action} className="mt-5 grid gap-4 sm:grid-cols-2"><Field name="fullName" label="Full name" required /><Field name="email" label="Email" type="email" required /><Field name="phone" label="Phone" required /><Field name="employeeId" label="Employee ID (optional)" /><label className="text-sm font-semibold text-slate-700">Role<select disabled className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2.5 text-sm text-slate-600"><option>Inspector / Field Worker</option></select></label><label className="text-sm font-semibold text-slate-700">Status<select name="status" defaultValue="active" className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"><option value="active">Active</option><option value="inactive">Inactive</option></select></label><Field name="temporaryPassword" label="Temporary password" type="password" minLength={12} required /><p className="self-end text-xs leading-5 text-slate-500">Use at least 12 characters. Share it with the worker through a secure channel.</p>{state.error && <p role="alert" className="sm:col-span-2 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{state.error}</p>}{state.success && <p className="sm:col-span-2 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-700">{state.success}</p>}<button disabled={pending} className="sm:col-span-2 w-fit rounded-lg bg-[#d92d20] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{pending ? "Creating…" : "Create staff"}</button></form>;
}
function Field({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) { return <label className="text-sm font-semibold text-slate-700">{label}<input {...props} className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#d92d20] focus:ring-2 focus:ring-red-100" /></label>; }
