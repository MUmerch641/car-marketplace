import Link from "next/link";
import { requireUser } from "@/lib/auth/server";
import { getMyCars } from "@/lib/marketplace/cars";
import { createClient } from "@/lib/supabase/server";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function DashboardPage() {
  const u = await requireUser();
  const s = await createClient();
  const [cars, b, v] = await Promise.all([
    getMyCars(),
    s
      .from("service_bookings")
      .select("id,car_make,car_model,status,preferred_date,service_types(name)")
      .eq("customer_id", u.id)
      .order("created_at", { ascending: false })
      .limit(5),
    s
      .from("verification_requests")
      .select(
        "id,car_id,vehicle_registration,external_make,external_model,status,preferred_date,scheduled_for,created_at,cars(year,make,model)"
      )
      .eq("requested_by", u.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      {/* My cars section */}
      <SectionHeading
        title="My cars"
        link={{ href: "/sell-car", label: "Create listing" }}
      />
      
      <div className="mt-6 grid gap-4">
        {cars.length ? (
          cars.map((c) => (
            <div key={c.id} className="card-standard p-6">
              <div className="flex items-center justify-between">
                <b className="font-h3 text-ink">{c.title}</b>
                {c.status && (
                  <span className={`status-${c.status.replace("_", "-")}`}>
                    {c.status.replace("_", " ")}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="card-standard p-10 text-center">
            <p className="text-[#667085]">No listings yet.</p>
          </div>
        )}
      </div>

      {/* Bookings section */}
      <SectionHeading
        title="My bookings"
        link={{ href: "/dashboard/bookings", label: "View all" }}
      />
      
      <div className="mt-6 grid gap-4">
        {(b.data ?? []).length ? (
          (b.data ?? []).map((x) => (
            <div key={x.id} className="card-standard p-6">
              <div className="flex items-center justify-between">
                <b className="font-h4 text-ink">{x.service_types?.name}</b>
                <span className="status-pending">{x.status.replace("_", " ")}</span>
              </div>
              <p className="mt-2 text-sm text-[#667085]">
                {x.car_make} {x.car_model} · {x.preferred_date}
              </p>
            </div>
          ))
        ) : (
          <div className="card-standard p-10 text-center">
            <p className="text-[#667085]">No mobile service bookings yet.</p>
          </div>
        )}
      </div>

      {/* Verifications section */}
      <SectionHeading
        title="My verifications"
        link={{ href: "/dashboard/verifications", label: "View all" }}
      />
      
      <div className="mt-6 grid gap-4">
        {(v.data ?? []).length ? (
          (v.data ?? []).map((x) => {
            const car = x.cars;
            const vehicle = car
              ? `${car.year} ${car.make} ${car.model}`
              : `${x.external_make ?? "External vehicle"} ${x.external_model ?? ""} · ${x.vehicle_registration}`;
            return (
              <div key={x.id} className="card-standard p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <Link href={`/dashboard/verifications/${x.id}`} className="font-h4 text-ink">
                    {vehicle}
                  </Link>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className={`status-${x.status.replace("_", "-")}`}>{x.status.replace("_", " ")}</span>
                    {x.status === "completed" && (
                      <Link
                        className="text-sm font-semibold text-brand hover:underline"
                        href={`/dashboard/verifications/${x.id}/report`}
                      >
                        View Report
                      </Link>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-sm text-[#667085]">
                  {x.scheduled_for
                    ? new Date(x.scheduled_for).toLocaleDateString("en-GB")
                    : x.preferred_date}
                </p>
              </div>
            );
          })
        ) : (
          <div className="card-standard p-10 text-center">
            <h3 className="font-h4 text-ink">No vehicle inspections yet</h3>
            <p className="mt-2 text-[#667085]">
              Get extra confidence before buying a used car.
            </p>
            <Link
              className="mt-4 inline-block btn-tertiary"
              href="/verification"
            >
              Request Vehicle Inspection
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}