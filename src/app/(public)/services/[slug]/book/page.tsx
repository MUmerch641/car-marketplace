import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import { getActiveService } from "@/lib/services/services";
import { BookingForm } from "@/components/services/booking-form";

export default async function BookServicePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ registration?: string; oil?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  if (!await getCurrentUser()) {
    const next = `/services/${slug}/book${query.registration ? `?registration=${encodeURIComponent(query.registration)}` : ""}`;
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  const service = await getActiveService(slug);
  if (!service || service.slug !== "oil-change") notFound();

  return (
    <main className="bg-[#F7F4EF] py-10">
      <div className="mx-auto max-w-4xl px-5 lg:px-8">
        <p className="text-sm font-bold uppercase tracking-[.12em] text-brand">Shaz mobile oil change</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Book {service.name}</h1>
        <p className="mt-3 max-w-2xl text-[#667085]">First confirm your vehicle, then choose the location and preferred time. We confirm the oil specification before your appointment.</p>
        <div className="mt-7 rounded-2xl border border-[#E4E7EC] bg-white p-5 shadow-sm sm:p-7"><BookingForm service={service} initialRegistration={query.registration} initialOilId={query.oil} /></div>
      </div>
    </main>
  );
}
