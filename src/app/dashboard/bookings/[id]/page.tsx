import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ShazGuide } from "@/components/shaz/guide";
import { VisitTimeline, visitCopy } from "@/components/shaz/visit-timeline";
import { BookingRequestNotice } from "@/components/dashboard/booking-request-notice";
import { VisitLiveRefresh } from "@/components/dashboard/visit-live-refresh";
import { visitDateLabel } from "@/lib/services/visit-schedule";
import { notFound } from "next/navigation";
import BookingPayments from "@/components/dashboard/booking-payments";
import { BookingChangeControls } from "@/components/dashboard/booking-change-controls";
import { requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { parkingLocationLabel, readVisitNotes } from "@/lib/services/parking";

export default async function BookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ requested?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createClient();
  const { data: booking } = await supabase
    .from("service_bookings")
    .select("*,service_types(name,slug)")
    .eq("id", id)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (!booking) notFound();

  const access = readVisitNotes(booking.notes);
  const vehicle = [
    booking.vehicle_year ? `${booking.vehicle_year} ` : "",
    booking.car_make,
    ` ${booking.car_model}`,
    booking.car_registration ? ` · ${booking.car_registration}` : "",
  ].join("");

  return (
    <main className="mx-auto max-w-4xl px-5 py-7 sm:py-10 lg:px-8">
      <VisitLiveRefresh />
      <Link
        href="/dashboard/bookings"
        className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#526568]"
      >
        <ArrowLeft size={17} />
        Your visits
      </Link>
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-wider text-[#526568]">
          Your visit
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {booking.service_types?.name ?? "Service visit"}
        </h1>
        <p className="mt-2 text-sm text-[#526568]">{vehicle}</p>
      </div>
      {query.requested === "1" && booking.status === "pending" ? (
        <BookingRequestNotice
          customerId={user.id}
          serviceId={booking.service_type_id}
        />
      ) : (
        <ShazGuide
          mood={
            booking.status === "completed"
              ? "success"
              : booking.status === "cancelled"
                ? "attention"
                : "guide"
          }
          title={visitCopy[booking.status]?.title ?? "Your visit details"}
        >
          {visitCopy[booking.status]?.copy}
        </ShazGuide>
      )}
      <div className="mt-5">
        <VisitTimeline status={booking.status} />
      </div>
      <BookingPayments key={`payment-${booking.id}`} bookingId={booking.id} />
      <div className="mt-7 grid gap-4 rounded-3xl border border-[#E4E7E3] bg-white p-6 shadow-sm sm:grid-cols-2">
        <Detail label="Vehicle" value={vehicle} />
        <Detail
          label={
            booking.status === "pending" ? "Requested visit" : "Visit schedule"
          }
          value={`${visitDateLabel(booking.preferred_date)} · ${booking.preferred_time.slice(0, 5)} · UK time`}
        />
        {access.visitType && (
          <Detail
            label="Visit type"
            value={`At ${access.visitType.toLowerCase()}`}
          />
        )}
        <Detail
          label="Location"
          value={[
            booking.address_line_1,
            booking.address_line_2,
            booking.city,
            booking.postcode,
          ]
            .filter(Boolean)
            .join(", ")}
        />
        <Detail
          label="Parking"
          value={parkingLocationLabel(
            booking.parking_location ?? access.parkingLocation,
          )}
        />
        <Detail
          label="Level surface and access"
          value={
            (booking.level_surface_access ?? access.levelSurfaceAccess) === null
              ? "Not provided"
              : (booking.level_surface_access ?? access.levelSurfaceAccess)
                ? "Yes"
                : "No"
          }
        />
        {(booking.parking_access_notes ?? access.parkingAccessNotes) ? (
          <Detail
            label="Parking or access notes"
            value={(booking.parking_access_notes ?? access.parkingAccessNotes)!}
          />
        ) : null}

        <Detail
          label="Oil selection"
          value={
            booking.oil_product_name
              ? `${booking.oil_product_name}${booking.oil_viscosity_grade ? ` · ${booking.oil_viscosity_grade}` : ""}`
              : "Shaz will confirm the approved oil before your visit"
          }
        />
        <Detail
          label="Oil match"
          value={
            booking.oil_fitment_status === "verified"
              ? "Verified for this vehicle"
              : "Manual confirmation in progress"
          }
        />
        {access.notes ? <Detail label="Notes" value={access.notes} /> : null}
      </div>

      <BookingChangeControls
        key={`changes-${booking.id}`}
        bookingId={booking.id}
      />
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-[#526568]">{label}</p>
      <p className="mt-1 whitespace-pre-wrap font-medium text-[#082A30]">
        {value}
      </p>
    </div>
  );
}
