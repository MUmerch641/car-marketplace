import Link from "next/link";
import { ArrowRight, CarFront, ShieldCheck, Search } from "lucide-react";
import { getCurrentProfile, requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { HomeServiceCard } from "@/components/dashboard/home-service-card";
import { VisitCard } from "@/components/dashboard/visit-card";
import { ShazGuide } from "@/components/shaz/guide";
export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const [profile, garage, visits] = await Promise.all([
    getCurrentProfile(),
    supabase
      .from("garage_vehicles")
      .select("id,make,model,registration")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("service_bookings")
      .select(
        "id,car_make,car_model,car_registration,status,preferred_date,preferred_time,city,postcode,service_types(name)",
      )
      .eq("customer_id", user.id)
      .not("status", "in", "(completed,cancelled)")
      .order("preferred_date", { ascending: true })
      .limit(1),
  ]);
  const firstName = profile?.full_name?.trim().split(" ")[0];
  const visit = visits.data?.[0];
  return (
    <main className="bg-sand py-7 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-6 px-5 lg:px-8">
        <header className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#526568]">Your Shaz</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink">
              Hello{firstName ? `, ${firstName}` : " there"}
              <span className="text-brand">.</span>
            </h1>
            <p className="mt-2 text-sm text-[#526568]">
              A little less hassle for your car.
            </p>
          </div>
          <Link
            href="/help"
            className="min-h-11 content-center text-sm font-semibold text-brand-hover"
          >
            Need a hand?
          </Link>
        </header>
        {visits.error && (
          <ShazGuide title="Your visits couldn’t load" mood="attention">
            Your bookings are still saved.{" "}
            <Link href="/dashboard/bookings" className="font-bold underline">
              Open Visits to try again
            </Link>
          </ShazGuide>
        )}
        {visit && (
          <section aria-label="Your next visit">
            <div className="mb-3 flex justify-between">
              <h2 className="text-sm font-bold text-ink">Your next visit</h2>
              <Link
                href="/dashboard/bookings"
                className="text-sm font-bold text-brand-hover"
              >
                All visits
              </Link>
            </div>
            <VisitCard
              showProgress
              visit={{
                id: visit.id,
                kind: "service",
                title: visit.service_types?.name ?? "Oil & filter change",
                vehicle: `${visit.car_make} ${visit.car_model}`,
                registration: visit.car_registration,
                status: visit.status,
                date: visit.preferred_date,
                time: visit.preferred_time,
                location: [visit.city, visit.postcode]
                  .filter(Boolean)
                  .join(", "),
              }}
            />
          </section>
        )}
        <HomeServiceCard vehicles={garage.data ?? []} />
        {garage.error && (
          <p className="text-sm text-brand-hover" role="status">
            Your saved cars couldn’t load. You can still book using your
            registration.
          </p>
        )}
        <section
          aria-label="More from Shaz"
          className="grid gap-3 sm:grid-cols-3"
        >
          {[
            {
              href: "/verification",
              title: "Inspect a car",
              copy: "Get a clearer picture before buying",
              icon: ShieldCheck,
            },
            {
              href: "/dashboard/garage",
              title: "Your garage",
              copy: `${garage.data?.length ?? 0} saved cars · Add or manage vehicles`,
              icon: CarFront,
            },
            {
              href: "/cars",
              title: "Find your next car",
              copy: "Browse the Shaz marketplace",
              icon: Search,
            },
          ].map(({ icon: Icon, ...item }) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-2xl border border-[#E4E7E3] bg-white p-5 hover:border-[#B8C5BE]"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sand text-ink">
                <Icon size={21} />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-ink">{item.title}</h2>
                <p className="mt-1 text-xs leading-5 text-[#526568]">
                  {item.copy}
                </p>
              </div>
              <ArrowRight
                size={15}
                className="ml-auto shrink-0 text-brand-hover"
              />
            </Link>
          ))}
        </section>
        <div className="flex flex-wrap gap-5 text-sm font-semibold text-[#526568]">
          <Link
            href="/dashboard/verifications"
            className="underline underline-offset-4"
          >
            Inspection reports
          </Link>
          <Link href="/dashboard/cars" className="underline underline-offset-4">
            My car listings
          </Link>
          <Link href="/sell-car" className="underline underline-offset-4">
            Sell my car
          </Link>
        </div>
      </div>
    </main>
  );
}
