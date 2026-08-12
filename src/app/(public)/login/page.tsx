import { LoginForm } from "./login-form";
import { PageHero } from "@/components/shared/page-hero";

export default function LoginPage({ searchParams }: { searchParams?: Promise<{ next?: string }> }) {
  const params = searchParams ?? {};
  const next = (params as { next?: string }).next ?? "";
  
  return (
    <>
      <PageHero
        eyebrow="Log in"
        title="Welcome back"
        copy="Log in to manage your cars, bookings, and verifications."
      />
      <section className="mx-auto max-w-md px-5 py-10 lg:px-8">
        <div className="card-standard p-8">
          <h2 className="font-h2 text-ink">Log in to Fengxing</h2>
          <p className="mt-2 text-[#667085]">
            Don’t have an account?{" "}
            <a href="/register" className="font-semibold text-brand hover:underline">
              Create an account
            </a>
          </p>
          <div className="mt-6">
            <LoginForm next={next} />
          </div>
        </div>
      </section>
    </>
  );
}