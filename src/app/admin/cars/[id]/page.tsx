import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { moderateCarAction } from "@/app/marketplace-actions";
import { AdminCarControls } from "../admin-car-controls";
import { AdminPageHeader, AdminStatus } from "@/components/admin/admin-ui";

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminCarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("admin");
  const { id } = await params;
  const supabase = await createClient();

  const { data: car } = await supabase
    .from("cars")
    .select("*, profiles!cars_seller_id_fkey(full_name, phone), car_images(storage_path, sort_order, is_primary)")
    .eq("id", id)
    .maybeSingle();

  if (!car) notFound();

  const images = await Promise.all(
    (car.car_images ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(async (img) => {
        const { data } = await supabase.storage.from("car-images").createSignedUrl(img.storage_path, 600);
        return data?.signedUrl;
      })
  );

  const validImages = images.filter((url): url is string => Boolean(url));
  const sellerName = car.profiles?.full_name || "Unknown Seller";
  const sellerPhone = car.profiles?.phone || "No phone provided";

  return (
    <main className="mx-auto max-w-[1440px] p-5 sm:p-8">
      <AdminPageHeader
        title={`${car.year} ${car.make} ${car.model}`}
        description="Internal listing inspection and moderation view."
        action={
          <Link href={`/cars/${car.id}`} target="_blank" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-[#0b1f33] hover:bg-slate-50">
            View public page ↗
          </Link>
        }
      />

      <div className="mt-7 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          {/* Images */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-[#0b1f33]">Uploaded Media</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {validImages.length > 0 ? (
                validImages.map((url, i) => (
                  <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
                    <Image src={url} alt={`Car photo ${i + 1}`} fill className="object-cover" unoptimized />
                  </div>
                ))
              ) : (
                <div className="col-span-full rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No images uploaded
                </div>
              )}
            </div>
          </section>

          {/* Details */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-[#0b1f33]">Listing Information</h2>
            <div className="mt-4 grid gap-y-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Price</p>
                <p className="mt-1 font-semibold text-[#0b1f33]">£{Number(car.price).toLocaleString("en-GB")}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Location</p>
                <p className="mt-1 font-semibold text-[#0b1f33]">{car.city}, {car.postcode}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Mileage</p>
                <p className="mt-1 font-semibold text-[#0b1f33]">{Number(car.mileage).toLocaleString("en-GB")} miles</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Transmission</p>
                <p className="mt-1 font-semibold text-[#0b1f33] capitalize">{car.transmission}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Fuel type</p>
                <p className="mt-1 font-semibold text-[#0b1f33] capitalize">{car.fuel_type}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Engine Size</p>
                <p className="mt-1 font-semibold text-[#0b1f33]">{car.engine_size ? `${car.engine_size}L` : "Unknown"}</p>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Description</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#0b1f33]">{car.description}</p>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {/* Status & Moderation */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#0b1f33]">Status</h2>
              <AdminStatus tone={car.status === "active" ? "green" : car.status === "pending_review" ? "amber" : car.status === "rejected" ? "red" : "slate"}>
                {car.status.replace("_", " ")}
              </AdminStatus>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span>Created:</span>
                <span className="font-semibold text-[#0b1f33]">{dateLabel(car.created_at)}</span>
              </div>
              {car.published_at && (
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span>Published:</span>
                  <span className="font-semibold text-[#0b1f33]">{dateLabel(car.published_at)}</span>
                </div>
              )}
            </div>

            <div className="mt-6">
              {car.status === "pending_review" ? (
                <div className="space-y-3">
                  <form action={async () => { "use server"; await moderateCarAction(car.id, true); }}>
                    <button className="w-full rounded-xl bg-[#039855] px-4 py-3 text-sm font-bold text-white transition-all hover:bg-[#027A48]">
                      Approve Listing
                    </button>
                  </form>
                  <form action={async (form: FormData) => { "use server"; await moderateCarAction(car.id, false, String(form.get("reason") ?? "")); }} className="space-y-2">
                    <input name="reason" required placeholder="Rejection reason..." className="w-full rounded-xl border border-[#E4E7EC] bg-[#FAFAFA] px-4 py-3 text-sm font-semibold outline-none focus:border-[#D92D20] focus:ring-4 focus:ring-red-50" />
                    <button className="w-full rounded-xl border border-[#D92D20] px-4 py-3 text-sm font-bold text-[#D92D20] transition-all hover:bg-red-50">
                      Reject Listing
                    </button>
                  </form>
                </div>
              ) : (
                <AdminCarControls carId={car.id} isFeatured={!!car.is_featured} isVerified={!!car.is_verified} />
              )}
            </div>
          </section>

          {/* Seller Details */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-[#0b1f33]">Seller Info</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Name</p>
                <p className="mt-1 font-semibold text-[#0b1f33]">{sellerName}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Phone</p>
                <p className="mt-1 font-semibold text-[#0b1f33]">{sellerPhone}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Seller ID</p>
                <p className="mt-1 font-mono text-xs text-slate-500">{car.seller_id}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
