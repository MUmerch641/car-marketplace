import Image from "next/image";
import Link from "next/link";
import type { CarCardData } from "@/lib/marketplace/cars";
import { Badge } from "@/components/ui/badge";

export function CarCard({ car }: { car: CarCardData }) {
  return (
    <Link href={`/cars/${car.id}`} className="group block overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {car.image ? <Image src={car.image} alt={car.title} fill unoptimized sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw" className="object-cover transition duration-300 group-hover:scale-[1.03]" /> : <div className="grid h-full place-items-center text-sm font-medium text-slate-500">Image coming soon</div>}
        {(car.verified || car.featured) && <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">{car.verified && <Badge className="status-confirmed">Verified</Badge>}{car.featured && <Badge tone="amber" className="status-pending">Featured</Badge>}</div>}
      </div>
      <div className="p-4">
        <h2 className="text-[16px] font-semibold leading-5 text-[#0b1f33]">{car.title}</h2>
        <p className="mt-2 text-xl font-bold tracking-tight text-[#0b1f33]">{car.price}</p>
        <p className="mt-2 text-sm text-slate-600">{car.mileage} <span className="px-1 text-slate-300">·</span> {car.fuel} <span className="px-1 text-slate-300">·</span> {car.transmission}</p>
        <p className="mt-3 border-t border-slate-100 pt-3 text-sm font-medium text-slate-600">{car.city}</p>
      </div>
    </Link>
  );
}
