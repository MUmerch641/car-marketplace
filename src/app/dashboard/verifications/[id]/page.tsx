import Image from "next/image";
import Link from "next/link";
import { Check, Circle, FileText } from "lucide-react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { CancelInspectionRequest } from "@/components/verification/cancel-request";

const labels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  assigned: "Inspector assigned",
  inspection_scheduled: "Scheduled",
  inspection_in_progress: "In progress",
  report_submitted: "Report ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

const stages = ["Request received", "Appointment confirmation", "Inspector assigned", "Inspection", "Report ready"];
const stageFor: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  assigned: 2,
  inspection_scheduled: 3,
  inspection_in_progress: 3,
  report_submitted: 4,
  completed: 4,
};

const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value))
    : "To be confirmed";
const time = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: true }).format(
        new Date(`1970-01-01T${value}`)
      )
    : "To be confirmed";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const supabase = await createClient();

  const { data: request } = await supabase
    .from("verification_requests")
    .select("*,inspection_reports(id)")
    .eq("id", id)
    .maybeSingle();

  if (!request || request.requested_by !== user.id) notFound();

  const { data: car } = request.car_id
    ? await supabase
        .from("cars")
        .select("id,year,make,model,variant,registration,mileage,fuel_type,transmission,city,postcode,car_images(storage_path,is_primary)")
        .eq("id", request.car_id)
        .maybeSingle()
    : { data: null };

  const primary = car?.car_images?.find((image) => image.is_primary)?.storage_path ?? car?.car_images?.[0]?.storage_path;
  const { data: signed } = primary
    ? await supabase.storage.from("car-images").createSignedUrl(primary, 600)
    : { data: null };

  const currentStage = stageFor[request.status] ?? -1;
  const requestedAppointment = request.scheduled_for
    ? {
        date: date(request.scheduled_for),
        time: new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: true }).format(
          new Date(request.scheduled_for)
        ),
      }
    : { date: date(request.preferred_date), time: time(request.preferred_time) };

  const message =
    request.status === "pending"
      ? ["We've received your inspection request.", "Fengxing will review the requested time and confirm the appointment."]
      : request.status === "confirmed"
      ? ["Your inspection request has been confirmed.", "We will assign an inspector and confirm the visit details shortly."]
      : request.status === "assigned"
      ? ["An inspector has been assigned.", "We will confirm the appointment time once the visit is scheduled."]
      : request.status === "inspection_in_progress"
      ? ["Inspection in progress", "The inspector is completing the vehicle assessment and report."]
      : request.status === "completed" || request.status === "report_submitted"
      ? ["Inspection completed", "Your official vehicle inspection report is ready to view."]
      : [labels[request.status] ?? "Inspection update", "We will keep this request updated as it progresses."];

  const hasReport =
    request.status === "completed" ||
    request.status === "report_submitted" ||
    (Array.isArray(request.inspection_reports) ? request.inspection_reports.length > 0 : Boolean(request.inspection_reports));

  return (
    <main className="bg-[#f7f8fa] py-7 sm:py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-6">
          <div>
            <p className="text-sm font-medium text-slate-500">Vehicle inspection</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#0b1f33]">Vehicle inspection</h1>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
            {labels[request.status] ?? request.status}
          </span>
        </header>

        <section className="mt-6 border border-slate-200 bg-white p-5 sm:p-6 rounded-2xl shadow-sm">
          <p className="text-sm font-semibold text-[#0b1f33]">
            {request.inspection_type === "seller_pre_inspection" ? "Seller pre-inspection" : "Buyer inspection"}
          </p>
          <h2 className="mt-3 text-xl font-bold text-[#0b1f33]">{message[0]}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{message[1]}</p>

          {hasReport && (
            <div className="mt-5">
              <Link
                className="inline-flex items-center gap-2 rounded-xl bg-[#d92d20] px-5 py-3 text-xs font-bold text-white shadow-md transition-transform hover:scale-[1.02] hover:bg-red-700"
                href={`/dashboard/verifications/${id}/report`}
              >
                <FileText size={16} />
                <span>View Inspection Report</span>
              </Link>
            </div>
          )}
        </section>

        <section className="mt-6 border border-slate-200 bg-white p-5 sm:p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold text-[#0b1f33]">Vehicle</h2>
          {car ? (
            <div className="mt-4 flex flex-col gap-4 sm:flex-row">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-100 sm:h-24 sm:w-36 sm:shrink-0">
                {signed?.signedUrl && <Image src={signed.signedUrl} alt="Vehicle" fill unoptimized className="object-cover" />}
              </div>
              <div>
                <p className="font-semibold text-[#0b1f33]">
                  {car.year} {car.make} {car.model}
                  {car.variant ? ` ${car.variant}` : ""}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {car.registration || request.vehicle_registration} · {car.mileage.toLocaleString("en-GB")} miles ·{" "}
                  {car.fuel_type.replaceAll("_", " ")} · {car.transmission.replaceAll("_", " ")}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {car.city}, {car.postcode}
                </p>
                <Link href={`/cars/${car.id}`} className="mt-3 inline-block text-sm font-semibold text-[#d92d20]">
                  View listing
                </Link>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-600">External vehicle · {request.vehicle_registration}</p>
          )}
        </section>

        <section className="mt-6 border border-slate-200 bg-white p-5 sm:p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold text-[#0b1f33]">Inspection progress</h2>
          <ol className="mt-5 space-y-4">
            {stages.map((stage, index) => (
              <li key={stage} className="flex items-center gap-3 text-sm">
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full ${
                    index <= currentStage ? "bg-emerald-600 text-white" : "border border-slate-300 text-slate-400"
                  }`}
                >
                  {index < currentStage || (index === currentStage && (request.status === "completed" || request.status === "report_submitted")) ? (
                    <Check size={15} />
                  ) : index === currentStage ? (
                    <span className="h-2 w-2 rounded-full bg-current" />
                  ) : (
                    <Circle size={12} />
                  )}
                </span>
                <span
                  className={
                    index === currentStage
                      ? "font-semibold text-[#0b1f33]"
                      : index < currentStage
                      ? "text-slate-700"
                      : "text-slate-400"
                  }
                >
                  {stage}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-6 border border-slate-200 bg-white p-5 sm:p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold text-[#0b1f33]">
            {request.scheduled_for ? "Inspection appointment" : "Appointment request"}
          </h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-slate-500">{request.scheduled_for ? "Inspection date" : "Preferred date"}</dt>
              <dd className="mt-1 font-semibold text-[#0b1f33]">{requestedAppointment.date}</dd>
            </div>
            <div>
              <dt className="text-slate-500">{request.scheduled_for ? "Time" : "Preferred time"}</dt>
              <dd className="mt-1 font-semibold text-[#0b1f33]">{requestedAppointment.time}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Location</dt>
              <dd className="mt-1 font-semibold text-[#0b1f33]">
                {request.inspection_address}, {request.city}, {request.postcode}
              </dd>
            </div>
          </dl>
          {["pending", "confirmed"].includes(request.status) && <CancelInspectionRequest id={id} />}
        </section>
      </div>
    </main>
  );
}
