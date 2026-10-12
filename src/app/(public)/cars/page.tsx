import { CustomerAccountNav } from "@/components/dashboard/customer-account-nav";
import { getCurrentProfile } from "@/lib/auth/server";
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
  const [result,profile] = await Promise.all([browseCars(params),getCurrentProfile()]);
  const customer = profile?.role === "customer";
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
      {customer && <CustomerAccountNav/>}
      <PageHero
        eyebrow="Used cars"
        title="Find the right car for your road ahead."
        copy="Browse active listings from sellers across the UK."
      />

      <div className="mx-auto max-w-7xl px-5 py-10 pb-24 sm:pb-10 lg:px-8">
        <SearchControls values={values} />



        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm font-semibold text-[#526568]">
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
            <div className="mt-8 rounded-2xl border border-[#E4E7E3] bg-[#FBF8F4] p-10 text-center">
              <h2 className="font-h3 text-ink">No cars found</h2>
              <p className="mt-2 text-[#526568]">
                Try removing a filter or broadening your search.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/cars"
                  className="rounded-md border border-[#E4E7E3] bg-white px-5 py-2.5 text-sm font-bold text-ink hover:bg-[#FBF8F4]"
                >
                  Clear filters
                </Link>
                <Link
                  href="/sell-car"
                  className="rounded-md bg-brand-hover px-5 py-2.5 text-sm font-bold text-white hover:bg-[#C73830]"
                >
                  Sell Your Car
                </Link>
              </div>
              {/* Popular makes below empty state */}
              <div className="mt-10">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#526568]">
                  Popular makes
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {["BMW", "Audi", "Mercedes-Benz", "Volkswagen", "Ford", "Honda", "Toyota"].map(
                    (make) => (
                      <Link
                        key={make}
                        href={`/cars?make=${make}`}
                        className="rounded-full border border-[#B8C5BE] bg-white px-3 py-1.5 text-xs font-semibold text-[#344054] hover:border-brand hover:text-brand"
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
            <span className="text-sm text-[#526568]">
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
