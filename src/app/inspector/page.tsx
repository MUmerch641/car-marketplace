import Link from "next/link";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { startInspection } from "@/app/verification-actions";
import AnimatedContent from "@/components/AnimatedContent";

export default async function Page() {
  const { user } = await requireRole("inspector");
  const s = await createClient();
  const [{ data: service }, { data: verification }] = await Promise.all([
    s
      .from("employee_assignments")
      .select("service_bookings(id,car_make,car_model,status,service_types(name))")
      .eq("employee_id", user.id)
      .not("service_booking_id", "is", null)
      .in("status", ["assigned", "in_progress"]),
    s
      .from("employee_assignments")
      .select("verification_requests(id,vehicle_registration,city,status,scheduled_for)")
      .eq("employee_id", user.id)
      .not("verification_request_id", "is", null)
      .in("status", ["assigned", "in_progress"]),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <AnimatedContent distance={16} duration={0.5}>
        <h1 className="text-3xl font-bold">Field worker workspace</h1>
      </AnimatedContent>

      <AnimatedContent distance={14} duration={0.5} delay={0.05} className="mt-8">
        <h2 className="text-xl font-bold">Mobile service jobs</h2>
        {service?.map(
          (a) =>
            a.service_bookings && (
              <div className="mt-3 border p-4" key={a.service_bookings.id}>
                {a.service_bookings.service_types?.name} · {a.service_bookings.car_make}{" "}
                {a.service_bookings.car_model} · {a.service_bookings.status}
              </div>
            )
        )}
      </AnimatedContent>

      <AnimatedContent distance={14} duration={0.5} delay={0.1} className="mt-8">
        <h2 className="text-xl font-bold">Vehicle inspection jobs</h2>
        {verification?.length ? (
          verification.map(
            (a) =>
              a.verification_requests && (
                <article
                  key={a.verification_requests.id}
                  className="mt-3 border p-4"
                >
                  <b>{a.verification_requests.vehicle_registration}</b>
                  <p>
                    {a.verification_requests.city} ·{" "}
                    {a.verification_requests.scheduled_for ?? "Awaiting schedule"}
                  </p>
                  {a.verification_requests.status === "inspection_scheduled" && (
                    <form
                      action={async () => {
                        "use server";
                        await startInspection(a.verification_requests!.id);
                      }}
                    >
                      <button className="mt-2 text-brand">Start inspection</button>
                    </form>
                  )}
                  <Link
                    className="ml-4 text-brand"
                    href={`/inspector/verifications/${a.verification_requests.id}`}
                  >
                    Open inspection
                  </Link>
                </article>
              )
          )
        ) : (
          <p className="mt-3 text-[#667085]">No inspection jobs assigned.</p>
        )}
      </AnimatedContent>
    </main>
  );
}
