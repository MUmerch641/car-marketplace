import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/server";
import { getActiveService } from "@/lib/services/services";
import { createClient } from "@/lib/supabase/server";
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
  const user = await getCurrentUser();
  if (!user) {
    const values = new URLSearchParams();
    if (query.registration) values.set("registration",query.registration);
    if (query.oil) values.set("oil",query.oil);
    const next = `/services/${slug}/book${values.size ? `?${values}` : ""}`;
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  const service = await getActiveService(slug);
  if (!service || service.slug !== "oil-change") notFound();
  const supabase = await createClient();
  const { data: savedCars } = await supabase.from("garage_vehicles").select("id,make,model,registration").eq("customer_id", user.id).order("created_at", { ascending: false });

  return (
    <main className="bg-[#F7F4EF] py-5 sm:py-8">
      <div className="mx-auto max-w-4xl px-5 lg:px-8">
        <Link href="/services" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#526568]"><ArrowLeft size={18}/>Back to services</Link>
        <div className="mt-3 rounded-3xl border border-[#E4E7E3] bg-white p-5 shadow-sm sm:p-7"><BookingForm service={service} initialRegistration={query.registration} initialOilId={query.oil} customerId={user.id} savedCars={savedCars ?? []} /></div>
      </div>
    </main>
  );
}
