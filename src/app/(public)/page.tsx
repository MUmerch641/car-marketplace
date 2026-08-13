import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Car } from "lucide-react";
import { CarCard } from "@/components/cars/car-card";
import { ServiceCard } from "@/components/services/service-card";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { HeroSection } from "@/components/hero/HeroSection";
import { FeaturedCarCard } from "@/components/cars/featured-car-card";
import AnimatedContent from "@/components/AnimatedContent";
import Magnet from "@/components/Magnet";
import SpotlightCard from "@/components/SpotlightCard";
import { makes } from "@/lib/mock-data";
import { getHomepageCars } from "@/lib/marketplace/cars";
import { getActiveServices } from "@/lib/services/services";
import { CSS_STAGGER } from "@/lib/motion";

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
          {/* Section heading */}
          <AnimatedContent distance={28} duration={0.7}>
            <SectionHeading
              eyebrow="Recently added"
              title="Browse used cars"
              link={{ href: "/cars", label: "View all cars" }}
            />
          </AnimatedContent>

          {browseCars.length ? (
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {browseCars.map((car, i) => (
                <div
                  key={car.id}
                  className="animate-reveal"
                  style={{ animationDelay: `${i * CSS_STAGGER.card}ms` }}
                >
                  <CarCard car={car} />
                </div>
              ))}
            </div>
          ) : (
            /* ── Compact empty state — fade once, no skeleton feel ── */
            <AnimatedContent distance={16} duration={0.6} delay={0.1}>
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
            </AnimatedContent>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          POPULAR MAKES — light neutral
      ════════════════════════════════════════════════════ */}
      <section className="border-y border-[#E4E7EC] bg-[#F5F6F7]">
        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
          <AnimatedContent distance={28} duration={0.7}>
            <SectionHeading eyebrow="Find by manufacturer" title="Popular makes" />
          </AnimatedContent>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {makes.map((make, i) => (
              <Link
                href={`/cars?make=${make}`}
                key={make}
                className="animate-reveal rounded-full border border-[#D0D5DD] bg-white px-4 py-2 text-sm font-semibold text-[#344054] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#D92D20] hover:bg-[#FFF5F4] hover:text-[#D92D20] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D92D20]"
                style={{ animationDelay: `${i * CSS_STAGGER.chip}ms` }}
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
          <AnimatedContent distance={28} duration={0.7}>
            <SectionHeading
              eyebrow="Selected listings"
              title="Featured cars"
              copy="A curated selection of quality used cars worth a closer look."
              link={{ href: "/cars", label: "See all listings" }}
            />
          </AnimatedContent>
          {featuredCars.length ? (
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredCars.map((car, i) => (
                <AnimatedContent
                  key={car.id}
                  distance={24}
                  duration={0.65}
                  delay={i * CSS_STAGGER.card / 1000}
                >
                  <FeaturedCarCard car={car} />
                </AnimatedContent>
              ))}
            </div>
          ) : (
            <AnimatedContent distance={16} duration={0.6} delay={0.1}>
              <div className="mt-7 flex flex-col items-center rounded-2xl border border-[#E4E7EC] bg-[#F9FAFB] px-6 py-12 text-center">
                <p className="text-sm text-[#667085]">
                  Featured listings will appear here soon.
                </p>
              </div>
            </AnimatedContent>
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
          {/* Content — slides in from left */}
          <AnimatedContent
            direction="horizontal"
            distance={40}
            duration={0.7}
            ease="power2.out"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#F97066]">
                Sell your car
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Ready to sell your car?
              </h2>
              <p className="mt-3 max-w-md text-base leading-7 text-[#94A3B8]">
                List your vehicle in minutes. Connect directly with buyers across
                the UK.
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
          </AnimatedContent>

          {/* CTA — slides in from right, slightly after content */}
          <AnimatedContent
            direction="horizontal"
            reverse
            distance={30}
            duration={0.7}
            delay={0.15}
            ease="power2.out"
          >
            <div className="flex shrink-0 flex-col gap-3 sm:items-end">
              <Magnet strength={7} returnDuration={350}>
                <Button href="/sell-car" className="px-8 py-4 text-base">
                  Sell My Car
                </Button>
              </Magnet>
              <Link
                href="/about"
                className="text-sm font-semibold text-[#94A3B8] hover:text-white transition-colors"
              >
                How it works →
              </Link>
            </div>
          </AnimatedContent>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          VEHICLE VERIFICATION — light neutral
      ════════════════════════════════════════════════════ */}
      <section className="bg-[#F5F6F7]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 lg:grid-cols-[1fr_1fr] lg:gap-14 lg:px-8">
          {/* Image — enters from left */}
          <AnimatedContent
            direction="horizontal"
            distance={50}
            duration={0.75}
            ease="power2.out"
          >
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
          </AnimatedContent>

          {/* Content — enters from right */}
          <AnimatedContent
            direction="horizontal"
            reverse
            distance={50}
            duration={0.75}
            delay={0.1}
            ease="power2.out"
          >
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
                ].map((item, i) => (
                  <SpotlightCard
                    key={item}
                    spotlightOpacity={0.07}
                    spotlightSize={180}
                    className="rounded-lg"
                  >
                    <li
                      className="animate-reveal flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-[#344054] transition-colors hover:bg-white/70"
                      style={{ animationDelay: `${i * CSS_STAGGER.benefit}ms` }}
                    >
                      <CheckCircle2
                        size={16}
                        className="shrink-0 text-[#16A34A]"
                        strokeWidth={2.5}
                      />
                      {item}
                    </li>
                  </SpotlightCard>
                ))}
              </ul>

              <div className="mt-8">
                <Button href="/verification" className="px-7 py-3.5">
                  Request Vehicle Verification
                </Button>
              </div>
            </div>
          </AnimatedContent>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          MOBILE SERVICES — white
      ════════════════════════════════════════════════════ */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <AnimatedContent distance={28} duration={0.7}>
            <SectionHeading
              eyebrow="Mobile car services"
              title="We come to you"
              copy="Book a location and a qualified worker travels to your car. No garage visit required."
              link={{ href: "/services", label: "View all services" }}
            />
          </AnimatedContent>
          {services.length ? (
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((service, i) => (
                <AnimatedContent
                  key={service.slug}
                  distance={22}
                  duration={0.65}
                  delay={i * CSS_STAGGER.card / 1000}
                >
                  <ServiceCard service={service} />
                </AnimatedContent>
              ))}
            </div>
          ) : (
            <AnimatedContent distance={16} duration={0.6} delay={0.1}>
              <div className="mt-7 flex flex-col items-center rounded-2xl border border-[#E4E7EC] bg-[#F9FAFB] px-6 py-12 text-center">
                <p className="text-sm text-[#667085]">
                  Mobile services will be available soon.
                </p>
              </div>
            </AnimatedContent>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          HOW IT WORKS — light neutral
      ════════════════════════════════════════════════════ */}
      <section className="border-t border-[#E4E7EC] bg-[#F5F6F7] py-14">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <AnimatedContent distance={28} duration={0.7}>
            <SectionHeading title="How it works" />
          </AnimatedContent>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {(
              [
                [
                  "01",
                  "Find a car",
                  "Search vehicles by make, model, location and price range.",
                ],
                [
                  "02",
                  "Book service",
                  "Choose your mobile service, date and time.",
                ],
                [
                  "03",
                  "Get verified",
                  "Request an inspection before you buy.",
                ],
                [
                  "04",
                  "Sell with confidence",
                  "Request an inspection before you buy.",
                ],
                [
                  "05",
                  "Care at home",
                  "Maintain your car where it suits you.",
                ],
              ] as const
            ).map(([number, title, text], i) => (
              <AnimatedContent
                key={number}
                distance={22}
                duration={0.65}
                delay={i * CSS_STAGGER.step / 1000}
              >
                <div className="relative overflow-hidden rounded-2xl border border-[#E4E7EC] bg-white p-7 shadow-sm">
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
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
