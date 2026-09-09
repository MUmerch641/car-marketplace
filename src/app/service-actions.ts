"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole, requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { lookupUkVehicle, type VehicleLookupResult } from "@/lib/services/vehicle-lookup";
import { getOilRecommendations, type OilRecommendation } from "@/lib/services/oils";

type ActionState = { error?: string; success?: string };
export type OilFinderState = {
  error?: string;
  registration?: string;
  vehicle?: VehicleLookupResult;
  recommendations?: OilRecommendation[];
};
const field = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const postcode = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

import {
  sendBookingConfirmationNotification,
  sendServiceWorkerAssignedNotification,
} from "@/lib/email";

export async function createServiceBookingAction(_: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireUser();
  const serviceId = field(form, "serviceId"); const preferredDate = field(form, "preferredDate"); const preferredTime = field(form, "preferredTime");
  const registration = field(form, "carRegistration");
  if (!serviceId || !registration || !field(form, "addressLine1") || !field(form, "city") || !postcode.test(field(form, "postcode")) || !preferredDate || !preferredTime) return { error: "Complete the required vehicle, location and preferred schedule details." };
  if (preferredDate < new Date().toISOString().slice(0, 10)) return { error: "Choose a preferred date that is not in the past." };

  const vehicleResult = await lookupUkVehicle(registration);
  if (!vehicleResult.data) return { error: vehicleResult.error ?? "We could not verify this vehicle registration." };
  const vehicle = vehicleResult.data;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_oil_change_booking", {
    p_service_type_id: serviceId,
    p_car_make: vehicle.make,
    p_car_model: vehicle.model,
    p_car_registration: vehicle.registration,
    p_vehicle_year: (vehicle.year || null) as unknown as number,
    p_fuel_type: vehicle.fuel_type,
    p_engine_capacity_cc: (vehicle.engine_capacity_cc ?? null) as unknown as number,
    p_oil_product_id: (field(form, "oilProductId") || null) as unknown as string,
    p_address_line_1: field(form, "addressLine1"),
    p_address_line_2: field(form, "addressLine2"),
    p_city: field(form, "city"),
    p_postcode: field(form, "postcode").toUpperCase(),
    p_preferred_date: preferredDate,
    p_preferred_time: preferredTime,
    p_notes: field(form, "notes") || undefined,
  });
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
    carDetails: `${vehicle.make} ${vehicle.model} (${vehicle.registration})`,
    preferredDate,
    preferredTime,
    address: `${field(form, "addressLine1")}, ${field(form, "city")}, ${field(form, "postcode").toUpperCase()}`,
  }).catch((err) => console.error("Booking confirmation email error:", err));

  redirect(`/dashboard/bookings/${data}`);
}

export async function findOilForVehicleAction(_: OilFinderState, form: FormData): Promise<OilFinderState> {
  const registration = field(form, "registration").toUpperCase();
  if (!registration) return { error: "Enter your vehicle registration." };

  const result = await lookupUkVehicle(registration);
  if (!result.data) return { registration, error: result.error ?? "We could not find that vehicle." };

  const recommendations = await getOilRecommendations(result.data);
  return { registration: result.data.registration, vehicle: result.data, recommendations };
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
    const serviceName = Array.isArray(booking.service_types) ? booking.service_types[0]?.name : booking.service_types?.name;
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
