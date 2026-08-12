import Link from "next/link";

export function SearchControls({ compact = false, values = {} }: { compact?: boolean; values?: Record<string, string> }) {
  return (
    <form action="/cars" className={`grid gap-3 ${compact ? "lg:grid-cols-[1.25fr_1fr_.8fr_.8fr_auto]" : "md:grid-cols-2 xl:grid-cols-5"}`}>
      <label className="sr-only" htmlFor="make">Make or model</label>
      <input
        id="make"
        name="make"
        defaultValue={values.make}
        placeholder="Make or model"
        className="input-standard h-[52px]"
      />
      <input
        name="postcode"
        defaultValue={values.postcode}
        placeholder="Postcode"
        className="input-standard h-[52px]"
      />
      <input
        name="minPrice"
        defaultValue={values.minPrice}
        inputMode="numeric"
        placeholder="Minimum price"
        className="input-standard h-[52px]"
      />
      <input
        name="maxPrice"
        defaultValue={values.maxPrice}
        inputMode="numeric"
        placeholder="Maximum price"
        className="input-standard h-[52px]"
      />
      <button type="submit" className="btn-primary h-[52px]">
        Search
      </button>
      {compact && (
        <Link href="/cars" className="input-tertiary text-left underline underline-offset-4 lg:col-span-5">
          Advanced Search
        </Link>
      )}
    </form>
  );
}