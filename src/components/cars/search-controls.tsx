"use client";

import { useState } from "react";
import { Search, MapPin, SlidersHorizontal, ChevronDown, CarFront, Navigation } from "lucide-react";

export function SearchControls({ values = {} }: { values?: Record<string, string> }) {
  const [showAdvanced, setShowAdvanced] = useState(
    !!(values.fuel || values.transmission || values.maxMileage || values.sort)
  );

  return (
    <form action="/cars" className="rounded-2xl border border-[#E4E7EC] bg-white p-4 shadow-sm transition-all">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        
        {/* Make or model */}
        <div className="relative group">
          <label htmlFor="make" className="absolute -top-2 left-3 z-10 inline-block bg-white px-1 text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">
            Make or Model
          </label>
          <div className="relative flex items-center">
            <CarFront size={16} className="absolute left-3 text-[#98A2B3] group-focus-within:text-[#D92D20] transition-colors" />
            <input
              id="make"
              name="make"
              defaultValue={values.make}
              placeholder="e.g. BMW"
              className="h-[52px] w-full rounded-xl border border-[#E4E7EC] bg-[#FAFAFA] pl-10 pr-4 text-sm font-semibold outline-none transition-all placeholder:font-normal placeholder:text-[#98A2B3] hover:border-[#D0D5DD] focus:border-[#D92D20] focus:bg-white focus:ring-4 focus:ring-red-50"
            />
          </div>
        </div>

        {/* Postcode */}
        <div className="relative group">
          <label htmlFor="postcode" className="absolute -top-2 left-3 z-10 inline-block bg-white px-1 text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">
            Location
          </label>
          <div className="relative flex items-center">
            <MapPin size={16} className="absolute left-3 text-[#98A2B3] group-focus-within:text-[#D92D20] transition-colors" />
            <input
              id="postcode"
              name="postcode"
              defaultValue={values.postcode}
              placeholder="Postcode"
              className="h-[52px] w-full rounded-xl border border-[#E4E7EC] bg-[#FAFAFA] pl-10 pr-4 text-sm font-semibold outline-none transition-all placeholder:font-normal placeholder:text-[#98A2B3] hover:border-[#D0D5DD] focus:border-[#D92D20] focus:bg-white focus:ring-4 focus:ring-red-50"
            />
          </div>
        </div>

        {/* Min Price */}
        <div className="relative group">
          <label htmlFor="minPrice" className="absolute -top-2 left-3 z-10 inline-block bg-white px-1 text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">
            Min Price
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-4 text-sm font-bold text-[#98A2B3] group-focus-within:text-[#D92D20] transition-colors">£</span>
            <input
              id="minPrice"
              name="minPrice"
              defaultValue={values.minPrice}
              inputMode="numeric"
              placeholder="No min"
              className="h-[52px] w-full rounded-xl border border-[#E4E7EC] bg-[#FAFAFA] pl-8 pr-4 text-sm font-semibold outline-none transition-all placeholder:font-normal placeholder:text-[#98A2B3] hover:border-[#D0D5DD] focus:border-[#D92D20] focus:bg-white focus:ring-4 focus:ring-red-50"
            />
          </div>
        </div>

        {/* Max Price */}
        <div className="relative group">
          <label htmlFor="maxPrice" className="absolute -top-2 left-3 z-10 inline-block bg-white px-1 text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">
            Max Price
          </label>
          <div className="relative flex items-center">
             <span className="absolute left-4 text-sm font-bold text-[#98A2B3] group-focus-within:text-[#D92D20] transition-colors">£</span>
            <input
              id="maxPrice"
              name="maxPrice"
              defaultValue={values.maxPrice}
              inputMode="numeric"
              placeholder="No max"
              className="h-[52px] w-full rounded-xl border border-[#E4E7EC] bg-[#FAFAFA] pl-8 pr-4 text-sm font-semibold outline-none transition-all placeholder:font-normal placeholder:text-[#98A2B3] hover:border-[#D0D5DD] focus:border-[#D92D20] focus:bg-white focus:ring-4 focus:ring-red-50"
            />
          </div>
        </div>

        <button type="submit" className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#D92D20] px-8 text-sm font-bold text-white transition-all hover:bg-[#B42318] hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D92D20] lg:w-auto">
          <Search size={18} />
          <span>Search</span>
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#F2F4F7] pt-4">
        <button 
          type="button" 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-semibold text-[#667085] hover:text-[#0B1F33] transition-colors"
        >
          <SlidersHorizontal size={16} />
          {showAdvanced ? "Hide Advanced Filters" : "Show Advanced Filters"}
        </button>
      </div>

      {showAdvanced && (
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-reveal-fade">
          <div className="relative group">
            <select name="fuel" defaultValue={values.fuel} className="h-[52px] w-full appearance-none rounded-xl border border-[#E4E7EC] bg-[#FAFAFA] px-4 text-sm font-semibold outline-none transition-all hover:border-[#D0D5DD] focus:border-[#D92D20] focus:bg-white focus:ring-4 focus:ring-red-50">
              <option value="">Any Fuel Type</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="hybrid">Hybrid</option>
              <option value="electric">Electric</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
          </div>

          <div className="relative group">
            <select name="transmission" defaultValue={values.transmission} className="h-[52px] w-full appearance-none rounded-xl border border-[#E4E7EC] bg-[#FAFAFA] px-4 text-sm font-semibold outline-none transition-all hover:border-[#D0D5DD] focus:border-[#D92D20] focus:bg-white focus:ring-4 focus:ring-red-50">
              <option value="">Any Transmission</option>
              <option value="manual">Manual</option>
              <option value="automatic">Automatic</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
          </div>

          <div className="relative group">
             <div className="relative flex items-center">
              <Navigation size={14} className="absolute left-4 text-[#98A2B3] group-focus-within:text-[#D92D20] transition-colors" />
              <input
                name="maxMileage"
                defaultValue={values.maxMileage}
                placeholder="Max Mileage"
                inputMode="numeric"
                className="h-[52px] w-full rounded-xl border border-[#E4E7EC] bg-[#FAFAFA] pl-10 pr-4 text-sm font-semibold outline-none transition-all placeholder:font-normal placeholder:text-[#98A2B3] hover:border-[#D0D5DD] focus:border-[#D92D20] focus:bg-white focus:ring-4 focus:ring-red-50"
              />
            </div>
          </div>

          <div className="relative group">
            <select name="sort" defaultValue={values.sort} className="h-[52px] w-full appearance-none rounded-xl border border-[#E4E7EC] bg-[#FAFAFA] px-4 text-sm font-semibold outline-none transition-all hover:border-[#D0D5DD] focus:border-[#D92D20] focus:bg-white focus:ring-4 focus:ring-red-50">
              <option value="newest">Sort by: Newest</option>
              <option value="price_asc">Sort by: Price (Low to High)</option>
              <option value="price_desc">Sort by: Price (High to Low)</option>
              <option value="mileage">Sort by: Lowest Mileage</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
          </div>
        </div>
      )}
    </form>
  );
}