import Link from "next/link";
import { requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function VerificationsPage() {
  const u = await requireUser();
  const s = await createClient();
  
  const { data: verifications } = await s
    .from("verification_requests")
    .select(`
      id,
      car_id,
      vehicle_registration,
      external_make,
      external_model,
      status,
      preferred_date,
      scheduled_for,
      created_at,
      cars(year, make, model)
    `)
    .eq("requested_by", u.id)
    .order("created_at", { ascending: false });

  const statusLabels: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    inspection_scheduled: "Inspection scheduled",
    inspection_complete: "Inspection complete",
    report_submitted: "Report submitted",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-[#FEF3C7] text-[#B45309]",
    confirmed: "bg-[#DCFCE7] text-[#15803D]",
    inspection_scheduled: "bg-[#DBEAFE] text-[#1E40AF]",
    on_the_way: "bg-[#DBEAFE] text-[#1E40AF]",
    in_progress: "bg-[#DBEAFE] text-[#1E40AF]",
    completed: "bg-[#DCFCE7] text-[#15803D]",
    cancelled: "bg-[#F3F4F6] text-[#6B7280]",
  };

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <SectionHeading
        title="My verifications"
        link={{ href: "/verification", label: "Request Vehicle Inspection" }}
      />

      {verifications && verifications.length > 0 ? (
        <div className="mt-6 grid gap-4">
          {verifications.map((v) => {
            const car = v.cars;
            const vehicle = car
              ? `${car.year} ${car.make} ${car.model}`
              : `${v.external_make ?? "External vehicle"} ${v.external_model ?? ""} · ${v.vehicle_registration}`;
            
            return (
              <div key={v.id} className="card-standard p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <Link
                      href={`/dashboard/verifications/${v.id}`}
                      className="font-h4 text-ink"
                    >
                      {vehicle}
                    </Link>
                    <p className="mt-1 text-sm text-[#667085]">
                      {v.scheduled_for
                        ? new Date(v.scheduled_for).toLocaleDateString("en-GB")
                        : v.preferred_date}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span
                      className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-bold ${statusColors[v.status] || "bg-[#F3F4F6] text-[#6B7280]"}`}
                    >
                      {statusLabels[v.status] || v.status.replace("_", " ")}
                    </span>
                    {v.status === "completed" && (
                      <Link
                        className="btn-tertiary text-sm"
                        href={`/dashboard/verifications/${v.id}/report`}
                      >
                        View Report
                      </Link>
                    )}
                  </div>
                </div>
                <p className="mt-4 text-xs text-[#667085]">
                  Created {new Date(v.created_at).toLocaleDateString("en-GB")}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-standard p-10 text-center">
          <h3 className="font-h4 text-ink">No vehicle inspections yet</h3>
          <p className="mt-2 text-[#667085]">
            Get extra confidence before buying a used car.
          </p>
          <Link
            className="mt-4 inline-block btn-primary"
            href="/verification"
          >
            Request Vehicle Inspection
          </Link>
        </div>
      )}
    </main>
  );
}
