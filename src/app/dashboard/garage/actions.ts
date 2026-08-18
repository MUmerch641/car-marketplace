"use server";

import { requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { lookupUkVehicle, VehicleLookupResult } from "@/lib/services/vehicle-lookup";

export async function lookupVehicleAction(formData: FormData) {
  await requireUser();
  const registration = formData.get("registration")?.toString();
  if (!registration) {
    return { error: "Registration is required." };
  }
  return await lookupUkVehicle(registration);
}

export async function addGarageVehicleAction(data: VehicleLookupResult) {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.from("garage_vehicles").insert({
    customer_id: user.id,
    registration: data.registration,
    make: data.make,
    model: data.model,
    year: data.year,
    fuel_type: data.fuel_type,
    colour: data.colour,
    engine_capacity_cc: data.engine_capacity_cc,
    mot_expiry: data.mot_expiry,
  });

  if (error) {
    // 23505 is the PostgreSQL error code for unique violation
    if (error.code === "23505") {
      return { error: "This vehicle is already in your garage." };
    }
    console.error("Failed to add garage vehicle:", error);
    return { error: "Failed to add vehicle to your garage." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/garage");
  return { success: true };
}

export async function removeGarageVehicleAction(id: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.from("garage_vehicles")
    .delete()
    .eq("id", id)
    .eq("customer_id", user.id);

  if (error) {
    console.error("Failed to remove garage vehicle:", error);
    return { error: "Failed to remove vehicle." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/garage");
  return { success: true };
}
