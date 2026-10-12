"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole, requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import {
  lookupUkVehicle,
  type VehicleLookupResult,
} from "@/lib/services/vehicle-lookup";
import {
  getOilRecommendations,
  type OilRecommendation,
} from "@/lib/services/oils";
import { isVisitSlotAvailable } from "@/lib/services/visit-schedule";
import { isParkingLocation } from "@/lib/services/parking";

type ActionState = { error?: string; success?: string };
export type OilFinderState = {
  error?: string;
  registration?: string;
  vehicle?: VehicleLookupResult;
  recommendations?: OilRecommendation[];
};
const field = (form: FormData, key: string) =>
  String(form.get(key) ?? "").trim();
const postcode = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

import {
  sendBookingConfirmationNotification,
  sendServiceWorkerAssignedNotification,
} from "@/lib/email";

export async function createServiceBookingAction(
  _: ActionState,
  form: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const serviceId = field(form, "serviceId");
  const preferredDate = field(form, "preferredDate");
  const preferredTime = field(form, "preferredTime");
  const registration = field(form, "carRegistration")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  const manual = field(form, "vehicleEntryMode") === "manual";
  const make = field(form, "carMake");
  const model = field(form, "carModel");
  if (manual && (!make || !model || make.length > 100 || model.length > 100))
    return { error: "Enter your vehicle make and model." };
  if (registration.length > 16)
    return { error: "Check your vehicle registration." };
  const visitType = field(form, "visitType");
  const parkingLocation = field(form, "parkingLocation");
  const levelSurfaceAccess = field(form, "levelSurfaceAccess");
  const parkingAccessNotes = field(form, "parkingAccessNotes");
  if (
    !serviceId ||
    (!manual && !registration) ||
    !field(form, "addressLine1") ||
    !field(form, "city") ||
    !postcode.test(field(form, "postcode")) ||
    !preferredDate ||
    !preferredTime
  )
    return {
      error:
        "Complete the required vehicle, location and preferred schedule details.",
    };
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate) ||
    Number.isNaN(Date.parse(`${preferredDate}T12:00:00Z`)) ||
    new Date(`${preferredDate}T12:00:00Z`).toISOString().slice(0, 10) !==
      preferredDate
  )
    return { error: "Choose a valid preferred date." };
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(preferredTime))
    return { error: "Choose a valid preferred time." };
  if (!isVisitSlotAvailable(preferredDate, preferredTime))
    return { error: "Choose a time at least two hours from now." };
  if (!["home", "work"].includes(visitType))
    return { error: "Choose whether we should visit your home or workplace." };
  if (
    !isParkingLocation(parkingLocation) ||
    !["yes", "no"].includes(levelSurfaceAccess)
  )
    return { error: "Complete the parking and access details for your visit." };
  if (parkingLocation === "other" && !parkingAccessNotes)
    return { error: "Tell us where the vehicle will be parked." };
  if (parkingAccessNotes.length > 1000 || field(form, "notes").length > 2000)
    return {
      error:
        "Your visit notes are too long. Please shorten them and try again.",
    };

  const vehicleResult = manual ? null : await lookupUkVehicle(registration);
  if (!manual && !vehicleResult?.data)
    return {
      error:
        vehicleResult?.error ??
        "We could not verify this vehicle registration. Go back and enter the details manually if needed.",
    };
  const vehicle = vehicleResult?.data ?? {
    make,
    model,
    registration,
    year: 0,
    fuel_type: null,
    engine_capacity_cc: null,
  };
  const supabase = await createClient();
  const { data: serviceType, error: serviceError } = await supabase
    .from("service_types")
    .select("name,base_price,slug")
    .eq("id", serviceId)
    .eq("is_active", true)
    .maybeSingle();
  if (serviceError || !serviceType || serviceType.slug !== "oil-change")
    return {
      error: "This service is unavailable. Please choose an available service.",
    };
  const oilId = manual ? "" : field(form, "oilProductId");
  const oil =
    oilId && vehicleResult?.data
      ? (await getOilRecommendations(vehicleResult.data)).find(
          (item) => item.id === oilId,
        )
      : null;
  if (oilId && !oil)
    return {
      error:
        "That oil match is no longer available. Go back to your car details and let Shaz confirm the correct parts.",
    };
  // Use the same authenticated, owner-scoped row creation as the mobile app.
  // Parking fields are stored directly so both interfaces see the same details.
  // Any selected oil and estimate come from server-side catalogue data.
  const { data: created, error } = await supabase
    .from("service_bookings")
    .insert({
      customer_id: user.id,
      service_type_id: serviceId,
      car_make: vehicle.make,
      car_model: vehicle.model,
      car_registration: vehicle.registration || null,
      vehicle_year: vehicle.year > 0 ? vehicle.year : null,
      fuel_type: vehicle.fuel_type,
      engine_capacity_cc: vehicle.engine_capacity_cc ?? null,
      oil_product_id: oil?.id ?? null,
      oil_product_name: oil ? `${oil.brand} ${oil.name}` : null,
      oil_viscosity_grade: oil?.viscosityGrade ?? null,
      oil_price: oil?.price ?? null,
      oil_fitment_status: oil ? "verified" : "manual_confirmation",
      quoted_price: Number(serviceType.base_price) + Number(oil?.price ?? 0),
      address_line_1: field(form, "addressLine1"),
      address_line_2: field(form, "addressLine2") || null,
      city: field(form, "city"),
      postcode: field(form, "postcode").toUpperCase(),
      preferred_date: preferredDate,
      preferred_time: preferredTime,
      parking_location: parkingLocation,
      level_surface_access: levelSurfaceAccess === "yes",
      parking_access_notes: parkingAccessNotes || null,
      notes:
        [visitType === "work" ? "Workplace visit." : "", field(form, "notes")]
          .filter(Boolean)
          .join("\n\n") || null,
      status: "pending",
    })
    .select("id")
    .single();
  if (error || !created) {
    console.error("Service booking creation failed:", error?.message);
    return {
      error:
        "We could not submit your booking. Your details are still here. Please try again.",
    };
  }
  const data = created.id;

  sendBookingConfirmationNotification({
    customerId: user.id,
    bookingId: data,
    serviceName: serviceType?.name || "Mobile Car Service",
    carDetails: `${vehicle.make} ${vehicle.model} (${vehicle.registration})`,
    preferredDate,
    preferredTime,
    address: `${field(form, "addressLine1")}, ${field(form, "city")}, ${field(form, "postcode").toUpperCase()}`,
  }).catch((err) => console.error("Booking confirmation email error:", err));

  redirect(`/dashboard/bookings/${data}?requested=1`);
}

