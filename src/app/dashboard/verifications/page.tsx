import Link from "next/link";
import { requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { SectionHeading } from "@/components/ui/section-heading";

const statusLabels: Record<string, string> = { pending: "Inspection pending", confirmed: "Confirmed", assigned: "Inspector assigned", inspection_scheduled: "Scheduled", inspection_in_progress: "Inspection in progress", report_submitted: "Report ready", completed: "Inspected by Fengxing", cancelled: "Cancelled" };
const statusColors: Record<string, string> = { pending: "bg-[#FEF3C7] text-[#B45309]", confirmed: "bg-[#DCFCE7] text-[#15803D]", assigned: "bg-[#DBEAFE] text-[#1E40AF]", inspection_scheduled: "bg-[#DBEAFE] text-[#1E40AF]", inspection_in_progress: "bg-[#DBEAFE] text-[#1E40AF]", report_submitted: "bg-[#DBEAFE] text-[#1E40AF]", completed: "bg-[#DCFCE7] text-[#15803D]", cancelled: "bg-[#F3F4F6] text-[#6B7280]" };
const dateLabel = (value: string | null) => value ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)) : "Date to be confirmed";

export default async function VerificationsPage() {
  const user = await requireUser(); const supabase = await createClient();
  const { data: verifications, error } = await supabase.from("verification_requests").select("id,car_id,vehicle_registration,external_make,external_model,status,inspection_type,preferred_date,scheduled_for,created_at").eq("requested_by", user.id).order("created_at", { ascending: false });
  if (error) throw new Error("Unable to load your inspection requests.");
  const carIds = [...new Set((verifications ?? []).map((request) => request.car_id).filter((id): id is string => Boolean(id)))];
  const { data: cars } = carIds.length ? await supabase.from("cars").select("id,year,make,model").in("id", carIds) : { data: [] };
  const carById = new Map((cars ?? []).map((car) => [car.id, car]));
  return <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8"><SectionHeading title="My inspections" link={{ href: "/verification", label: "Request Vehicle Inspection" }} />
    {verifications?.length ? <div className="mt-6 grid gap-4">{verifications.map((request) => { const car = request.car_id ? carById.get(request.car_id) : null; const vehicle = car ? `${car.year} ${car.make} ${car.model}` : `${request.external_make ?? (request.car_id ? "Marketplace vehicle" : "External vehicle")} ${request.external_model ?? ""}`.trim(); return <article key={request.id} className="card-standard p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.1em] text-[#d92d20]">{request.inspection_type === "seller_pre_inspection" ? "Seller pre-inspection" : "Buyer inspection"}</p><h2 className="mt-1 font-h4 text-ink">{vehicle}</h2><p className="mt-1 text-sm text-[#667085]">{request.vehicle_registration} · {dateLabel(request.scheduled_for ?? request.preferred_date)}</p></div><div className="flex flex-wrap items-center gap-3"><span className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-bold ${statusColors[request.status] ?? "bg-[#F3F4F6] text-[#6B7280]"}`}>{statusLabels[request.status] ?? request.status.replaceAll("_", " ")}</span><Link className="btn-tertiary text-sm" href={`/dashboard/verifications/${request.id}`}>View request</Link></div></div></article>; })}</div> : <div className="card-standard p-10 text-center"><h3 className="font-h4 text-ink">No vehicle inspections yet</h3><p className="mt-2 text-[#667085]">Your buyer and seller inspection requests will appear here.</p><Link className="mt-4 inline-block btn-primary" href="/verification">Request Vehicle Inspection</Link></div>}
  </main>;
}
