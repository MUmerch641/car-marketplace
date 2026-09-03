"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole, requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

type ActionState = { error?: string };
const postcode = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;
const activeStatuses = ["pending", "confirmed", "assigned", "inspection_scheduled", "inspection_in_progress", "report_submitted"] as const;
const field = (form: FormData, name: string) => String(form.get(name) ?? "").trim();

export async function createVerificationAction(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const date = field(form, "date");
  const carId = field(form, "carId");
  if (!postcode.test(field(form, "postcode")) || !date || date < new Date().toISOString().slice(0, 10)) return { error: "Enter a valid UK postcode and a future preferred date." };

  const supabase = await createClient();
  let inspectionType: "seller_pre_inspection" | "buyer_inspection" = "buyer_inspection";

  if (carId) {
    const { data: car } = await supabase.from("cars").select("id,seller_id").eq("id", carId).eq("status", "active").maybeSingle();
    if (!car) return { error: "This marketplace listing is no longer available for inspection." };
    inspectionType = car.seller_id === user.id ? "seller_pre_inspection" : "buyer_inspection";

    const { data: existing } = await supabase
      .from("verification_requests")
      .select("id,inspection_type,status,requested_by")
      .eq("car_id", carId)
      .in("status", [...activeStatuses, "completed"]);

    if (existing?.some((request) => activeStatuses.includes(request.status as typeof activeStatuses[number]))) {
      return { error: "An inspection is already in progress for this vehicle." };
    }

    if (inspectionType === "seller_pre_inspection" && existing?.some((request) => request.inspection_type === "seller_pre_inspection")) {
      return { error: "This listing already has a Shaz inspection request. Open it from your listings to check its progress." };
    }
    if (inspectionType === "buyer_inspection" && existing?.some((request) => request.inspection_type === "seller_pre_inspection")) {
      return { error: "This listing already has a seller inspection in progress or completed. Use the inspection information on the listing." };
    }
    const ownBuyerRequest = existing?.find((request) => request.inspection_type === "buyer_inspection" && request.requested_by === user.id && request.status !== "completed");
    if (ownBuyerRequest) redirect(`/dashboard/verifications/${ownBuyerRequest.id}`);
  } else if (!field(form, "registration") || !field(form, "make") || !field(form, "model") || !field(form, "sellerName") || !field(form, "sellerPhone")) {
    return { error: "Complete the vehicle and seller contact details." };
  }

  const { data, error } = await supabase.rpc("create_verification_request", {
    p_car_id: (carId || null) as never,
    p_registration: field(form, "registration"),
    p_make: field(form, "make"),
    p_model: field(form, "model"),
    p_year: (field(form, "year") ? Number(field(form, "year")) : null) as never,
    p_seller_name: field(form, "sellerName"),
    p_seller_phone: field(form, "sellerPhone"),
    p_address: field(form, "address"),
    p_city: field(form, "city"),
    p_postcode: field(form, "postcode"),
    p_preferred_date: date,
    p_preferred_time: field(form, "time"),
    p_inspection_type: inspectionType,
    p_notes: field(form, "notes") || undefined,
  });
  if (error || !data) return { error: "We could not submit this inspection request. Check the details and try again." };
  revalidatePath(`/cars/${carId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/verifications");
  redirect(`/dashboard/verifications/${data}`);
}

export async function cancelVerificationRequest(id: string): Promise<ActionState> {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_own_verification_request", { p_id: id });
  if (error) return { error: "This inspection request can no longer be cancelled." };
  revalidatePath(`/dashboard/verifications/${id}`);
  revalidatePath("/dashboard/verifications");
  return {};
}

import {
  sendInspectorAssignedNotification,
  sendInspectionScheduledNotification,
  sendReportReadyNotification,
} from "@/lib/email";

export async function verificationAdmin(id: string, action: "confirm" | "finalise") {
  await requireRole("admin");
  const s = await createClient();
  const r = action === "confirm"
    ? await s.rpc("confirm_verification_request", { p_id: id })
    : await s.rpc("finalise_verification", { p_id: id });

  if (r.error) return { error: "Unable to update this request." };

  if (action === "finalise") {
    // Send report ready notification to customer
    const { data: request } = await s
      .from("verification_requests")
      .select("requested_by, vehicle_registration, external_make, external_model, inspection_reports(overall_result, summary)")
      .eq("id", id)
      .maybeSingle();

    if (request?.requested_by) {
      const rep = Array.isArray(request.inspection_reports) ? request.inspection_reports[0] : (request.inspection_reports as any);
      sendReportReadyNotification({
        customerId: request.requested_by,
        requestId: id,
        vehicleRegistration: request.vehicle_registration,
        vehicleMakeModel: `${request.external_make || "Vehicle"} ${request.external_model || ""}`.trim(),
        overallResult: rep?.overall_result || "passed",
        summaryPreview: rep?.summary || undefined,
      }).catch((err) => console.error("Report ready email error:", err));
    }
  }

  revalidatePath("/admin/verifications");
  revalidatePath("/cars");
}

export async function assignVerification(id: string, form: FormData) {
  await requireRole("admin");
  const s = await createClient();
  const inspector = field(form, "inspector");
  if (!inspector) return { error: "Choose an available inspector before assigning this request." };

  const { data: request } = await s
    .from("verification_requests")
    .select("vehicle_registration, external_make, external_model, seller_name, seller_phone, inspection_address, city, postcode, preferred_date, preferred_time")
    .eq("id", id)
    .maybeSingle();

  const { error } = await s.rpc("assign_verification_inspector", { p_id: id, p_inspector: inspector });
  if (error) return { error: "Unable to assign this inspector." };

  if (request) {
    const address = [request.inspection_address, request.city, request.postcode].filter(Boolean).join(", ");
    sendInspectorAssignedNotification({
      inspectorId: inspector,
      requestId: id,
      registration: request.vehicle_registration,
      vehicle: `${request.external_make || "Vehicle"} ${request.external_model || ""}`.trim(),
      sellerName: request.seller_name || "Customer",
      sellerPhone: request.seller_phone || "N/A",
      address,
      preferredSchedule: `${request.preferred_date || "Date TBD"} ${request.preferred_time || ""}`.trim(),
    }).catch((err) => console.error("Inspector assignment email error:", err));
  }

  revalidatePath("/admin/verifications");
  revalidatePath("/inspector");
}

export async function scheduleVerification(id: string, form: FormData) {
  await requireRole("admin");
  const s = await createClient();
  const scheduledFor = field(form, "scheduledFor");
  const { error } = await s.rpc("schedule_verification_inspection", { p_id: id, p_scheduled_for: scheduledFor });
  if (error) return { error: "Unable to schedule this inspection." };

  const { data: request } = await s
    .from("verification_requests")
    .select("requested_by, vehicle_registration, external_make, external_model, inspection_address, city, postcode")
    .eq("id", id)
    .maybeSingle();

  if (request?.requested_by) {
    const address = [request.inspection_address, request.city, request.postcode].filter(Boolean).join(", ");
    const formattedDate = scheduledFor
      ? new Date(scheduledFor).toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : "Confirmed Schedule";

    sendInspectionScheduledNotification({
      customerId: request.requested_by,
      requestId: id,
      vehicleRegistration: request.vehicle_registration,
      vehicleMakeModel: `${request.external_make || "Vehicle"} ${request.external_model || ""}`.trim(),
      scheduledDate: formattedDate,
      address,
    }).catch((err) => console.error("Inspection scheduled email error:", err));
  }

  revalidatePath("/admin/verifications");
  revalidatePath("/inspector");
}

export async function startInspection(id: string) { await requireRole("inspector"); const s = await createClient(); await s.rpc("start_verification_inspection", { p_id: id }); revalidatePath("/inspector"); revalidatePath(`/inspector/verifications/${id}`); }
export async function saveReport(id: string, form: FormData) { await requireRole("inspector"); const s = await createClient(); const q = (key: string) => field(form, key) as never; const result = await s.rpc("save_inspection_report", { p_request_id: id, p_result: q("result"), p_summary: field(form, "summary"), p_notes: field(form, "notes"), p_body: q("body"), p_tyres: q("tyres"), p_interior: q("interior"), p_engine: q("engine"), p_brakes: q("brakes"), p_mileage_checked: form.get("mileage") === "on", p_registration_checked: form.get("registrationChecked") === "on" }); if (result.error) return { error: "Unable to save the report." }; if (form.get("submit") === "yes") await s.rpc("submit_inspection_report", { p_request_id: id }); revalidatePath("/inspector"); revalidatePath(`/inspector/verifications/${id}`); return { success: "Report saved." }; }

