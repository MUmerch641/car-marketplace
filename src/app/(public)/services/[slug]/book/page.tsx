import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import { getActiveService } from "@/lib/services/services";
import { BookingForm } from "@/components/services/booking-form";

export default async function BookServicePage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; if (!await getCurrentUser()) redirect(`/login?next=${encodeURIComponent(`/services/${slug}/book`)}`); const service = await getActiveService(slug); if (!service) notFound(); return <main className="mx-auto max-w-4xl px-5 py-10 lg:px-8"><p className="text-sm font-bold uppercase tracking-[.12em] text-brand">Mobile service booking</p><h1 className="mt-2 text-3xl font-bold text-ink">Book {service.name}</h1><p className="mt-3 text-[#667085]">Choose your preferred visit time. We will confirm the final appointment after reviewing the request.</p><div className="mt-7 border border-[#E4E7EC] bg-white p-6"><BookingForm service={service} /></div></main>; }