export async function findOilForVehicleAction(
  _: OilFinderState,
  form: FormData,
): Promise<OilFinderState> {
  const registration = field(form, "registration").toUpperCase();
  if (!registration) return { error: "Enter your vehicle registration." };

  const result = await lookupUkVehicle(registration);
  if (!result.data)
    return {
      registration,
      error: result.error ?? "We could not find that vehicle.",
    };

  const recommendations = await getOilRecommendations(result.data);
  return {
    registration: result.data.registration,
    vehicle: result.data,
    recommendations,
  };
}

export async function confirmBookingAction(bookingId: string) {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.rpc("confirm_service_booking", {
    p_booking_id: bookingId,
  });
  if (error) return { error: "Unable to confirm this booking." };
  revalidatePath("/admin/bookings");
  return { success: "Booking confirmed." };
}

export async function assignWorkerAction(bookingId: string, form: FormData) {
  await requireRole("admin");
  const workerId = field(form, "workerId");
  if (!workerId) return { error: "Choose an authorised field worker." };
  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("service_bookings")
    .select(
      "car_make, car_model, car_registration, preferred_date, preferred_time, address_line_1, address_line_2, city, postcode, service_types(name)",
    )
    .eq("id", bookingId)
    .maybeSingle();

  const { error } = await supabase.rpc("assign_service_worker", {
    p_booking_id: bookingId,
    p_worker_id: workerId,
  });
  if (error) return { error: "Unable to assign this worker." };

  if (booking) {
    const serviceName = Array.isArray(booking.service_types)
      ? booking.service_types[0]?.name
      : booking.service_types?.name;
    const address = [
      booking.address_line_1,
      booking.address_line_2,
      booking.city,
      booking.postcode,
    ]
      .filter(Boolean)
      .join(", ");

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
export async function cancelBookingAsAdminAction(bookingId: string) {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_service_booking_as_admin", {
    p_booking_id: bookingId,
  });
  if (error) return { error: "Unable to cancel this booking." };
  revalidatePath("/admin/bookings");
  revalidatePath("/dashboard");
  revalidatePath("/inspector");
  return { success: "Booking cancelled." };
}
export async function advanceBookingAction(
  bookingId: string,
  nextStatus: "on_the_way" | "in_progress" | "completed",
) {
  const { user } = await requireRole("inspector");
  const supabase = await createClient();
  if (nextStatus === "completed") {
    const report = await supabase
      .from("service_job_reports")
      .select("id")
      .eq("service_booking_id", bookingId)
      .eq("inspector_id", user.id)
      .maybeSingle();
    if (report.error || !report.data)
      return {
        error:
          "Save your service notes and before/after evidence before completing the job.",
      };
    const photos = await supabase
      .from("service_job_images")
      .select("stage")
      .eq("service_job_report_id", report.data.id);
    if (
      photos.error ||
      !photos.data?.some((photo) => photo.stage === "before") ||
      !photos.data.some((photo) => photo.stage === "after")
    )
      return {
        error:
          "Add at least one before and one after photo before completing the service.",
      };
  }
  const { error } = await supabase.rpc("advance_service_booking", {
    p_booking_id: bookingId,
    p_target: nextStatus,
  });
  if (error)
    return { error: "That status change is not available for this job." };
  revalidatePath("/inspector");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/bookings/${bookingId}`);
  return { success: "Job status updated." };
}

export async function saveServiceTypeAction(form: FormData) {
  await requireRole("admin");
  const supabase = await createClient();
  const id = field(form, "id");
  const name = field(form, "name");
  const slug = field(form, "slug").toLowerCase();
  const basePrice = Number(field(form, "basePrice"));
  const minutes = field(form, "estimatedDurationMinutes");
  if (
    !name ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    !field(form, "description") ||
    !Number.isFinite(basePrice) ||
    basePrice < 0 ||
    (minutes && (!Number.isInteger(Number(minutes)) || Number(minutes) < 1))
  )
    return {
      error:
        "Enter a valid service name, URL slug, description, base price and duration.",
    };
  const payload = {
    name,
    slug,
    description: field(form, "description"),
    short_description: field(form, "shortDescription") || null,
    base_price: basePrice,
    estimated_duration_minutes: minutes ? Number(minutes) : null,
    is_active: form.get("isActive") === "on",
  };
  const result = id
    ? await supabase.from("service_types").update(payload).eq("id", id)
    : await supabase.from("service_types").insert(payload);
  if (result.error)
    return {
      error: "Unable to save this service type. Check that the slug is unique.",
    };
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
  return { success: "Service type saved." };
}
