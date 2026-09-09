import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "./login-form";
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const next = typeof resolvedParams?.next === "string" ? resolvedParams.next : "";

  return (
    <AuthShell mode="login">
      <p className="text-xs font-bold uppercase tracking-[.14em] text-[#e94a3f]">Welcome back</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#082a30]">Log in to Shaz</h2>
      <p className="mt-3 text-sm leading-6 text-slate-500">Enter your details to continue to your account.</p>
      <div className="mt-8">
        <LoginForm next={next} />
      </div>
      <p className="mt-7 text-center text-sm text-slate-500">
        New to Shaz?{" "}
        <Link href="/register" className="font-bold text-[#e94a3f] hover:text-[#c73830]">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
