import Link from "next/link";
import { requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function BookingsPage() {
  const u = await requireUser();
  const s = await createClient();
  
  const { data: bookings } = await s
    .from("service_bookings")
    .select(`
      id,
      car_make,
      car_model,
      car_registration,
      status,
      preferred_date,
      preferred_time,
      address_line_1,
      city,
      postcode,
      quoted_price,
      created_at,
      service_types(name)
    `)
    .eq("customer_id", u.id)
    .order("created_at", { ascending: false });

  const statusLabels: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    assigned: "Assigned",
    on_the_way: "On the way",
    in_progress: "In progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  const statusColors: Record<string, string> = {
    pending: "bg-[#FEF3C7] text-[#B45309]",
    confirmed: "bg-[#DCFCE7] text-[#15803D]",
    assigned: "bg-[#DBEAFE] text-[#1E40AF]",
    on_the_way: "bg-[#DBEAFE] text-[#1E40AF]",
    in_progress: "bg-[#DBEAFE] text-[#1E40AF]",
    completed: "bg-[#DCFCE7] text-[#15803D]",
    cancelled: "bg-[#F3F4F6] text-[#6B7280]",
  };

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <SectionHeading
        title="My bookings"
        link={{ href: "/services", label: "Browse Mobile Services" }}
      />

      {bookings && bookings.length > 0 ? (
        <div className="mt-6 grid gap-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="card-standard p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <Link
                    href={`/dashboard/bookings/${booking.id}`}
                    className="font-h4 text-ink"
                  >
                    {booking.service_types?.name ?? "Service booking"}
                  </Link>
                  <p className="mt-1 text-sm text-[#667085]">
                    {booking.car_make} {booking.car_model}
                    {booking.car_registration && ` · ${booking.car_registration}`}
                  </p>
                  <p className="mt-1 text-sm text-[#667085]">
                    {booking.preferred_date} at {booking.preferred_time}
                  </p>
                  <p className="mt-1 text-sm text-[#667085]">
                    {booking.address_line_1}, {booking.city}, {booking.postcode}
                  </p>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2">
                  <span
                    className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-bold ${statusColors[booking.status] || "bg-[#F3F4F6] text-[#6B7280]"}`}
                  >
                    {statusLabels[booking.status] || booking.status.replace("_", " ")}
                  </span>
                  {booking.quoted_price && (
                    <span className="text-sm font-bold text-brand">
                      From £{Number(booking.quoted_price).toLocaleString("en-GB")}
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-[#667085]">
                  Created {new Date(booking.created_at).toLocaleDateString("en-GB")}
                </p>
                <Link
                  href={`/dashboard/bookings/${booking.id}`}
                  className="btn-tertiary text-sm"
                >
                  View details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-standard p-10 text-center">
          <h3 className="font-h4 text-ink">No mobile service bookings yet</h3>
          <p className="mt-2 text-[#667085]">
            Book practical car care where your car is parked.
          </p>
          <Link
            className="mt-4 inline-block btn-primary"
            href="/services"
          >
            Browse Mobile Services
          </Link>
        </div>
      )}
    </main>
  );
}
