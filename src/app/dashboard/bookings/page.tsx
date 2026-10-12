import Link from "next/link";
import { ukDateValue } from "@/lib/services/visit-schedule";
import { requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import {
  VisitCard,
  type VisitCardData,
} from "@/components/dashboard/visit-card";
import { ShazGuide } from "@/components/shaz/guide";
import { Button } from "@/components/ui/button";
export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; registration?: string }>;
}) {
  const query = await searchParams;
  const past = query.view === "past";
  const user = await requireUser();
  const supabase = await createClient();
  const [bookings, inspections] = await Promise.all([
    supabase
      .from("service_bookings")
      .select(
        "id,car_make,car_model,car_registration,status,preferred_date,preferred_time,address_line_1,city,postcode,quoted_price,service_types(name)",
      )
      .eq("customer_id", user.id)
      .order("preferred_date", { ascending: false }),
    supabase
      .from("verification_requests")
      .select(
        "id,vehicle_registration,external_make,external_model,status,preferred_date,scheduled_for,cars(make,model)",
      )
      .eq("requested_by", user.id)
      .order("created_at", { ascending: false }),
  ]);
  const all: VisitCardData[] = [
    ...(bookings.data ?? []).map((item) => ({
      id: item.id,
      kind: "service" as const,
      title: item.service_types?.name ?? "Service visit",
      vehicle: `${item.car_make} ${item.car_model}`,
      registration: item.car_registration,
      status: item.status,
      date: item.preferred_date,
      time: item.preferred_time,
      location: [item.address_line_1, item.city, item.postcode]
        .filter(Boolean)
        .join(", "),
      quote: item.quoted_price,
    })),
    ...(inspections.data ?? []).map((item) => ({
      id: item.id,
      kind: "inspection" as const,
      title: "Vehicle inspection",
      vehicle:
        [
          item.external_make ?? item.cars?.make,
          item.external_model ?? item.cars?.model,
        ]
          .filter(Boolean)
          .join(" ") || "Your vehicle",
      registration: item.vehicle_registration,
      status: item.status,
      date: item.scheduled_for
        ? ukDateValue(item.scheduled_for)
        : item.preferred_date,
      time: item.scheduled_for
        ? new Intl.DateTimeFormat("en-GB", {
            timeZone: "Europe/London",
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23",
          }).format(new Date(item.scheduled_for))
        : null,
    })),
  ];
  const finished = (visit: VisitCardData) =>
    ["completed", "cancelled", "report_submitted"].includes(visit.status);
  const matching = all.filter(
    (visit) =>
      !query.registration ||
      visit.registration?.replace(/\s/g, "").toUpperCase() ===
        query.registration.replace(/\s/g, "").toUpperCase(),
  );
  const visible = matching
    .filter((visit) => finished(visit) === past)
    .sort((a, b) =>
      past
        ? (b.date ?? "").localeCompare(a.date ?? "")
        : (a.date ?? "9999").localeCompare(b.date ?? "9999"),
    );
  const tabHref = (view: string) =>
    `/dashboard/bookings?view=${view}${query.registration ? `&registration=${encodeURIComponent(query.registration)}` : ""}`;
  return (
    <main className="mx-auto max-w-6xl px-5 py-7 sm:py-10 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#526568]">
            Your Shaz
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink">
            Your visits
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#526568]">
            Services and inspections, with their next steps in one place.
          </p>
        </div>
        <Button href="/services">Service my car</Button>
      </header>
      <nav
        aria-label="Visit filters"
        className="mt-6 flex rounded-2xl bg-[#EEE9E1] p-1"
      >
        {[
          {
            value: "upcoming",
            label: "Upcoming",
            active: !past,
            count: matching.filter((v) => !finished(v)).length,
          },
          {
            value: "past",
            label: "Past",
            active: past,
            count: matching.filter(finished).length,
          },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={tabHref(tab.value)}
            aria-current={tab.active ? "page" : undefined}
            className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold ${tab.active ? "bg-white text-ink shadow-sm" : "text-[#526568]"}`}
          >
            {tab.label}
            <span className="rounded-full bg-sand px-2 py-0.5 text-xs">
              {tab.count}
            </span>
          </Link>
        ))}
      </nav>
      {query.registration && (
        <p className="mt-4 text-sm text-[#526568]">
          Visits for {query.registration} ·{" "}
          <Link
            href={tabHref(past ? "past" : "upcoming").split("&")[0]}
            className="font-bold text-brand-hover underline"
          >
            Show all cars
          </Link>
        </p>
      )}
      {(bookings.error || inspections.error) && (
        <ShazGuide
          className="mt-5"
          title="Some visit details couldn’t load"
          mood="attention"
        >
          Please reload this page to try again. Your existing requests are
          saved.
        </ShazGuide>
      )}
      {visible.length ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {visible.map((visit) => (
            <VisitCard key={`${visit.kind}-${visit.id}`} visit={visit} />
          ))}
        </div>
      ) : !(bookings.error || inspections.error) ? (
        <div className="mt-5 rounded-3xl border border-[#E4E7E3] bg-white p-6 sm:p-8">
          <ShazGuide
            title={
              past
                ? "Your history will be kept here"
                : "Let’s take care of your next visit"
            }
          >
            {past
              ? "Completed and cancelled visits will appear here."
              : "Request an oil and filter change, or arrange a vehicle inspection."}
          </ShazGuide>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button href="/services">Service my car</Button>
            <Button href="/verification" variant="outline">
              Inspect a car
            </Button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
