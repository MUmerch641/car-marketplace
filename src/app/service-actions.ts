"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole, requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";

type ActionState = { error?: string; success?: string };
const field = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const postcode = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

import {
  sendBookingConfirmationNotification,
  sendServiceWorkerAssignedNotification,
} from "@/lib/email";

export async function createServiceBookingAction(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const serviceId = field(form, "serviceId"); const preferredDate = field(form, "preferredDate"); const preferredTime = field(form, "preferredTime");
  if (!serviceId || !field(form, "carMake") || !field(form, "carModel") || !field(form, "addressLine1") || !field(form, "city") || !postcode.test(field(form, "postcode")) || !preferredDate || !preferredTime) return { error: "Complete the required vehicle, location and preferred schedule details." };
  if (preferredDate < new Date().toISOString().slice(0, 10)) return { error: "Choose a preferred date that is not in the past." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_service_booking", { p_service_type_id: serviceId, p_car_make: field(form, "carMake"), p_car_model: field(form, "carModel"), p_car_registration: field(form, "carRegistration"), p_address_line_1: field(form, "addressLine1"), p_address_line_2: field(form, "addressLine2"), p_city: field(form, "city"), p_postcode: field(form, "postcode").toUpperCase(), p_preferred_date: preferredDate, p_preferred_time: preferredTime, p_notes: field(form, "notes") || undefined });
  if (error || !data) return { error: "We could not submit your booking. Please try again." };

  // Fetch service type name for email confirmation
  const { data: serviceType } = await supabase
    .from("service_types")
    .select("name")
    .eq("id", serviceId)
    .maybeSingle();

  sendBookingConfirmationNotification({
    customerId: user.id,
    bookingId: data,
    serviceName: serviceType?.name || "Mobile Car Service",
    carDetails: `${field(form, "carMake")} ${field(form, "carModel")}${field(form, "carRegistration") ? ` (${field(form, "carRegistration")})` : ""}`,
    preferredDate,
    preferredTime,
    address: `${field(form, "addressLine1")}, ${field(form, "city")}, ${field(form, "postcode").toUpperCase()}`,
  }).catch((err) => console.error("Booking confirmation email error:", err));

  redirect(`/dashboard/bookings/${data}`);
}

export async function cancelBookingAction(bookingId: string, form: FormData) {
  await requireUser(); const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_own_service_booking", { p_booking_id: bookingId, p_reason: field(form, "reason") || undefined });
  if (error) return { error: "This booking can no longer be cancelled online." };
  revalidatePath("/dashboard"); revalidatePath(`/dashboard/bookings/${bookingId}`); return { success: "Booking cancelled." };
}

export async function confirmBookingAction(bookingId: string) { await requireRole("admin"); const supabase = await createClient(); const { error } = await supabase.rpc("confirm_service_booking", { p_booking_id: bookingId }); if (error) return { error: "Unable to confirm this booking." }; revalidatePath("/admin/bookings"); return { success: "Booking confirmed." }; }

export async function assignWorkerAction(bookingId: string, form: FormData) {
  await requireRole("admin");
  const workerId = field(form, "workerId");
  if (!workerId) return { error: "Choose an authorised field worker." };
  const supabase = await createClient();
  
  const { data: booking } = await supabase
    .from("service_bookings")
    .select("car_make, car_model, car_registration, preferred_date, preferred_time, address_line_1, address_line_2, city, postcode, service_types(name)")
    .eq("id", bookingId)
    .maybeSingle();

  const { error } = await supabase.rpc("assign_service_worker", { p_booking_id: bookingId, p_worker_id: workerId });
  if (error) return { error: "Unable to assign this worker." };

  if (booking) {
    const serviceName = Array.isArray(booking.service_types) ? booking.service_types[0]?.name : (booking.service_types as any)?.name;
    const address = [booking.address_line_1, booking.address_line_2, booking.city, booking.postcode].filter(Boolean).join(", ");
    
    sendServiceWorkerAssignedNotification({
      workerId,
      bookingId,
      serviceName: serviceName || "Mobile Service",
      vehicle: `${booking.car_make} ${booking.car_model}`,
      registration: booking.car_registration || undefined,
      date: booking.preferred_date,
      time: booking.preferred_time,
      address,
    }).catch((err) => console.error("Worker assignment email error:", err));
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/inspector");
  return { success: "Worker assigned." };
}
export async function cancelBookingAsAdminAction(bookingId: string) { await requireRole("admin"); const supabase = await createClient(); const { error } = await supabase.rpc("cancel_service_booking_as_admin", { p_booking_id: bookingId }); if (error) return { error: "Unable to cancel this booking." }; revalidatePath("/admin/bookings"); revalidatePath("/dashboard"); revalidatePath("/inspector"); return { success: "Booking cancelled." }; }
export async function advanceBookingAction(bookingId: string, nextStatus: "on_the_way" | "in_progress" | "completed") { await requireRole("inspector"); const supabase = await createClient(); const { error } = await supabase.rpc("advance_service_booking", { p_booking_id: bookingId, p_target: nextStatus }); if (error) return { error: "That status change is not available for this job." }; revalidatePath("/inspector"); revalidatePath("/dashboard"); return { success: "Job status updated." }; }

export async function saveServiceTypeAction(form: FormData) {
  await requireRole("admin"); const supabase = await createClient(); const id = field(form, "id"); const name = field(form, "name"); const slug = field(form, "slug").toLowerCase(); const basePrice = Number(field(form, "basePrice")); const minutes = field(form, "estimatedDurationMinutes");
  if (!name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !field(form, "description") || !Number.isFinite(basePrice) || basePrice < 0 || (minutes && (!Number.isInteger(Number(minutes)) || Number(minutes) < 1))) return { error: "Enter a valid service name, URL slug, description, base price and duration." };
  const payload = { name, slug, description: field(form, "description"), short_description: field(form, "shortDescription") || null, base_price: basePrice, estimated_duration_minutes: minutes ? Number(minutes) : null, is_active: form.get("isActive") === "on" };
  const result = id ? await supabase.from("service_types").update(payload).eq("id", id) : await supabase.from("service_types").insert(payload);
  if (result.error) return { error: "Unable to save this service type. Check that the slug is unique." };
  revalidatePath("/admin/services"); revalidatePath("/services"); revalidatePath("/"); return { success: "Service type saved." };
}
