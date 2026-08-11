"use client";

import { useActionState } from "react";
import { loginAction, type AuthFormState } from "@/app/auth/actions";

const initialState: AuthFormState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, initialState);
  return <form action={action} className="space-y-4" noValidate>{next && <input type="hidden" name="next" value={next} />}
    <div><label htmlFor="email" className="mb-1.5 block text-sm font-bold text-[#344054]">Email address</label><input id="email" name="email" type="email" autoComplete="email" required className="w-full rounded-md border border-[#D0D5DD] px-4 py-3 outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-[#FEE4E2]" /></div>
    <div><label htmlFor="password" className="mb-1.5 block text-sm font-bold text-[#344054]">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required className="w-full rounded-md border border-[#D0D5DD] px-4 py-3 outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-[#FEE4E2]" /></div>
    {state.error && <p role="alert" className="rounded-md bg-[#FEF3F2] p-3 text-sm font-medium text-[#B42318]">{state.error}</p>}
    <button disabled={pending} className="w-full rounded-md bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-[#B42318] disabled:cursor-not-allowed disabled:opacity-60">{pending ? "Logging in…" : "Log in"}</button>
  </form>;
}
