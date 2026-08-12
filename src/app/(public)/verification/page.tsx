import { getCurrentUser } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { VerificationForm } from "@/components/verification/form";

export default async function VerificationPage({ searchParams }: { searchParams: Promise<{ car?: string }> }) {
  const { car } = await searchParams;
  const user = await getCurrentUser();
  
  // Redirect if not logged in
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/verification${car ? `?car=${car}` : ""}`)}`);
  }
  
  // Public info before auth (shown only to non-logged-in users)
  return (
    <main className="mx-auto max-w-5xl px-5 py-10 lg:px-8">
      {/* Public intro */}
      <div className="rounded-2xl border border-[#E4E7EC] bg-[#F9FAFB] p-8">
        <p className="font-h4 text-ink">Vehicle inspection</p>
        <h1 className="mt-2 font-h1 text-ink">Get confidence before you buy</h1>
        <p className="mt-3 text-[#667085]">
          An inspector visits the vehicle in person and produces a clear report. 
          This is not DVLA, MOT, or ownership certification.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[
            "Physical vehicle inspection",
            "Condition assessment",
            "Photo evidence",
            "Detailed report",
            "Verified status",
            "Peace of mind",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-1 h-5 w-5 flex-shrink-0 rounded-full border border-[#16A34A] bg-[#F0FDF4] flex items-center justify-center">
                <svg className="h-3 w-3 text-[#16A34A]" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-sm text-[#101828]">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Login prompt */}
      <div className="mt-8 rounded-2xl border border-[#E4E7EC] bg-white p-8 text-center">
        <h2 className="font-h3 text-ink">Request an inspection</h2>
        <p className="mt-2 text-[#667085]">
          Please log in to schedule an inspection for your vehicle.
        </p>
        <button
          onClick={async () => {
            "use server";
            await redirect(`/login?next=${encodeURIComponent(`/verification${car ? `?car=${car}` : ""}`)}`);
          }}
          className="mt-4 rounded-md bg-brand px-6 py-2.5 text-sm font-bold text-white hover:bg-[#B42318]"
        >
          Log in to request inspection
        </button>
        <p className="mt-4 text-sm text-[#667085]">
          Don’t have an account?{" "}
          <a href="/register" className="font-semibold text-brand hover:underline">
            Create an account
          </a>
        </p>
      </div>

      {/* Form - only shown when logged in */}
      <div className="mt-8 border border-[#E4E7EC] bg-white p-6">
        <VerificationForm carId={car} />
      </div>
    </main>
  );
}
