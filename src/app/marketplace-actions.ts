"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole, requireUser } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type Fuel = Database["public"]["Enums"]["fuel_type"]; type Transmission = Database["public"]["Enums"]["transmission_type"];
const fuels = new Set<Fuel>(["petrol", "diesel", "hybrid", "plug_in_hybrid", "electric", "other"]);
const transmissions = new Set<Transmission>(["manual", "automatic", "semi_automatic", "other"]);
const text = (form: FormData, name: string) => String(form.get(name) ?? "").trim();
const number = (form: FormData, name: string) => Number(text(form, name));
function listingValues(form: FormData) { const fuel = text(form, "fuel") as Fuel; const transmission = text(form, "transmission") as Transmission; if (!fuels.has(fuel) || !transmissions.has(transmission)) throw new Error("Choose a valid fuel type and transmission."); const year = number(form, "year"); const price = number(form, "price"); const mileage = number(form, "mileage"); if (!text(form, "make") || !text(form, "model") || !text(form, "city") || !text(form, "postcode") || text(form, "description").length < 20 || !Number.isInteger(year) || year < 1886 || price < 0 || mileage < 0) throw new Error("Complete all required listing details."); return { make: text(form, "make"), model: text(form, "model"), variant: text(form, "variant") || null, year, price, mileage, fuel_type: fuel, transmission, body_type: text(form, "bodyType") || null, engine_size: text(form, "engineSize") ? Number(text(form, "engineSize")) : null, colour: text(form, "colour") || null, registration: text(form, "registration") || null, city: text(form, "city"), postcode: text(form, "postcode"), description: text(form, "description"), mot_expiry: text(form, "motExpiry") || null, service_history: text(form, "serviceHistory") || null, ulez_compliant: form.get("ulezCompliant") === "yes" ? true : form.get("ulezCompliant") === "no" ? false : null }; }
export async function createListingAction(form: FormData) {
  const user = await requireUser();
  let carId: string;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("cars")
      .insert({ ...listingValues(form), seller_id: user.id })
      .select("id")
      .single();

    if (error || !data) {
      return { error: "We could not create your listing. Please try again." };
    }

    carId = data.id;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to create listing.",
    };
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/cars/${carId}/edit?step=photos&created=1`);
}
export async function updateListingAction(carId: string, form: FormData) { await requireUser(); try { const supabase = await createClient(); const { error } = await supabase.from("cars").update(listingValues(form)).eq("id", carId); if (error) return { error: "We could not update this listing." }; revalidatePath(`/dashboard/cars/${carId}/edit`); revalidatePath("/dashboard"); return { success: "Listing details saved." }; } catch (error) { return { error: error instanceof Error ? error.message : "Unable to save listing." }; } }
export async function updateActiveListingAction(carId: string, form: FormData) {
  await requireUser();
  try {
    const supabase = await createClient();
    let ulez_compliant = null;
    if (form.get("ulezCompliant") === "yes") ulez_compliant = true;
    else if (form.get("ulezCompliant") === "no") ulez_compliant = false;
    
    // @ts-expect-error RPC not in types yet
    const { error } = await supabase.rpc("update_active_car_listing", {
      p_car_id: carId,
      p_price: number(form, "price"),
      p_mileage: number(form, "mileage"),
      p_city: text(form, "city"),
      p_postcode: text(form, "postcode"),
      p_description: text(form, "description"),
      p_mot_expiry: text(form, "motExpiry") || null,
      p_service_history: text(form, "serviceHistory") || null,
      p_ulez_compliant: ulez_compliant
    });
    if (error) return { error: "We could not update this active listing." };
    revalidatePath(`/dashboard/cars/${carId}/edit`);
    revalidatePath("/dashboard");
    revalidatePath(`/cars/${carId}`);
    return { success: "Listing details saved." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to save listing." };
  }
}
export async function submitListingAction(carId: string) { await requireUser(); const supabase = await createClient(); const { error } = await supabase.rpc("submit_car_for_review", { p_car_id: carId }); if (error) return { error: "Add all required details and at least one image before submitting." }; revalidatePath("/dashboard"); redirect("/dashboard"); }
export async function markSoldAction(carId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  
  // Debug check
  const { data: carData } = await supabase.from("cars").select("id, seller_id, status").eq("id", carId).single();
  console.log("MARK SOLD DEBUG - Target Car:", carId);
  console.log("MARK SOLD DEBUG - User ID:", user.id);
  console.log("MARK SOLD DEBUG - DB Car:", carData);

  const { error } = await supabase.rpc("mark_car_sold", { p_car_id: carId }); 
  if (error) { 
    console.error("MARK SOLD ERROR:", error); 
    return { error: `Debug: ${error.message} - ${error.details}. Car in DB: ${JSON.stringify(carData)} | UID: ${user.id}` }; 
  } 
  revalidatePath("/dashboard"); 
  revalidatePath(`/cars/${carId}`); 
  return { success: "Listing marked as sold." }; 
}
export async function deleteCarAction(carId: string) { await requireUser(); const supabase = await createClient(); const { data: images, error: readError } = await supabase.from("car_images").select("storage_path").eq("car_id", carId); if (readError) return { error: "Unable to prepare image cleanup." }; if (images?.length) { const { error: storageError } = await supabase.storage.from("car-images").remove(images.map((image) => image.storage_path)); if (storageError) return { error: "Image cleanup failed. Please retry; the listing was not deleted." }; } const { error } = await supabase.from("cars").delete().eq("id", carId); if (error) return { error: "Unable to delete this listing." }; revalidatePath("/dashboard"); redirect("/dashboard"); }
import {
  sendListingApprovedNotification,
  sendListingRejectedNotification,
} from "@/lib/email";

export async function moderateCarAction(carId: string, approved: boolean, rejectionReason?: string) {
  await requireRole("admin");
  const supabase = await createClient();
  
  // Fetch car details before or along with moderation so we have seller_id, title, price
  const { data: car } = await supabase
    .from("cars")
    .select("seller_id, year, make, model, variant, price")
    .eq("id", carId)
    .maybeSingle();

  const { error } = await supabase.rpc("moderate_car", {
    p_car_id: carId,
    p_approved: approved,
    p_rejection_reason: rejectionReason,
  });

  if (error) return { error: "Unable to moderate this listing." };

  if (car) {
    const carTitle = `${car.year} ${car.make} ${car.model}${car.variant ? ` ${car.variant}` : ""}`;
    const priceFormatted = `£${Number(car.price).toLocaleString("en-GB")}`;

    if (approved) {
      sendListingApprovedNotification({
        sellerId: car.seller_id,
        carId,
        carTitle,
        price: priceFormatted,
      }).catch((err) => console.error("Listing approval email error:", err));
    } else {
      sendListingRejectedNotification({
        sellerId: car.seller_id,
        carId,
        carTitle,
        rejectionReason: rejectionReason || "Please review vehicle details and resubmit.",
      }).catch((err) => console.error("Listing rejection email error:", err));
    }
  }

  revalidatePath("/admin/cars");
  revalidatePath("/");
  revalidatePath(`/cars/${carId}`);
  return { success: approved ? "Listing approved." : "Listing rejected." };
}
