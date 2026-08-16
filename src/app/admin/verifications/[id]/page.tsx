import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck, MapPin, User, Phone, FileText, Check } from "lucide-react";
import { requireRole } from "@/lib/auth/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verificationAdmin } from "@/app/verification-actions";
import { adminButton, adminSecondaryButton } from "@/components/admin/admin-ui";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function AdminReportReviewPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("admin");
  const { id } = await params;
  const adminDb = createAdminClient();

  const { data: v, error: vErr } = await adminDb
    .from("verification_requests")
    .select("*, inspection_reports(*, inspection_report_images(id, storage_path, caption, sort_order)), employee_assignments(employee_id, status)")
    .eq("id", id)
    .maybeSingle();

  if (vErr) {
    console.error("Error fetching verification request for admin review:", vErr);
  }

  if (!v) notFound();

  const activeAssignment = (v.employee_assignments || []).find((a: any) => a.status !== "cancelled");
  let inspectorName = "Assigned Inspector";

  if (activeAssignment?.employee_id) {
    const { data: inspectorProfile } = await adminDb
      .from("profiles")
      .select("full_name")
      .eq("id", activeAssignment.employee_id)
      .maybeSingle();

    if (inspectorProfile?.full_name) {
      inspectorName = inspectorProfile.full_name;
    }
  }

  const r = (Array.isArray(v.inspection_reports) ? v.inspection_reports[0] : v.inspection_reports) as Record<string, any> | null;
  const imgs = (r?.inspection_report_images ?? []) as Record<string, any>[];

  const { data: urls } = imgs.length
    ? await adminDb.storage.from("inspection-images").createSignedUrls(
        imgs.map((x) => x.storage_path),
        600
      )
    : { data: [] };

  return (
    <main className="mx-auto max-w-5xl p-5 sm:p-8 space-y-6">
      {/* Back link */}
      <div>
        <Link
          href="/admin/verifications"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 transition-colors hover:text-[#0b1f33]"
        >
          <ArrowLeft size={14} />
          <span>Back to Verification Requests</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-extrabold text-blue-900 uppercase">
              {v.inspection_type === "seller_pre_inspection" ? "Seller Pre-Inspection" : "Buyer Inspection"}
            </span>
            <span className="rounded-md bg-amber-400 px-2 py-0.5 font-mono text-xs font-extrabold text-black">
              {v.vehicle_registration}
            </span>
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                v.status === "completed" ? "bg-emerald-100 text-emerald-900" : "bg-[#0b1f33] text-white"
              }`}
            >
              {v.status.replace(/_/g, " ").toUpperCase()}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-[#0b1f33]">
            {v.external_make || "Vehicle"} {v.external_model || ""} · {v.city}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Inspector: <strong className="text-slate-800">{inspectorName}</strong>
          </p>
        </div>

        {v.status === "report_submitted" && (
          <form
            action={async () => {
              "use server";
              await verificationAdmin(id, "finalise");
            }}
          >
            <SubmitButton variant="dark" loadingText="Finalising & Publishing...">
              <Check size={16} className="mr-2" />
              Finalise & Publish Report
            </SubmitButton>
          </form>
        )}
      </div>

      {/* Report Summary & Ratings Card */}
      {r ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-[#0b1f33]">Submitted Report Findings</h2>
            <ResultBadge result={r.overall_result} />
          </div>

          {/* Executive Summary */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inspector Executive Summary</span>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800 leading-relaxed font-medium">
              {r.summary || "No summary recorded."}
            </div>
          </div>

          {/* Component Ratings */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Component Condition Ratings</span>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Bodywork & Frame", val: r.body_condition },
                { label: "Tyres & Wheels", val: r.tyre_condition },
                { label: "Interior & Cabin", val: r.interior_condition },
                { label: "Engine & Drivetrain", val: r.engine_condition },
                { label: "Brakes & Suspension", val: r.brakes_condition },
              ].map((c) => (
                <div key={c.label} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs">
                  <span className="font-semibold text-slate-700">{c.label}</span>
                  <RatingBadge rating={c.val} />
                </div>
              ))}
            </div>
          </div>

          {/* Verifications Checklist */}
          <div className="flex flex-wrap items-center gap-6 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <CheckCircle2 size={16} className={r.mileage_checked ? "text-emerald-600" : "text-slate-300"} />
              <span>Odometer Mileage Verified</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <CheckCircle2 size={16} className={r.registration_checked ? "text-emerald-600" : "text-slate-300"} />
              <span>VIN & Registration Plate Verified</span>
            </div>
          </div>

          {/* Inspector Internal Notes */}
          {r.inspector_notes && (
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Internal Staff Notes</span>
              <p className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-950">{r.inspector_notes}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
          No inspection report has been submitted yet for this request.
        </div>
      )}

      {/* Attached Evidence Photos */}
      {imgs.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-[#0b1f33]">Inspection Evidence Photos ({imgs.length})</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {imgs.map(
              (x, i) =>
                urls?.[i]?.signedUrl && (
                  <div key={x.id} className="relative aspect-4/3 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    <Image src={urls[i].signedUrl} alt={x.caption || "Evidence photo"} fill unoptimized className="object-cover" />
                    {x.caption && (
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1.5 text-[10px] font-semibold text-white truncate">
                        {x.caption}
                      </div>
                    )}
                  </div>
                )
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function ResultBadge({ result }: { result: string | null }) {
  let style = "bg-slate-100 text-slate-700";
  let label = result ? result.replace(/_/g, " ").toUpperCase() : "NOT SPECIFIED";

  if (result === "passed") style = "bg-emerald-100 text-emerald-900 border-emerald-300";
  if (result === "passed_with_advisories") style = "bg-amber-100 text-amber-900 border-amber-300";
  if (result === "attention_required" || result === "not_suitable") style = "bg-red-100 text-red-900 border-red-300";

  return <span className={`rounded-xl border px-3 py-1 text-xs font-bold ${style}`}>{label}</span>;
}

function RatingBadge({ rating }: { rating: string | null }) {
  let style = "bg-slate-100 text-slate-600";
  const r = (rating || "").toLowerCase();

  if (r === "excellent") style = "bg-emerald-100 text-emerald-900";
  if (r === "good") style = "bg-blue-100 text-blue-900";
  if (r === "fair") style = "bg-amber-100 text-amber-900";
  if (r === "poor") style = "bg-red-100 text-red-900";

  return <span className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${style}`}>{rating || "N/A"}</span>;
}
