"use client";

import Link from "next/link";
import { ShazGuide } from "@/components/shaz/guide";

export default function WebsiteError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-ink">
        Let’s try that again
      </h1>
      <ShazGuide title="This page couldn’t load" mood="attention">
        Something went wrong while loading this page. Please try again.
      </ShazGuide>
      <p className="mt-5 text-sm leading-6 text-[#526568]">
        If you were making a booking or payment check Your visits before trying
        to submit it again.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={retry}
          className="min-h-12 rounded-[14px] bg-brand-hover px-5 font-bold text-white hover:bg-[#AC302A]"
        >
          Try again
        </button>
        <Link
          href="/dashboard/bookings"
          className="inline-flex min-h-12 items-center rounded-[14px] border border-[#B8C5BE] px-5 font-bold text-ink"
        >
          Your visits
        </Link>
      </div>
    </main>
  );
}
