import Link from "next/link";
import { RegisterForm } from "./register-form";
import { PageHero } from "@/components/shared/page-hero";
export default function RegisterPage() { return <><PageHero eyebrow="Account" title="Create your Motorway account." copy="One secure account for buying, selling, vehicle verification, and mobile car services." /><div className="mx-auto max-w-md px-5 py-12"><div className="rounded-xl border border-[#E4E7EC] bg-white p-7"><h2 className="text-xl font-bold text-ink">Create account</h2><div className="mt-5"><RegisterForm /></div><p className="mt-5 text-center text-sm text-[#667085]">Already have an account? <Link href="/login" className="font-bold text-brand">Log in</Link></p></div></div></>; }
