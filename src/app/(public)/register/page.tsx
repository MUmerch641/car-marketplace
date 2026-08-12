import { RegisterForm } from "./register-form";
import { PageHero } from "@/components/shared/page-hero";

export default function RegisterPage() {
  return (
    <>
      <PageHero
        eyebrow="Create account"
        title="Join Fengxing today"
        copy="Create an account to list your car, book services, and request verifications."
      />
      <section className="mx-auto max-w-md px-5 py-10 lg:px-8">
        <div className="card-standard p-8">
          <h2 className="font-h2 text-ink">Create your account</h2>
          <p className="mt-2 text-[#667085]">
            Already have an account?{" "}
            <a href="/login" className="font-semibold text-brand hover:underline">
              Log in
            </a>
          </p>
          <div className="mt-6">
            <RegisterForm />
          </div>
        </div>
      </section>
    </>
  );
}