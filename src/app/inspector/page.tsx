import Link from "next/link";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { startInspection } from "@/app/verification-actions";

export default async function InspectorPage() {
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
      .select("verification_requests(id,vehicle_registration,city,status,scheduled_for,inspection_type)")
      .eq("employee_id", user.id)
      .not("verification_request_id", "is", null)
      .in("status", ["assigned", "in_progress"]),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
      <h1 className="font-h1 text-ink">Field worker workspace</h1>

      {/* Mobile service jobs */}
      <div className="mt-8">
        <h2 className="font-h2 text-ink">Mobile service jobs</h2>
        <div className="mt-4 space-y-3">
          {service?.map((a) =>
            a.service_bookings ? (
              <div key={a.service_bookings.id} className="card-standard p-6">
                <div className="flex items-center justify-between">
                  <b className="font-h3 text-ink">{a.service_bookings.service_types?.name}</b>
                  <span className={`status-${a.service_bookings.status.replace("_", "-")}`}>
                    {a.service_bookings.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-2 text-[#667085]">
                  {a.service_bookings.car_make} {a.service_bookings.car_model}
                </p>
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* Vehicle inspection jobs */}
      <div className="mt-10">
        <h2 className="font-h2 text-ink">Vehicle inspection jobs</h2>
        <div className="mt-4 space-y-3">
          {verification?.length ? (
            verification.map((a) =>
              a.verification_requests ? (
                <article key={a.verification_requests.id} className="card-standard p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <b className="font-h3 text-ink">{a.verification_requests.vehicle_registration}</b>
                      <p className="mt-2 text-[#667085]">
                        {a.verification_requests.city}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-[#667085]">{a.verification_requests.inspection_type === "seller_pre_inspection" ? "Seller pre-inspection" : "Buyer inspection"}</p>
                    </div>
                    <span className={`status-${a.verification_requests.status.replace("_", "-")}`}>
                      {a.verification_requests.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#667085]">
                    {a.verification_requests.scheduled_for
                      ? new Date(a.verification_requests.scheduled_for).toLocaleDateString("en-GB")
                      : "Awaiting schedule"}
                  </p>
                  {a.verification_requests.status === "inspection_scheduled" && (
                    <form
                      action={async () => {
                        "use server";
                        await startInspection(a.verification_requests!.id);
                      }}
                      className="mt-4"
                    >
                      <button type="submit" className="btn-primary w-fit">
                        Start inspection
                      </button>
                    </form>
                  )}
                  <Link
                    href={`/inspector/verifications/${a.verification_requests.id}`}
                    className="btn-tertiary mt-2 block"
                  >
                    Open inspection
                  </Link>
                </article>
              ) : null
            )
          ) : (
            <div className="card-standard p-10 text-center">
              <p className="text-[#667085]">No inspection jobs assigned.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
