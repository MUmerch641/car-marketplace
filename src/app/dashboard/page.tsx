import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CarFront,
  CheckCircle2,
  MapPin,
  Search,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { getCurrentProfile, requireUser } from "@/lib/auth/server";
import { getMyCars } from "@/lib/marketplace/cars";
import { createClient } from "@/lib/supabase/server";
import { MarkSoldButton } from "@/components/cars/mark-sold-button";
import { RemoveVehicleButton } from "@/components/dashboard/remove-vehicle-button";
import { ActionMenu } from "@/components/ui/action-menu";

const bookingStatusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  confirmed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  assigned: "bg-blue-50 text-blue-800 ring-blue-200",
  on_the_way: "bg-blue-50 text-blue-800 ring-blue-200",
  in_progress: "bg-blue-50 text-blue-800 ring-blue-200",
  completed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-200",
};

const inspectionStatusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  confirmed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  inspection_scheduled: "bg-blue-50 text-blue-800 ring-blue-200",
  inspection_complete: "bg-blue-50 text-blue-800 ring-blue-200",
  report_submitted: "bg-blue-50 text-blue-800 ring-blue-200",
  completed: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-200",
};

function statusLabel(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function dateLabel(date: string | null) {
  if (!date) return "Date to be confirmed";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Status({ status, styles }: { status: string; styles: Record<string, string> }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status] ?? "bg-slate-100 text-slate-600 ring-slate-200"}`}
    >
      {statusLabel(status)}
    </span>
  );
}

function EmptyState({
  title,
  copy,
  href,
  action,
}: {
  title: string;
  copy: string;
  href: string;
  action: string;
}) {
  return (
    <div className="border-t border-slate-100 py-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
      <div>
        <p className="text-sm font-semibold text-[#0b1f33]">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-500">{copy}</p>
      </div>
      <Link
        href={href}
        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#d92d20] hover:text-[#b42318] sm:mt-0"
      >
        {action} <ArrowRight size={15} />
      </Link>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const [profile, cars, bookingsResponse, verificationsResponse, sellerInspectionResponse, garageVehiclesResponse] = await Promise.all([
    getCurrentProfile(),
    getMyCars(),
    supabase
      .from("service_bookings")
      .select("id,car_make,car_model,status,preferred_date,preferred_time,city,postcode,service_types(name)")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("verification_requests")
      .select("id,vehicle_registration,external_make,external_model,status,preferred_date,scheduled_for,created_at,cars(year,make,model)")
      .eq("requested_by", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("verification_requests")
      .select("id,car_id,status,inspection_type")
      .eq("requested_by", user.id)
      .eq("inspection_type", "seller_pre_inspection")
      .order("created_at", { ascending: false }),
    supabase
      .from("garage_vehicles")
      .select("*")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const bookings = bookingsResponse.data ?? [];
  const verifications = verificationsResponse.data ?? [];
  const sellerInspections = sellerInspectionResponse.data ?? [];
  const garageVehicles = garageVehiclesResponse.data ?? [];
  const firstName = profile?.full_name?.trim().split(" ")[0];

  return (
    <main className="bg-[#f7f8fa] py-7 sm:py-9">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Your Shaz account</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#0b1f33] sm:text-[34px]">
              Welcome back{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="mt-2 text-[15px] text-slate-600">Manage your vehicles, bookings and listings.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/garage"
              className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Add vehicle
            </Link>
            <Link href="/sell-car" className="inline-flex items-center rounded-lg bg-[#d92d20] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#b42318]">
              Sell a car <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </header>

        <section aria-label="Quick actions" className="grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 sm:mt-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/sell-car", label: "Sell a car", copy: "Create and manage a listing", icon: CarFront },
            { href: "/services", label: "Book a service", copy: "Mobile car care at your location", icon: Wrench },
            { href: "/verification", label: "Request inspection", copy: "Arrange a vehicle inspection", icon: ShieldCheck },
            { href: "/cars", label: "Browse cars", copy: "Search the marketplace", icon: Search },
          ].map(({ href, label, copy, icon: Icon }) => (
            <Link key={label} href={href} className="group bg-white px-4 py-4 transition hover:bg-slate-50">
              <Icon size={18} className="text-[#d92d20]" />
              <p className="mt-3 text-sm font-semibold text-[#0b1f33]">{label} <ArrowRight size={14} className="mb-0.5 inline transition group-hover:translate-x-0.5" /></p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{copy}</p>
            </Link>
          ))}
        </section>

        <section id="garage" className="mt-7 scroll-mt-6 border-y border-slate-200 bg-white px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.12em] text-[#d92d20]">Vehicle hub</p>
              <h2 className="mt-1 text-xl font-bold text-[#0b1f33]">My Garage</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">Keep your vehicles in one place for faster parts, services and inspections.</p>
            </div>
            <Link href="/dashboard/garage" className="w-fit rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Add vehicle
            </Link>
          </div>
          
          {garageVehicles.length > 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {garageVehicles.map((vehicle) => (
                <div key={vehicle.id} className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div>
                    <div className="inline-block rounded border border-yellow-500 bg-yellow-400 px-2 py-0.5 text-sm font-bold uppercase tracking-widest text-black mb-3">
                      {vehicle.registration}
                    </div>
                    <h3 className="font-bold text-[#0b1f33] truncate">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {vehicle.fuel_type} <span className="px-1 text-slate-300">·</span> {vehicle.colour}
                      {vehicle.mot_expiry && (
                        <>
                          <span className="px-1 text-slate-300">·</span> MOT: {new Date(vehicle.mot_expiry).toLocaleDateString("en-GB")}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <RemoveVehicleButton vehicleId={vehicle.id} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <CarFront size={20} className="text-slate-400" />
              </div>
              <p className="mt-3 text-sm font-semibold text-[#0b1f33]">No vehicles in your garage</p>
              <p className="mt-1 text-sm text-slate-600">Add a vehicle using its registration number.</p>
              <Link href="/dashboard/garage" className="mt-4 inline-flex text-sm font-semibold text-[#d92d20] hover:text-[#b42318]">
                Add vehicle
              </Link>
            </div>
          )}
        </section>

        <section id="listings" className="mt-7 border-t border-slate-200 pt-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#0b1f33]">My listings</h2>
              <p className="mt-1 text-sm text-slate-600">Cars you have listed on Shaz.</p>
            </div>
            <Link href="/sell-car" className="hidden items-center gap-1 text-sm font-semibold text-[#d92d20] hover:text-[#b42318] sm:inline-flex">Sell a car <ArrowRight size={15} /></Link>
          </div>
          {cars.length ? (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white">
              {cars.slice(0, 4).map((car) => {
                const inspection = sellerInspections.find((request) => request.car_id === car.id);
                return (
                <div key={car.id} className="flex flex-col gap-4 border-b border-slate-100 p-4 last:border-b-0 sm:flex-row sm:items-center">
                  <div className="h-16 w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:w-24" style={car.image ? { backgroundImage: `url(${car.image})`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}>
                    {!car.image && <CarFront className="mx-auto mt-5 text-slate-400" size={22} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#0b1f33]">{car.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{car.price} <span className="px-1 text-slate-300">|</span> {car.mileage} <span className="px-1 text-slate-300">|</span> {car.city}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-4 sm:justify-end">
                    <Status status={car.status ?? "draft"} styles={{ active: "bg-emerald-50 text-emerald-800 ring-emerald-200", pending: "bg-amber-50 text-amber-800 ring-amber-200", draft: "bg-slate-100 text-slate-700 ring-slate-200", rejected: "bg-red-50 text-red-700 ring-red-200", sold: "bg-blue-50 text-blue-800 ring-blue-200", archived: "bg-slate-100 text-slate-600 ring-slate-200" }} />
                    <div className="flex items-center gap-3 text-sm font-semibold">
                      {car.status === "active" && (inspection && inspection.status === "completed" ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 mr-2">
                          <CheckCircle2 size={14} /> Inspected by Shaz
                        </span>
                      ) : (
                        <Link href={`/verification?car=${car.id}`} className="text-slate-500 hover:text-[#0b1f33] mr-2">
                          Request Inspection
                        </Link>
                      ))}
                      {car.status === "active" && <Link href={`/cars/${car.id}`} className="text-slate-700 hover:text-[#0b1f33]">View</Link>}
                      <Link href={`/dashboard/cars/${car.id}/edit?step=details`} className="text-[#d92d20] hover:text-[#b42318]">Edit</Link>
                      {car.status === "active" && (
                        <ActionMenu>
                          <MarkSoldButton carId={car.id} />
                        </ActionMenu>
                      )}
                    </div>
                  </div>
                </div>
              ); })}
            </div>
          ) : (
            <EmptyState title="No cars listed yet" copy="Create a listing when you are ready to sell." href="/sell-car" action="Sell a car" />
          )}
        </section>

        <div className="mt-7 grid gap-7 lg:grid-cols-2">
          <section id="bookings" className="scroll-mt-6 border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between gap-4">
              <div><h2 className="text-xl font-bold text-[#0b1f33]">Upcoming bookings</h2><p className="mt-1 text-sm text-slate-600">Your mobile car care appointments.</p></div>
              <Link href="/dashboard/bookings" className="inline-flex items-center gap-1 text-sm font-semibold text-[#d92d20] hover:text-[#b42318]">View all <ArrowRight size={15} /></Link>
            </div>
            {bookings.length ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {bookings.map((booking) => (
                  <Link key={booking.id} href={`/dashboard/bookings/${booking.id}`} className="block border-b border-slate-100 p-4 last:border-b-0 hover:bg-slate-50">
                    <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-[#0b1f33]">{booking.service_types?.name ?? "Mobile service"}</p><p className="mt-1 text-sm text-slate-600">{booking.car_make} {booking.car_model}</p></div><Status status={booking.status} styles={bookingStatusStyles} /></div>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500"><span className="inline-flex items-center gap-1"><CalendarDays size={13} />{dateLabel(booking.preferred_date)}</span>{(booking.city || booking.postcode) && <span className="inline-flex items-center gap-1"><MapPin size={13} />{[booking.city, booking.postcode].filter(Boolean).join(" ")}</span>}</div>
                  </Link>
                ))}
              </div>
            ) : <EmptyState title="No upcoming bookings" copy="Book mobile car care at your home or workplace." href="/services" action="Browse services" />}
          </section>

          <section id="inspections" className="scroll-mt-6 border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between gap-4">
              <div><h2 className="text-xl font-bold text-[#0b1f33]">Vehicle inspections</h2><p className="mt-1 text-sm text-slate-600">Requests and inspection reports.</p></div>
              <Link href="/dashboard/verifications" className="inline-flex items-center gap-1 text-sm font-semibold text-[#d92d20] hover:text-[#b42318]">View all <ArrowRight size={15} /></Link>
            </div>
            {verifications.length ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {verifications.map((inspection) => {
                  const vehicle = inspection.cars ? `${inspection.cars.year} ${inspection.cars.make} ${inspection.cars.model}` : `${inspection.external_make ?? "Vehicle"} ${inspection.external_model ?? ""}`.trim();
                  return <Link key={inspection.id} href={`/dashboard/verifications/${inspection.id}`} className="block border-b border-slate-100 p-4 last:border-b-0 hover:bg-slate-50"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-[#0b1f33]">{vehicle}</p><p className="mt-1 text-sm text-slate-600">{inspection.vehicle_registration}</p></div><Status status={inspection.status} styles={inspectionStatusStyles} /></div><p className="mt-3 inline-flex items-center gap-1 text-xs text-slate-500"><CalendarDays size={13} />{dateLabel(inspection.scheduled_for ?? inspection.preferred_date)}</p></Link>;
                })}
              </div>
            ) : <EmptyState title="No active inspections" copy="Request a vehicle inspection when you need one." href="/verification" action="Request inspection" />}
          </section>
        </div>
      </div>
    </main>
  );
}
