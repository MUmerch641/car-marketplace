import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "./register-form";
export default function RegisterPage() { return <AuthShell mode="register"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#d92d20]">Create your account</p><h2 className="mt-3 text-3xl font-bold tracking-tight text-[#0b1f33]">Join Shaz today</h2><p className="mt-3 text-sm leading-6 text-slate-500">It only takes a moment. Your account lets you buy, sell and manage car care.</p><div className="mt-7"><RegisterForm /></div><p className="mt-7 text-center text-sm text-slate-500">Already have an account? <Link href="/login" className="font-bold text-[#d92d20] hover:text-[#b42318]">Log in</Link></p></AuthShell>; }
