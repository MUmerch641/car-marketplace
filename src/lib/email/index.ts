import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "./resend";
import {
  renderBookingConfirmationEmail,
  renderWorkerAssignedServiceEmail,
  renderInspectionScheduledEmail,
  renderInspectorAssignedEmail,
  renderReportReadyEmail,
  renderListingApprovedEmail,
  renderListingRejectedEmail,
} from "./templates";

export async function getUserContact(userId: string): Promise<{ email: string | null; name: string }> {
  try {
    const admin = createAdminClient();
    const [{ data: authData }, { data: profile }] = await Promise.all([
      admin.auth.admin.getUserById(userId),
      admin.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
    ]);

    const email = authData?.user?.email || null;
    const name = profile?.full_name || authData?.user?.user_metadata?.full_name || email?.split("@")[0] || "there";

    return { email, name };
  } catch (error) {
    console.error(`[Email Dispatcher] Failed to resolve contact for user ${userId}:`, error);
    return { email: null, name: "Customer" };
  }
}

// 1. Service Booking Confirmation Email
export async function sendBookingConfirmationNotification(payload: {
  customerId: string;
  bookingId: string;
  serviceName: string;
  carDetails: string;
  preferredDate: string;
  preferredTime: string;
  address: string;
}) {
  try {
    const { email, name } = await getUserContact(payload.customerId);
    if (!email) return;

    const html = renderBookingConfirmationEmail({
      customerName: name,
      serviceName: payload.serviceName,
      carDetails: payload.carDetails,
      preferredDate: payload.preferredDate,
      preferredTime: payload.preferredTime,
      address: payload.address,
      bookingId: payload.bookingId,
    });

    await sendEmail({
      to: email,
      subject: `Your Booking Confirmation: ${payload.serviceName}`,
      html,
    });
  } catch (err) {
    console.error("[Email Error] Failed to send booking confirmation:", err);
  }
}

// 2. Service Worker Assigned Email
export async function sendServiceWorkerAssignedNotification(payload: {
  workerId: string;
  bookingId: string;
  serviceName: string;
  vehicle: string;
  registration?: string;
  date: string;
  time: string;
  address: string;
}) {
  try {
    const { email, name } = await getUserContact(payload.workerId);
    if (!email) return;

    const html = renderWorkerAssignedServiceEmail({
      workerName: name,
      serviceName: payload.serviceName,
      vehicle: payload.vehicle,
      registration: payload.registration,
      date: payload.date,
      time: payload.time,
      address: payload.address,
      bookingId: payload.bookingId,
    });

    await sendEmail({
      to: email,
      subject: `New Job Assigned: ${payload.serviceName} (${payload.date})`,
      html,
    });
  } catch (err) {
    console.error("[Email Error] Failed to send service worker assignment:", err);
  }
}

// 3. Inspection Scheduled Email (To Customer)
export async function sendInspectionScheduledNotification(payload: {
  customerId: string;
  requestId: string;
  vehicleRegistration: string;
  vehicleMakeModel: string;
  scheduledDate: string;
  address: string;
}) {
  try {
    const { email, name } = await getUserContact(payload.customerId);
    if (!email) return;

    const html = renderInspectionScheduledEmail({
      customerName: name,
      vehicleRegistration: payload.vehicleRegistration,
      vehicleMakeModel: payload.vehicleMakeModel,
      scheduledDate: payload.scheduledDate,
      address: payload.address,
      requestId: payload.requestId,
    });

    await sendEmail({
      to: email,
      subject: `Inspection Scheduled: ${payload.vehicleMakeModel} (${payload.vehicleRegistration})`,
      html,
    });
  } catch (err) {
    console.error("[Email Error] Failed to send inspection scheduled email:", err);
  }
}

// 4. Inspector Assigned Email (To Inspector)
export async function sendInspectorAssignedNotification(payload: {
  inspectorId: string;
  requestId: string;
  registration: string;
  vehicle: string;
  sellerName: string;
  sellerPhone: string;
  address: string;
  preferredSchedule: string;
}) {
  try {
    const { email, name } = await getUserContact(payload.inspectorId);
    if (!email) return;

    const html = renderInspectorAssignedEmail({
      inspectorName: name,
      registration: payload.registration,
      vehicle: payload.vehicle,
      sellerName: payload.sellerName,
      sellerPhone: payload.sellerPhone,
      address: payload.address,
      preferredSchedule: payload.preferredSchedule,
      requestId: payload.requestId,
    });

    await sendEmail({
      to: email,
      subject: `New Inspection Assigned: ${payload.vehicle} (${payload.registration})`,
      html,
    });
  } catch (err) {
    console.error("[Email Error] Failed to send inspector assignment email:", err);
  }
}

// 5. Inspection Report Ready Email (To Customer)
export async function sendReportReadyNotification(payload: {
  customerId: string;
  requestId: string;
  vehicleRegistration: string;
  vehicleMakeModel: string;
  overallResult: string;
  summaryPreview?: string;
}) {
  try {
    const { email, name } = await getUserContact(payload.customerId);
    if (!email) return;

    const html = renderReportReadyEmail({
      customerName: name,
      vehicleRegistration: payload.vehicleRegistration,
      vehicleMakeModel: payload.vehicleMakeModel,
      overallResult: payload.overallResult,
      summaryPreview: payload.summaryPreview,
      requestId: payload.requestId,
    });

    await sendEmail({
      to: email,
      subject: `Your Vehicle Inspection Report is Ready (${payload.vehicleRegistration})`,
      html,
    });
  } catch (err) {
    console.error("[Email Error] Failed to send report ready email:", err);
  }
}

// 6. Car Listing Approved Email (To Seller)
export async function sendListingApprovedNotification(payload: {
  sellerId: string;
  carId: string;
  carTitle: string;
  price: string;
}) {
  try {
    const { email, name } = await getUserContact(payload.sellerId);
    if (!email) return;

    const html = renderListingApprovedEmail({
      sellerName: name,
      carTitle: payload.carTitle,
      price: payload.price,
      carId: payload.carId,
    });

    await sendEmail({
      to: email,
      subject: `Your Listing is Live: ${payload.carTitle}`,
      html,
    });
  } catch (err) {
    console.error("[Email Error] Failed to send listing approved email:", err);
  }
}

// 7. Car Listing Rejected Email (To Seller)
export async function sendListingRejectedNotification(payload: {
  sellerId: string;
  carId: string;
  carTitle: string;
  rejectionReason: string;
}) {
  try {
    const { email, name } = await getUserContact(payload.sellerId);
    if (!email) return;

    const html = renderListingRejectedEmail({
      sellerName: name,
      carTitle: payload.carTitle,
      rejectionReason: payload.rejectionReason,
      carId: payload.carId,
    });

    await sendEmail({
      to: email,
      subject: `Listing Update Required: ${payload.carTitle}`,
      html,
    });
  } catch (err) {
    console.error("[Email Error] Failed to send listing rejected email:", err);
  }
}
