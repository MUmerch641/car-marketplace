import Link from "next/link";
import { CarCard } from "@/components/cars/car-card";
import { SearchControls } from "@/components/cars/search-controls";
import { PageHero } from "@/components/shared/page-hero";
import AnimatedContent from "@/components/AnimatedContent";
import { browseCars } from "@/lib/marketplace/cars";
import { CSS_STAGGER } from "@/lib/motion";

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const result = await browseCars(params);
  const values = Object.fromEntries(
    Object.entries(params).filter(([, value]) => typeof value === "string")
  ) as Record<string, string>;
  const totalPages = Math.max(1, Math.ceil(result.count / result.perPage));
  const url = (page: number) => {
    const query = new URLSearchParams(values);
    query.set("page", String(page));
    return `/cars?${query}`;
  };

  return (
    <>
      <PageHero
        eyebrow="Used cars"
        title="Find the right car for your road ahead."
        copy="Browse active listings from sellers across the UK."
      />

      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <SearchControls values={values} />

        <form
          action="/cars"
          className="mt-5 grid gap-3 border-t border-[#E4E7EC] pt-5 sm:grid-cols-4"
        >
          {Object.entries(values)
            .filter(
              ([key]) =>
                !["make", "postcode", "minPrice", "maxPrice", "page"].includes(
                  key
                )
            )
            .map(([key, value]) => (
              <input key={key} type="hidden" name={key} value={value} />
            ))}
          <select
            name="fuel"
            defaultValue={values.fuel}
            className="input-standard"
          >
            <option value="">Fuel type</option>
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="hybrid">Hybrid</option>
            <option value="electric">Electric</option>
          </select>
          <select
            name="transmission"
            defaultValue={values.transmission}
            className="input-standard"
          >
            <option value="">Transmission</option>
            <option value="manual">Manual</option>
            <option value="automatic">Automatic</option>
          </select>
          <input
            name="maxMileage"
            defaultValue={values.maxMileage}
            placeholder="Maximum mileage"
            className="input-standard"
          />
          <select
            name="sort"
            defaultValue={values.sort}
            className="input-standard"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price low to high</option>
            <option value="price_desc">Price high to low</option>
            <option value="mileage">Lowest mileage</option>
          </select>
          <button type="submit" className="btn-primary h-[52px]">
            Apply
          </button>
        </form>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm font-semibold text-[#667085]">
            {result.count} {result.count === 1 ? "car" : "cars"} found
          </p>
        </div>

        {result.cars.length ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {result.cars.map((car, i) => (
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
          <AnimatedContent distance={16} duration={0.6}>
            <div className="mt-8 rounded-2xl border border-[#E4E7EC] bg-[#F9FAFB] p-10 text-center">
              <h2 className="font-h3 text-ink">No cars found</h2>
              <p className="mt-2 text-[#667085]">
                Try removing a filter or broadening your search.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/cars"
                  className="rounded-md border border-[#E4E7EC] bg-white px-5 py-2.5 text-sm font-bold text-ink hover:bg-[#F9FAFB]"
                >
                  Clear filters
                </Link>
                <Link
                  href="/sell-car"
                  className="rounded-md bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-[#B42318]"
                >
                  Sell Your Car
                </Link>
              </div>
              {/* Popular makes below empty state */}
              <div className="mt-10">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#667085]">
                  Popular makes
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {["BMW", "Audi", "Mercedes-Benz", "Volkswagen", "Ford", "Honda", "Toyota"].map(
                    (make) => (
                      <Link
                        key={make}
                        href={`/cars?make=${make}`}
                        className="rounded-full border border-[#D0D5DD] bg-white px-3 py-1.5 text-xs font-semibold text-[#344054] hover:border-brand hover:text-brand"
                      >
                        {make}
                      </Link>
                    )
                  )}
                </div>
              </div>
            </div>
          </AnimatedContent>
        )}

        {totalPages > 1 && (
          <nav
            className="mt-8 flex items-center justify-center gap-4"
            aria-label="Pagination"
          >
            {result.page > 1 && (
              <Link href={url(result.page - 1)} className="font-bold text-brand">
                Previous
              </Link>
            )}
            <span className="text-sm text-[#667085]">
              Page {result.page} of {totalPages}
            </span>
            {result.page < totalPages && (
              <Link href={url(result.page + 1)} className="font-bold text-brand">
                Next
              </Link>
            )}
          </nav>
        )}
      </div>
    </>
  );
}
