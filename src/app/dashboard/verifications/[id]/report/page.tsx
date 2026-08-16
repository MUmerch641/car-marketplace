import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck, MapPin } from "lucide-react";
import { requireUser } from "@/lib/auth/server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function CustomerReportPage({ params }: { params: Promise<{ id: string }> }) {
  const u = await requireUser();
  const { id } = await params;
  const adminDb = createAdminClient();

  const { data: v } = await adminDb
    .from("verification_requests")
    .select("*, inspection_reports(*, inspection_report_images(id, storage_path, caption, sort_order, evidence_expires_at))")
    .eq("id", id)
    .maybeSingle();

  if (!v || (v.requested_by !== u.id && v.status !== "completed")) {
    notFound();
  }

  const rawReport = v.inspection_reports;
  const r = (Array.isArray(rawReport) ? rawReport[0] : rawReport) as Record<string, any> | null;

  if (!r) notFound();

  const imgs = (r.inspection_report_images ?? []) as Record<string, any>[];
  const { data: urls } = imgs.length
    ? await adminDb.storage.from("inspection-images").createSignedUrls(
        imgs.map((x) => x.storage_path),
        600
      )
    : { data: [] };

  const gallery: { id: string; caption: string | null; url: string | null }[] = imgs.map((x, i) => ({
    id: String(x.id ?? i),
    caption: (x.caption as string | null) ?? null,
    url: urls?.[i]?.signedUrl ?? null,
  }));
  const expiry = imgs[0]?.evidence_expires_at;

  return (
    <main className="mx-auto max-w-4xl px-5 py-10 space-y-6">
      <div>
        <Link
          href={`/dashboard/verifications/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 transition-colors hover:text-[#0b1f33]"
        >
          <ArrowLeft size={14} />
          <span>Back to Inspection Timeline</span>
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#0b1f33] px-2.5 py-0.5 text-xs font-bold text-white uppercase">
                {v.inspection_type === "seller_pre_inspection" ? "Seller Pre-Inspection" : "Buyer Inspection"}
              </span>
              <span className="rounded-md bg-amber-400 px-2 py-0.5 font-mono text-xs font-extrabold text-black">
                {v.vehicle_registration}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-[#0b1f33]">
              {v.external_make || "Vehicle"} {v.external_model || ""} · {v.city}
            </h1>
          </div>

          <div className="text-right">
            <ResultBadge result={r.overall_result} />
            <p className="mt-1 text-[11px] font-medium text-slate-400">
              Completed {v.completed_at ? new Date(v.completed_at).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB")}
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Executive Summary</span>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800 leading-relaxed font-medium">
            {r.summary || "No summary recorded."}
          </div>
        </div>

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
      </div>

      {gallery.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-[#0b1f33]">Inspection Evidence Photos ({gallery.length})</h2>
          {expiry && (
            <p className="text-xs text-slate-500">
              Inspection photos are available until {new Date(expiry).toLocaleDateString("en-GB")}.
            </p>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery.map(
              (x) =>
                x.url && (
                  <div key={x.id} className="relative aspect-4/3 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                    <Image src={x.url} alt={x.caption || "Inspection photo"} fill unoptimized className="object-cover" />
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
