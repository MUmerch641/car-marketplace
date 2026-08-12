import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { SellerContact } from "@/components/cars/seller-contact";
import { getCar } from "@/lib/marketplace/cars";
import { getCurrentUser } from "@/lib/auth/server";

export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [car, user] = await Promise.all([getCar(id), getCurrentUser()]);
  if (!car) notFound();
  const own = user?.id === car.sellerId;
  const dest = `/verification?car=${encodeURIComponent(car.id)}`;
  const href = user ? dest : `/login?next=${encodeURIComponent(dest)}`;

  return (
    <main className="mx-auto max-w-7xl px-5 py-9 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        {/* Image gallery */}
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            {car.images.map((image, i) => (
              <div key={image} className={`relative aspect-[4/3] ${i === 0 ? "sm:col-span-2" : ""}`}>
                <Image
                  src={image}
                  alt={car.title}
                  fill
                  unoptimized
                  priority={i === 0}
                  className="object-cover rounded-xl"
                />
              </div>
            ))}
          </div>
          {/* Vehicle details section */}
          <div className="mt-8 rounded-xl border border-[#E4E7EC] bg-white p-6">
            <h2 className="font-h2 text-ink">About this car</h2>
            <p className="mt-3 text-[#667085] font-body">{car.description}</p>
          </div>
        </div>

        {/* Sidebar - Vehicle info and actions */}
        <aside className="sticky top-24 h-fit space-y-4">
          {/* Status badges */}
          <div className="flex flex-wrap gap-2">
            {car.verified && <Badge className="status-confirmed">Inspected</Badge>}
            {car.featured && <Badge tone="amber" className="status-pending">Featured</Badge>}
          </div>

          {/* Price and key info */}
          <div className="rounded-xl border border-[#E4E7EC] bg-white p-6 shadow-sm">
            <h1 className="font-h2 text-ink">{car.title}</h1>
            <p className="mt-3 font-h1 text-brand">£{car.price}</p>
            <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[#667085]">
              <span>{car.mileage}</span>
              <span>•</span>
              <span>{car.transmission}</span>
              <span>•</span>
              <span>{car.fuel}</span>
            </div>
            {car.verified && car.verifiedAt && (
              <p className="mt-3 text-sm text-[#667085]">
                Inspected on {new Date(car.verifiedAt).toLocaleDateString("en-GB")}
              </p>
            )}
          </div>

          {/* Primary action */}
          <div className="rounded-xl border border-[#E4E7EC] bg-white p-6 shadow-sm">
            <SellerContact carId={car.id} />
            {!own && (
              <Link
                href={href}
                className="mt-4 block w-full rounded-md border border-brand bg-white px-4 py-3 text-center font-bold text-brand hover:bg-[#FFF5F4]"
              >
                {car.verified ? "Request a new inspection" : "Request Vehicle Inspection"}
              </Link>
            )}
          </div>

          {/* Additional specs */}
          <div className="rounded-xl border border-[#E4E7EC] bg-white p-6 shadow-sm">
            <h3 className="font-h4 text-ink">Key specifications</h3>
            <dl className="mt-4 grid gap-3">
              <div className="flex justify-between text-sm">
                <dt className="text-[#667085]">Year</dt>
                <dd className="font-semibold text-ink">{car.year}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-[#667085]">Body type</dt>
                <dd className="font-semibold text-ink">{car.bodyType || "Not specified"}</dd>
              </div>
              {car.engineSize && (
                <div className="flex justify-between text-sm">
                  <dt className="text-[#667085]">Engine</dt>
                  <dd className="font-semibold text-ink">{car.engineSize}L</dd>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <dt className="text-[#667085]">Registration</dt>
                <dd className="font-semibold text-ink">{car.registration || "Not specified"}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </main>
  );
}
