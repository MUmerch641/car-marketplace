"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CarFront, Plus } from "lucide-react";
import { ShazCompanion } from "@/components/shaz/companion";
type Vehicle = {
  id: string;
  make: string;
  model: string;
  registration: string | null;
};
export function HomeServiceCard({ vehicles }: { vehicles: Vehicle[] }) {
  const [selected, setSelected] = useState(vehicles[0]?.id ?? "");
  const vehicle = vehicles.find((item) => item.id === selected);
  const href = `/services/oil-change/book${vehicle?.registration ? `?registration=${encodeURIComponent(vehicle.registration)}` : ""}`;
  return (
    <section
      aria-labelledby="home-service-title"
      className="overflow-hidden rounded-[28px] border border-[#E4E7E3] bg-white"
    >
      <div className="grid items-center gap-6 p-5 sm:p-7 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-hover">
            Oil &amp; filter change
          </p>
          <h2
            id="home-service-title"
            className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-ink"
          >
            Good care
            <br />
            without the garage trip
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-[#526568]">
            We come to your home or work. Choose your car, arrange a visit and
            receive your full quote before paying.
          </p>
          {vehicles.length ? (
            <div className="mt-5">
              <label htmlFor="service-car" className="input-label">
                Which car are we looking after?
              </label>
              <select
                id="service-car"
                value={selected}
                onChange={(event) => setSelected(event.target.value)}
                className="input-standard w-full"
              >
                {vehicles.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.make} {item.model}
                    {item.registration ? ` · ${item.registration}` : ""}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <Link
              href="/dashboard/garage"
              className="mt-5 flex items-center gap-2 text-sm font-bold text-[#526568]"
            >
              <Plus size={16} />
              Add a car to your garage
            </Link>
          )}
          <Link
            href={href}
            className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-brand-hover px-5 text-sm font-bold text-white hover:bg-[#AC302A]"
          >
            Service my car
            <ArrowRight size={17} />
          </Link>
        </div>
        <div className="rounded-3xl bg-sand p-4">
          <Image
            src="/shaz/service-helper.png"
            alt="Shaz mobile car care"
            width={500}
            height={350}
            sizes="(max-width:1024px) 85vw, 40vw"
            className="mx-auto h-44 w-full object-contain sm:h-56"
          />
          <div className="flex items-center gap-3 rounded-2xl bg-[#E3F1EB] p-3">
            <ShazCompanion size={56} reactionKey={selected} />
            <div>
              <p className="text-sm font-bold text-ink">
                {vehicle
                  ? `${vehicle.make} ${vehicle.model}`
                  : "Ready when you are"}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs leading-5 text-[#526568]">
                <CarFront size={13} />
                {vehicle?.registration || "Start with your registration"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
