import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Car } from "lucide-react";
import { CarCard } from "@/components/cars/car-card";
import { ServiceCard } from "@/components/services/service-card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { HeroSection } from "@/components/hero/HeroSection";
import { FeaturedCarCard } from "@/components/cars/featured-car-card";
import { makes } from "@/lib/mock-data";
import { getHomepageCars } from "@/lib/marketplace/cars";
import { getActiveServices } from "@/lib/services/services";

export default async function HomePage() {
  const [browseCars, featuredCars, services] = await Promise.all([
    getHomepageCars(),
    getHomepageCars(true),
    getActiveServices(4),
  ]);

  return (
    <>
      {/* ════════════════════════════════════════════════════
          HERO — dark navy, seamlessly connected to navbar
      ════════════════════════════════════════════════════ */}
      <HeroSection />

      {/* ════════════════════════════════════════════════════
          BROWSE USED CARS — white
      ════════════════════════════════════════════════════ */}
      <section className="bg-white pt-16 pb-14">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Recently added"
            title="Browse used cars"
            link={{ href: "/cars", label: "View all cars" }}
          />
          {browseCars.length ? (
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {browseCars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            /* ── Compact empty state ── */
            <div className="mt-8 flex flex-col items-center rounded-2xl border border-[#E4E7EC] bg-[#F9FAFB] px-6 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EFF0F1]">
                <Car size={26} className="text-[#98A2B3]" strokeWidth={1.5} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#101828]">
                New listings added daily
              </h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[#667085]">
                Be the first to browse when cars are listed. Check back soon or
                list your own vehicle today.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button href="/sell-car">Sell Your Car</Button>
                <Button href="/cars" variant="outline">
                  Browse All Filters →
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          POPULAR MAKES — light neutral
      ════════════════════════════════════════════════════ */}
      <section className="border-y border-[#E4E7EC] bg-[#F5F6F7]">
        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
          <SectionHeading eyebrow="Find by manufacturer" title="Popular makes" />
          <div className="mt-6 flex flex-wrap gap-2.5">
            {makes.map((make) => (
              <Link
                href={`/cars?make=${make}`}
                key={make}
                className="rounded-full border border-[#D0D5DD] bg-white px-4 py-2 text-sm font-semibold text-[#344054] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#D92D20] hover:bg-[#FFF5F4] hover:text-[#D92D20] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D92D20]"
              >
                {make}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FEATURED CARS — white
      ════════════════════════════════════════════════════ */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Selected listings"
            title="Featured cars"
            copy="A curated selection of quality used cars worth a closer look."
            link={{ href: "/cars", label: "See all listings" }}
          />
          {featuredCars.length ? (
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredCars.map((car) => (
                <FeaturedCarCard key={car.id} car={car} />
              ))}
            </div>
          ) : (
            <div className="mt-7 flex flex-col items-center rounded-2xl border border-[#E4E7EC] bg-[#F9FAFB] px-6 py-12 text-center">
              <p className="text-sm text-[#667085]">
                Featured listings will appear here soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          SELL YOUR CAR CTA — full-width navy
      ════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#0B1F33]">
        {/* Subtle texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, #fff 0px, #fff 1px, transparent 1px, transparent 48px)",
          }}
        />

        {/* Red accent bar */}
        <div className="absolute left-0 top-0 h-full w-1 bg-[#D92D20]" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-8 py-14 sm:flex-row sm:items-center sm:justify-between lg:px-12 lg:py-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#F97066]">
              Sell your car
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Ready to sell your car?
            </h2>
            <p className="mt-3 max-w-md text-base leading-7 text-[#94A3B8]">
              List your vehicle in minutes. Connect directly with buyers across
              the UK — no hidden fees, no middlemen.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-6 text-sm text-[#64748B]">
              {["Free to list", "Direct buyer contact", "Control your price"].map(
                (item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle2
                      size={14}
                      className="text-[#16A34A]"
                      strokeWidth={2.5}
                    />
                    {item}
                  </span>
                )
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:items-end">
            <Button href="/sell-car" className="px-8 py-4 text-base">
              Sell My Car
            </Button>
            <Link
              href="/about"
              className="text-sm font-semibold text-[#94A3B8] hover:text-white transition-colors"
            >
              How it works →
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          VEHICLE VERIFICATION — light neutral
      ════════════════════════════════════════════════════ */}
      <section className="bg-[#F5F6F7]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[1fr_1fr] lg:gap-14 lg:px-8">
          {/* Image */}
          <div className="relative overflow-hidden rounded-2xl shadow-xl" style={{ minHeight: "340px" }}>
            {/* Gradient overlay bottom */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 rounded-b-2xl bg-gradient-to-t from-black/40 to-transparent" />
            <Image
              src="https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=1200&q=85"
              alt="Inspector reviewing a vehicle up close"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
              style={{ objectPosition: "center 30%" }}
            />
          </div>

          {/* Content */}
          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#D92D20]">
              Vehicle verification
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0B1F33] sm:text-4xl">
              Buy with confidence
            </h2>
            <p className="mt-2 text-lg font-semibold text-[#344054]">
              Not sure about a car?
            </p>
            <p className="mt-2 max-w-lg leading-7 text-[#667085]">
              Have one of our inspectors visit the vehicle before you buy. They
              check the car in person and produce a clear report for your
              decision.
            </p>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Physical vehicle visit",
                "Condition checks",
                "Inspection photos",
                "Inspection report",
                "Verified vehicle status",
                "Peace of mind guarantee",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm font-semibold text-[#344054]">
                  <CheckCircle2
                    size={16}
                    className="shrink-0 text-[#16A34A]"
                    strokeWidth={2.5}
                  />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Button href="/verification" className="px-7 py-3.5">
                Request Vehicle Verification
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          MOBILE SERVICES — white
      ════════════════════════════════════════════════════ */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Mobile car services"
            title="We come to you"
            copy="Book a location and a qualified worker travels to your car. No physical garage visit required."
            link={{ href: "/services", label: "View all services" }}
          />
          {services.length ? (
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((service) => (
                <ServiceCard key={service.slug} service={service} />
              ))}
            </div>
          ) : (
            <div className="mt-7 flex flex-col items-center rounded-2xl border border-[#E4E7EC] bg-[#F9FAFB] px-6 py-12 text-center">
              <p className="text-sm text-[#667085]">
                Mobile services will be available soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          HOW IT WORKS — light neutral
      ════════════════════════════════════════════════════ */}
      <section className="border-t border-[#E4E7EC] bg-[#F5F6F7] py-14">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Buying made straightforward"
            title="How it works"
          />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {(
              [
                [
                  "01",
                  "Find a car",
                  "Search vehicles by make, model, location and price range that work for you.",
                ],
                [
                  "02",
                  "Check the details",
                  "Review mileage, fuel type, transmission and service history before reaching out.",
                ],
                [
                  "03",
                  "Contact the seller",
                  "Ask questions and arrange the next step directly with the seller. No middlemen.",
                ],
              ] as const
            ).map(([number, title, text]) => (
              <div
                key={number}
                className="relative overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white p-7 shadow-sm"
              >
                {/* Large background step number */}
                <span
                  className="pointer-events-none absolute -right-2 -top-4 select-none text-[6rem] font-black leading-none text-[#0B1F33]/[0.04]"
                  aria-hidden="true"
                >
                  {number}
                </span>
                <p className="text-xs font-bold uppercase tracking-wider text-[#D92D20]">
                  Step {number}
                </p>
                <h3 className="mt-3 text-xl font-bold text-[#101828]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#667085]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
