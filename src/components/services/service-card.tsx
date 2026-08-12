import Link from "next/link";
import type { PublicService } from "@/lib/services/services";
export function ServiceCard({ service }: { service: PublicService }) {
  const duration = service.estimatedDurationMinutes ? `${service.estimatedDurationMinutes} mins` : "Mobile visit";
  return (
    <Link href={`/services/${service.slug}`} className="card-standard group">
      <div className="border-b border-[#E4E7EC] bg-ink px-4 py-5">
        <p className="text-sm font-bold uppercase tracking-[.12em] text-[#F97066]">Mobile service</p>
        <p className="mt-3 font-h2 text-white">From £{service.basePrice.toLocaleString("en-GB")}</p>
      </div>
      <div className="p-6">
        <h3 className="font-h3 text-ink">{service.name}</h3>
        <p className="mt-3 text-[#667085] font-body-sm line-clamp-3">
          {service.shortDescription ?? service.description}
        </p>
        <div className="mt-4 border-t border-[#EAECF0] pt-3 text-sm font-semibold text-[#667085]">
          Estimated: {duration}
        </div>
      </div>
    </Link>
  );
}
