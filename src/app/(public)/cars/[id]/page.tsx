import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { SellerContact } from "@/components/cars/seller-contact";
import { CarGallery } from "@/components/cars/car-gallery";
import { getCar } from "@/lib/marketplace/cars";
import { getCurrentUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function serviceHistoryLabel(value: string) {
  return { full: "Full service history", part: "Partial service history", none: "No service history" }[value] ?? value;
}

export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [car, user] = await Promise.all([getCar(id), getCurrentUser()]);
  if (!car) notFound();

  const own = user?.id === car.sellerId;
  const destination = `/verification?car=${encodeURIComponent(car.id)}`;
  const inspectionHref = user ? destination : `/login?next=${encodeURIComponent(destination)}`;
  const supabase = await createClient();
  const { data: inspectionState } = await supabase.rpc("get_public_listing_inspection_state", { p_car_id: car.id });
  const { data: inspectionAvailability } = await supabase.rpc("get_public_listing_inspection_availability", { p_car_id: car.id });
  const sellerInspection = inspectionState?.[0] ?? null;
  const inspectionInProgress = inspectionAvailability?.[0]?.has_active_inspection ?? false;
  const { data: ownInspection } = user && own ? await supabase.from("verification_requests").select("id,status").eq("car_id", car.id).eq("requested_by", user.id).eq("inspection_type", "seller_pre_inspection").order("created_at", { ascending: false }).limit(1).maybeSingle() : { data: null };
  const specs = [
    ["Mileage", car.mileage],
    ["Fuel", car.fuel],
    ["Transmission", car.transmission],
    ["Engine size", car.engineSize],
    ["Body type", car.bodyType],
    ["Colour", car.colour],
    ["MOT expiry", car.motExpiry ? dateLabel(car.motExpiry) : null],
    ["Service history", car.serviceHistory ? serviceHistoryLabel(car.serviceHistory) : null],
    ["ULEZ status", car.ulezCompliant === null ? null : car.ulezCompliant ? "Compliant" : "Not compliant"],
    ["Location", [car.city, car.postcode].filter(Boolean).join(", ")],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1.45fr)_360px] lg:items-start">
        <div>
          <CarGallery images={car.images} title={car.title} />
          <section className="mt-7 border-t border-slate-200 pt-6">
            <h2 className="text-xl font-bold text-[#0b1f33]">About this car</h2>
            <p className="mt-3 max-w-3xl whitespace-pre-line text-[15px] leading-7 text-slate-600">{car.description}</p>
          </section>
          {specs.length > 0 && <section className="mt-7 border-t border-slate-200 pt-6"><h2 className="text-xl font-bold text-[#0b1f33]">Vehicle specifications</h2><dl className="mt-4 grid gap-x-8 border-t border-slate-100 sm:grid-cols-2">{specs.map(([label, value]) => <div key={label} className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 text-sm"><dt className="text-slate-500">{label}</dt><dd className="text-right font-semibold text-[#0b1f33]">{value}</dd></div>)}</dl></section>}
        </div>

        <aside className="lg:sticky lg:top-24">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            {(car.verified || car.featured) && <div className="mb-4 flex flex-wrap gap-2">{car.verified && <Badge className="status-confirmed">Inspected by Fengxing</Badge>}{car.featured && <Badge tone="amber" className="status-pending">Featured</Badge>}</div>}
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-[#0b1f33] sm:text-3xl">{car.title}</h1>
            <p className="mt-3 text-3xl font-bold tracking-tight text-[#d92d20]">{car.price}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{car.mileage} <span className="px-1 text-slate-300">·</span> {car.fuel} <span className="px-1 text-slate-300">·</span> {car.transmission}</p>
            <p className="mt-2 text-sm text-slate-600">{car.city}</p>
            {car.verified && car.verifiedAt && <p className="mt-3 text-xs text-slate-500">Inspection completed on {dateLabel(car.verifiedAt)}</p>}
            <div className="mt-5 border-t border-slate-200 pt-5">
              {car.status === "sold" ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
                  <p className="text-xl font-extrabold tracking-tight text-[#0b1f33]">This vehicle has been sold</p>
                  <p className="mt-2 text-sm text-slate-600">The seller has marked this listing as sold and it is no longer available.</p>
                </div>
              ) : (
                <>
                  <SellerContact carId={car.id} />
                  {own ? ownInspection ? <Link href={`/dashboard/verifications/${ownInspection.id}`} className="mt-3 block w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-center text-sm font-semibold text-[#0b1f33] hover:bg-slate-50">{ownInspection.status === "completed" ? "Inspected by Fengxing" : "View inspection request"}</Link> : inspectionInProgress ? <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-900">Inspection in progress</p> : <Link href={destination} className="mt-3 block w-full rounded-md border border-[#d92d20] bg-white px-4 py-3 text-center text-sm font-semibold text-[#d92d20] hover:bg-red-50">Request Fengxing Inspection</Link> : sellerInspection ? <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900"><p className="font-semibold">{sellerInspection.seller_inspection_status === "completed" ? "Inspected by Fengxing" : "Seller inspection in progress"}</p><p className="mt-1 text-emerald-800">{sellerInspection.seller_inspection_status === "completed" ? `Inspection completed by our team${sellerInspection.inspected_at ? ` on ${dateLabel(sellerInspection.inspected_at)}` : ""}.` : "Inspection information will be available after the seller inspection is completed."}</p></div> : inspectionInProgress ? <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900"><p className="font-semibold">Inspection in progress</p><p className="mt-1">An inspection is already in progress for this vehicle.</p></div> : <><p className="mt-4 text-sm font-medium text-slate-700">Inspection not yet completed</p><Link href={inspectionHref} className="mt-3 block w-full rounded-md border border-[#d92d20] bg-white px-4 py-3 text-center text-sm font-semibold text-[#d92d20] hover:bg-red-50">Get this car inspected</Link></>}
                </>
              )}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
