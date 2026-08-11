"use client";

import { useActionState } from "react";
import { registerAction, type AuthFormState } from "@/app/auth/actions";

const initialState: AuthFormState = {};

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialState);
  return <form action={action} className="space-y-4" noValidate>
    <div><label htmlFor="fullName" className="mb-1.5 block text-sm font-bold text-[#344054]">Full name</label><input id="fullName" name="fullName" autoComplete="name" required className="w-full rounded-md border border-[#D0D5DD] px-4 py-3 outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-[#FEE4E2]" /></div>
    <div><label htmlFor="email" className="mb-1.5 block text-sm font-bold text-[#344054]">Email address</label><input id="email" name="email" type="email" autoComplete="email" required className="w-full rounded-md border border-[#D0D5DD] px-4 py-3 outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-[#FEE4E2]" /></div>
    <div><label htmlFor="phone" className="mb-1.5 block text-sm font-bold text-[#344054]">UK phone number</label><input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="07123 456789" required className="w-full rounded-md border border-[#D0D5DD] px-4 py-3 outline-none placeholder:text-[#98A2B3] focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-[#FEE4E2]" /></div>
    <div><label htmlFor="password" className="mb-1.5 block text-sm font-bold text-[#344054]">Password</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required className="w-full rounded-md border border-[#D0D5DD] px-4 py-3 outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-[#FEE4E2]" /></div>
    <div><label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-bold text-[#344054]">Confirm password</label><input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required className="w-full rounded-md border border-[#D0D5DD] px-4 py-3 outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-[#FEE4E2]" /></div>
    {state.error && <p role="alert" className="rounded-md bg-[#FEF3F2] p-3 text-sm font-medium text-[#B42318]">{state.error}</p>}
    {state.success && <p role="status" className="rounded-md bg-[#DCFCE7] p-3 text-sm font-medium text-[#15803D]">{state.success}</p>}
    <button disabled={pending} className="w-full rounded-md bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-[#B42318] disabled:cursor-not-allowed disabled:opacity-60">{pending ? "Creating account…" : "Create account"}</button>
  </form>;
}
