import { requireRole } from "@/lib/auth/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { InspectorWorkspace, type NormalizedJob } from "@/components/inspector/inspector-workspace";

export default async function InspectorPage() {
  const { user, profile } = await requireRole("inspector");
  const adminDb = createAdminClient();

  // Fetch active employee assignments using admin client to guarantee complete job data for the authenticated inspector
  const [{ data: serviceAssignments }, { data: verificationAssignments }] = await Promise.all([
    adminDb
      .from("employee_assignments")
      .select(`
        id,
        status,
        assigned_at,
        service_booking_id,
        service_bookings (
          id,
          car_make,
          car_model,
          car_registration,
          address_line_1,
          address_line_2,
          city,
          postcode,
          preferred_date,
          preferred_time,
          status,
          notes,
          created_at,
          service_types (
            name
          ),
          profiles:customer_id (
            full_name,
            phone
          )
        )
      `)
      .eq("employee_id", user.id)
      .not("service_booking_id", "is", null)
      .in("status", ["assigned", "accepted", "in_progress", "completed"]),

    adminDb
      .from("employee_assignments")
      .select(`
        id,
        status,
        assigned_at,
        verification_request_id,
        verification_requests (
          id,
          car_id,
          vehicle_registration,
          external_make,
          external_model,
          external_year,
          seller_name,
          seller_phone,
          inspection_address,
          city,
          postcode,
          preferred_date,
          preferred_time,
          scheduled_for,
          inspection_type,
          status,
          notes,
          created_at
        )
      `)
      .eq("employee_id", user.id)
      .not("verification_request_id", "is", null)
      .in("status", ["assigned", "accepted", "in_progress", "completed"]),
  ]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const normalizedJobs: NormalizedJob[] = [];

  // Process mobile service jobs assigned to this inspector
  for (const a of serviceAssignments || []) {
    const sb = (Array.isArray(a.service_bookings) ? a.service_bookings[0] : a.service_bookings) as Record<string, any> | null;
    if (!sb || a.status === "cancelled") continue;

    const rawStatus = sb.status;
    const scheduledDate = sb.preferred_date || "";
    const scheduledTime = sb.preferred_time || "09:00";
    const carMake = sb.car_make || "Vehicle";
    const carModel = sb.car_model || "";
    const carReg = sb.car_registration || "";
    const addressLine = [sb.address_line_1, sb.address_line_2].filter(Boolean).join(", ");
    const fullAddress = `${addressLine}, ${sb.city}, ${sb.postcode}`;
    const isToday = scheduledDate === todayStr || rawStatus === "on_the_way" || rawStatus === "in_progress";
    const isCompleted = rawStatus === "completed" || rawStatus === "cancelled";
    const serviceTypeName = Array.isArray(sb.service_types) ? sb.service_types[0]?.name : sb.service_types?.name;
    const customerName = Array.isArray(sb.profiles) ? sb.profiles[0]?.full_name : sb.profiles?.full_name;
    const customerPhone = Array.isArray(sb.profiles) ? sb.profiles[0]?.phone : sb.profiles?.phone;

    normalizedJobs.push({
      id: `sb-${sb.id}`,
      jobType: "service",
      jobTypeLabel: "Mobile Service",
      serviceBookingId: sb.id,
      title: serviceTypeName || "Mobile Car Service",
      carMake,
      carModel,
      carRegistration: carReg,
      vehicleDisplay: `${carMake} ${carModel}`.trim(),
      scheduledDate,
      scheduledTime,
      scheduledTimeRaw: `${scheduledDate}T${scheduledTime}`,
      addressLine,
      city: sb.city,
      postcode: sb.postcode,
      locationDisplay: `${sb.city} ${sb.postcode}`,
      fullAddress,
      customerName: customerName || "Customer",
      customerPhone: customerPhone || "",
      status: rawStatus,
      statusLabel: formatStatusLabel(rawStatus),
      notes: sb.notes,
      assignedAt: a.assigned_at,
      isToday,
      isUpcoming: !isCompleted,
      isCompleted,
    });
  }

  // Process vehicle inspection jobs assigned to this inspector
  for (const a of verificationAssignments || []) {
    const vr = (Array.isArray(a.verification_requests) ? a.verification_requests[0] : a.verification_requests) as Record<string, any> | null;
    if (!vr || a.status === "cancelled") continue;

    const rawStatus = vr.status;
    const scheduledDate = vr.scheduled_for ? vr.scheduled_for.slice(0, 10) : vr.preferred_date || "";
    const scheduledTime = vr.scheduled_for
      ? new Date(vr.scheduled_for).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
      : vr.preferred_time || "TBD";
    const carMake = vr.external_make || "Vehicle";
    const carModel = vr.external_model || "";
    const carReg = vr.vehicle_registration || "";
    const fullAddress = `${vr.inspection_address}, ${vr.city}, ${vr.postcode}`;
    const isToday = scheduledDate === todayStr || rawStatus === "inspection_in_progress";
    const isCompleted = rawStatus === "completed" || rawStatus === "report_submitted" || rawStatus === "cancelled";

    normalizedJobs.push({
      id: `vr-${vr.id}`,
      jobType: "inspection",
      jobTypeLabel: vr.inspection_type === "seller_pre_inspection" ? "Seller Pre-Inspection" : "Vehicle Inspection",
      verificationRequestId: vr.id,
      title: vr.inspection_type === "seller_pre_inspection" ? "Seller Pre-Inspection" : "Buyer Pre-purchase Inspection",
      carMake,
      carModel,
      carRegistration: carReg,
      vehicleDisplay: `${carMake} ${carModel}`.trim() || carReg || "Inspection Vehicle",
      scheduledDate,
      scheduledTime,
      scheduledTimeRaw: vr.scheduled_for || `${scheduledDate}T${scheduledTime}`,
      addressLine: vr.inspection_address,
      city: vr.city,
      postcode: vr.postcode,
      locationDisplay: `${vr.city} ${vr.postcode}`,
      fullAddress,
      customerName: vr.seller_name || "Seller/Customer",
      customerPhone: vr.seller_phone || "",
      status: rawStatus,
      statusLabel: formatStatusLabel(rawStatus),
      notes: vr.notes,
      assignedAt: a.assigned_at,
      isToday,
      isUpcoming: !isCompleted,
      isCompleted,
    });
  }

  // Sort chronologically by scheduled time
  normalizedJobs.sort((a, b) => a.scheduledTimeRaw.localeCompare(b.scheduledTimeRaw));

  const workerName = profile.full_name || user.email?.split("@")[0] || "Field Worker";

  return <InspectorWorkspace jobs={normalizedJobs} workerName={workerName} />;
}

function formatStatusLabel(status: string): string {
  switch (status) {
    case "on_the_way":
      return "On the way";
    case "in_progress":
    case "inspection_in_progress":
      return "In progress";
    case "report_submitted":
      return "Report submitted";
    case "completed":
      return "Completed";
    case "inspection_scheduled":
      return "Scheduled";
    default:
      return status.replace(/_/g, " ");
  }
}
