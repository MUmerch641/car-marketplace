import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { visitDateLabel } from "@/lib/services/visit-schedule";
import { VisitTimeline } from "@/components/shaz/visit-timeline";
export type VisitCardData = {
  id: string;
  kind: "service" | "inspection";
  title: string;
  vehicle: string;
  registration?: string | null;
  status: string;
  date: string | null;
  time?: string | null;
  location?: string;
  quote?: number | null;
};
export function VisitCard({
  visit,
  showProgress = false,
}: {
  visit: VisitCardData;
  showProgress?: boolean;
}) {
  const href = `/dashboard/${visit.kind === "inspection" ? "verifications" : "bookings"}/${visit.id}`;
  const badge = ["completed", "report_submitted"].includes(visit.status)
    ? "bg-[#E3F1EB] text-[#276154]"
    : visit.status === "cancelled"
      ? "bg-[#EEE9E1] text-[#526568]"
      : visit.status === "pending"
        ? "bg-[#EEE9E1] text-[#526568]"
        : "bg-[#FFF0EE] text-brand-hover";
  return (
    <article className="rounded-3xl border border-[#E4E7E3] bg-white p-5 sm:p-6">
      <Link
        href={href}
        className="block rounded-xl focus-visible:outline-offset-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#526568]">
              {visit.kind === "inspection"
                ? "Vehicle inspection"
                : "Mobile car care"}
            </p>
            <h2 className="mt-1 text-lg font-bold leading-6 text-ink">
              {visit.title}
            </h2>
            <p className="mt-1 text-sm text-[#526568]">
              {visit.vehicle}
              {visit.registration ? ` · ${visit.registration}` : ""}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize sm:text-xs ${badge}`}
          >
            {visit.status.replaceAll("_", " ")}
          </span>
        </div>
        <p className="mt-4 flex items-start gap-2 text-sm text-[#526568]">
          <CalendarDays size={16} className="mt-0.5 shrink-0" />
          {visit.date
            ? visitDateLabel(visit.date.slice(0, 10))
            : "Date to be confirmed"}
          {visit.time ? ` · ${visit.time.slice(0, 5)} UK time` : ""}
        </p>
        {visit.location && (
          <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-[#526568]">
            <MapPin size={16} className="mt-1 shrink-0" />
            {visit.location}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#E4E7E3] pt-4">
          <span className="text-xs text-[#526568]">
            {visit.kind === "service"
              ? "Quote, payment & visit details"
              : "Request & inspection report"}
          </span>
          <span className="flex items-center gap-1 text-sm font-bold text-brand-hover">
            Open visit
            <ArrowRight size={15} />
          </span>
        </div>
      </Link>
      {showProgress && visit.kind === "service" && (
        <div className="mt-5">
          <VisitTimeline status={visit.status} />
        </div>
      )}
    </article>
  );
}
