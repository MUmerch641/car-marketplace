"use client";

import Link from "next/link";
import { Search, MapPin, ChevronDown } from "lucide-react";

const makes = [
  "Any Make",
  "BMW",
  "Audi",
  "Mercedes-Benz",
  "Volkswagen",
  "Ford",
  "Vauxhall",
  "Toyota",
  "Land Rover",
  "Kia",
  "Nissan",
  "MINI",
  "Volvo",
  "Skoda",
  "Hyundai",
];

export function HeroSearchPanel() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
      {/* Tab bar */}
      <div className="flex border-b border-[#E4E7EC] bg-[#F8F9FA]">
        <button className="relative px-6 py-3.5 text-sm font-bold text-[#0B1F33] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#D92D20]">
          Buy a Car
        </button>
        <Link
          href="/sell-car"
          className="px-6 py-3.5 text-sm font-semibold text-[#667085] transition-colors hover:text-[#0B1F33]"
        >
          Sell My Car
        </Link>
      </div>

      {/* Search form */}
      <form
        action="/cars"
        className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-[1.8fr_1fr_0.9fr_0.9fr_auto]"
      >
        {/* Make or model */}
        <div className="group relative border-b border-r-0 border-[#E4E7EC] sm:border-b-0 sm:border-r lg:border-b-0 lg:border-r">
          <label
            htmlFor="hero-make"
            className="absolute left-4 top-3 text-[10px] font-bold uppercase tracking-widest text-[#98A2B3]"
          >
            Make or Model
          </label>
          <div className="relative">
            <select
              id="hero-make"
              name="make"
              defaultValue=""
              className="h-[68px] w-full appearance-none bg-transparent pb-2 pl-4 pr-8 pt-7 text-sm font-semibold text-[#101828] outline-none focus:bg-[#FAFAFA]"
            >
              <option value="">Any Make or Model</option>
              {makes.slice(1).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3]"
            />
          </div>
        </div>

        {/* Postcode */}
        <div className="group relative border-b border-r-0 border-[#E4E7EC] sm:border-r lg:border-b-0 lg:border-r">
          <label
            htmlFor="hero-postcode"
            className="absolute left-4 top-3 text-[10px] font-bold uppercase tracking-widest text-[#98A2B3]"
          >
            Location
          </label>
          <div className="relative">
            <MapPin
              size={14}
              className="pointer-events-none absolute left-4 top-[calc(50%+6px)] -translate-y-1/2 text-[#98A2B3]"
            />
            <input
              id="hero-postcode"
              name="postcode"
              placeholder="e.g. SW1A 1AA"
              className="h-[68px] w-full bg-transparent pb-2 pl-10 pr-4 pt-7 text-sm font-semibold text-[#101828] outline-none placeholder:font-normal placeholder:text-[#98A2B3] focus:bg-[#FAFAFA]"
            />
          </div>
        </div>

        {/* Min price */}
        <div className="group relative border-b border-r-0 border-[#E4E7EC] sm:border-b-0 sm:border-r lg:border-r">
          <label
            htmlFor="hero-min"
            className="absolute left-4 top-3 text-[10px] font-bold uppercase tracking-widest text-[#98A2B3]"
          >
            Min Price
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-[calc(50%+6px)] -translate-y-1/2 text-sm font-bold text-[#98A2B3]">
              £
            </span>
            <input
              id="hero-min"
              name="minPrice"
              inputMode="numeric"
              placeholder="No min"
              className="h-[68px] w-full bg-transparent pb-2 pl-8 pr-4 pt-7 text-sm font-semibold text-[#101828] outline-none placeholder:font-normal placeholder:text-[#98A2B3] focus:bg-[#FAFAFA]"
            />
          </div>
        </div>

        {/* Max price */}
        <div className="group relative border-b border-[#E4E7EC] lg:border-b-0 lg:border-r">
          <label
            htmlFor="hero-max"
            className="absolute left-4 top-3 text-[10px] font-bold uppercase tracking-widest text-[#98A2B3]"
          >
            Max Price
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-[calc(50%+6px)] -translate-y-1/2 text-sm font-bold text-[#98A2B3]">
              £
            </span>
            <input
              id="hero-max"
              name="maxPrice"
              inputMode="numeric"
              placeholder="No max"
              className="h-[68px] w-full bg-transparent pb-2 pl-8 pr-4 pt-7 text-sm font-semibold text-[#101828] outline-none placeholder:font-normal placeholder:text-[#98A2B3] focus:bg-[#FAFAFA]"
            />
          </div>
        </div>

        {/* Search button */}
        <div className="flex items-center p-3">
          <button
            type="submit"
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#D92D20] px-8 text-sm font-bold text-white transition-all hover:bg-[#B42318] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D92D20]"
          >
            <Search size={16} />
            Search Cars
          </button>
        </div>
      </form>

      {/* Footer row */}
      <div className="flex items-center justify-between border-t border-[#F2F4F7] bg-[#F8F9FA] px-5 py-2.5">
        <p className="text-xs text-[#98A2B3]">
          Search <span className="font-bold text-[#344054]">thousands</span> of used cars across the UK
        </p>
        <Link
          href="/cars"
          className="flex items-center gap-1 text-xs font-bold text-[#D92D20] hover:underline"
        >
          Advanced Search →
        </Link>
      </div>
    </div>
  );
}
