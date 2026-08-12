import Image from "next/image";
import Link from "next/link";
import type { CarCardData } from "@/lib/marketplace/cars";
import { Badge } from "@/components/ui/badge";

export function CarCard({ car }: { car: CarCardData }) {
  return (
    <Link
      href={`/cars/${car.id}`}
      className="card-standard group hover:border-[#D0D5DD]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#EAECF0]">
        {car.image ? (
          <Image
            src={car.image}
            alt={car.title}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm font-bold text-[#98A2B3]">
            Image coming soon
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          {car.verified && <Badge className="status-confirmed">Inspected</Badge>}
          {car.featured && <Badge tone="amber" className="status-pending">Featured</Badge>}
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-h3 text-ink">{car.title}</h3>
        <p className="mt-3 font-h1 text-ink">£{car.price}</p>
        <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-sm text-[#667085]">
          <span>{car.mileage}</span>
          <span>•</span>
          <span>{car.fuel}</span>
          <span>•</span>
          <span>{car.transmission}</span>
        </div>
        <p className="mt-3 border-t border-[#EAECF0] pt-3 text-sm font-medium text-[#475467]">
          {car.city}
        </p>
      </div>
    </Link>
  );
}