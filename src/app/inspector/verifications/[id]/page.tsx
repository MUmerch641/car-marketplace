import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck, MapPin, User, Phone, FileText } from "lucide-react";
import { requireRole } from "@/lib/auth/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { saveReport } from "@/app/verification-actions";
import { EvidenceManager } from "@/components/verification/evidence-manager";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function InspectionReportPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("inspector");
  const { id } = await params;
  const adminDb = createAdminClient();

  const { data: v } = await adminDb
    .from("verification_requests")
    .select("*,inspection_reports(*,inspection_report_images(id,storage_path,caption,sort_order))")
    .eq("id", id)
    .maybeSingle();

  if (!v) notFound();

  const r = (Array.isArray(v.inspection_reports) ? v.inspection_reports[0] : v.inspection_reports) as Record<string, any> | null;
  const editable = v.status === "inspection_in_progress";
  const imgs = (r?.inspection_report_images ?? []) as Record<string, any>[];

  const { data: urls } = imgs.length
    ? await adminDb.storage.from("inspection-images").createSignedUrls(
        imgs.map((x) => x.storage_path),
        600
      )
    : { data: [] };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Back Link */}
      <div>
        <Link
          href="/inspector"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 transition-colors hover:text-[#0b1f33]"
        >
          <ArrowLeft size={14} />
          <span>Back to Field Workspace</span>
        </Link>
      </div>

      {/* Header Info Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-extrabold text-blue-900 uppercase">
              {v.inspection_type === "seller_pre_inspection" ? "Seller Pre-Inspection" : "Buyer Inspection"}
            </span>
            <span className="rounded-md bg-amber-400 px-2 py-0.5 font-mono text-xs font-extrabold text-black">
              {v.vehicle_registration}
            </span>
          </div>

          <span
            className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
              editable ? "bg-purple-100 text-purple-900" : "bg-emerald-100 text-emerald-900"
            }`}
          >
            {editable ? "Inspection In Progress" : "Report Submitted / Scheduled"}
          </span>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 text-xs">
          <div className="space-y-1">
            <span className="flex items-center gap-1 font-bold text-slate-400 uppercase text-[10px]">
              <MapPin size={12} /> Inspection Location
            </span>
            <p className="font-bold text-[#0b1f33] text-sm">{v.inspection_address}, {v.city}</p>
            <p className="text-slate-500 font-mono">{v.postcode}</p>
          </div>

          <div className="space-y-1">
            <span className="flex items-center gap-1 font-bold text-slate-400 uppercase text-[10px]">
              <User size={12} /> Seller / Contact Person
            </span>
            <p className="font-bold text-[#0b1f33] text-sm">{v.seller_name}</p>
            <a href={`tel:${v.seller_phone}`} className="inline-flex items-center gap-1 font-semibold text-[#d92d20] hover:underline">
              <Phone size={12} /> {v.seller_phone}
            </a>
          </div>
        </div>
      </div>

      {/* Form / Report Content */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#0b1f33]">Inspection Checklist & Summary</h2>
        <p className="mt-0.5 text-xs text-slate-500">Record component ratings and overall findings.</p>

        {editable ? (
          <ReportForm id={id} report={r as any} />
        ) : (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
            <p className="font-bold text-slate-900">Report Status: {v.status.replace(/_/g, " ").toUpperCase()}</p>
            <p className="mt-1 text-slate-600">
              {v.status === "inspection_scheduled" || v.status === "assigned"
                ? "Click 'Start Inspection' on the field workspace to begin entering report details."
                : "The report and evidence images have been submitted and cannot be modified further."}
            </p>
            {r?.summary && (
              <div className="mt-3 rounded-lg bg-white p-3 border border-slate-200">
                <span className="font-bold text-slate-900">Summary:</span>
                <p className="mt-1 text-slate-700">{r.summary}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Evidence */}
      {imgs.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#0b1f33]">Attached Evidence Photos ({imgs.length})</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {imgs.map(
              (x, i) =>
                urls?.[i]?.signedUrl && (
                  <div key={x.id} className="relative aspect-4/3 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    <Image src={urls[i].signedUrl} alt={x.caption || "Inspection evidence"} fill unoptimized className="object-cover" />
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
    </div>
  );
}

function ReportForm({
  id,
  report,
}: {
  id: string;
  report: {
    id: string;
    summary: string | null;
    inspection_report_images: { id: string; storage_path: string; caption: string | null; sort_order: number }[];
  } | null;
}) {
  const options = ["excellent", "good", "fair", "poor", "not_checked"];

  return (
    <div className="mt-6 space-y-6">
      <form
        action={async (f) => {
          "use server";
          await saveReport(id, f);
        }}
        className="space-y-5 text-xs"
      >
        <div className="space-y-1.5">
          <label className="font-bold text-slate-800">Overall Inspection Outcome</label>
          <select
            name="result"
            defaultValue="passed"
            className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-[#0b1f33]"
          >
            {[
              { val: "passed", label: "Passed (Clean)" },
              { val: "passed_with_advisories", label: "Passed with Advisories" },
              { val: "attention_required", label: "Attention Required" },
              { val: "not_suitable", label: "Not Suitable / Reject" },
            ].map((x) => (
              <option key={x.val} value={x.val}>
                {x.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-slate-800">Executive Summary (min 20 chars)</label>
          <textarea
            name="summary"
            defaultValue={report?.summary ?? ""}
            minLength={20}
            required
            rows={3}
            placeholder="Describe overall condition, engine operation, transmission feel, bodywork condition..."
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 outline-none focus:border-[#0b1f33]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-slate-800">Internal Inspection Notes</label>
          <textarea
            name="notes"
            rows={2}
            placeholder="Private notes for staff..."
            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 outline-none focus:border-[#0b1f33]"
          />
        </div>

        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="font-bold text-slate-900">Component Ratings</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { key: "body", label: "Bodywork & Frame" },
              { key: "tyres", label: "Tyres & Brakes" },
              { key: "interior", label: "Interior & Cabin" },
              { key: "engine", label: "Engine & Drivetrain" },
              { key: "brakes", label: "Brakes & Suspension" },
            ].map((comp) => (
              <div key={comp.key} className="space-y-1">
                <label className="font-semibold text-slate-700">{comp.label}</label>
                <select
                  name={comp.key}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs font-semibold outline-none"
                >
                  {options.map((x) => (
                    <option key={x} value={x}>
                      {x.replace("_", " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
            <label className="flex items-center gap-2 font-semibold text-slate-800">
              <input type="checkbox" name="mileage" defaultChecked className="h-4 w-4 rounded border-slate-300 text-[#0b1f33]" />
              <span>Verified Odometer Mileage</span>
            </label>
            <label className="flex items-center gap-2 font-semibold text-slate-800">
              <input type="checkbox" name="registrationChecked" defaultChecked className="h-4 w-4 rounded border-slate-300 text-[#0b1f33]" />
              <span>Verified VIN & Plate Registration</span>
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <SubmitButton variant="outline" loadingText="Saving draft...">
            Save Draft
          </SubmitButton>
          <SubmitButton name="submit" value="yes" variant="primary" loadingText="Submitting final report...">
            Submit Final Report
          </SubmitButton>
        </div>
      </form>

      {report && <EvidenceManager requestId={id} reportId={report.id} images={report.inspection_report_images} />}
    </div>
  );
}
