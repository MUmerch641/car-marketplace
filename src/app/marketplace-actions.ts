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
export async function submitListingAction(carId: string) { await requireUser(); const supabase = await createClient(); const { error } = await supabase.rpc("submit_car_for_review", { p_car_id: carId }); if (error) return { error: "Add all required details and at least one image before submitting." }; revalidatePath("/dashboard"); redirect("/dashboard"); }
export async function markSoldAction(carId: string) { await requireUser(); const supabase = await createClient(); const { error } = await supabase.rpc("mark_car_sold", { p_car_id: carId }); if (error) return { error: "We could not mark this listing sold." }; revalidatePath("/dashboard"); revalidatePath(`/cars/${carId}`); return { success: "Listing marked as sold." }; }
export async function deleteCarAction(carId: string) { await requireUser(); const supabase = await createClient(); const { data: images, error: readError } = await supabase.from("car_images").select("storage_path").eq("car_id", carId); if (readError) return { error: "Unable to prepare image cleanup." }; if (images?.length) { const { error: storageError } = await supabase.storage.from("car-images").remove(images.map((image) => image.storage_path)); if (storageError) return { error: "Image cleanup failed. Please retry; the listing was not deleted." }; } const { error } = await supabase.from("cars").delete().eq("id", carId); if (error) return { error: "Unable to delete this listing." }; revalidatePath("/dashboard"); redirect("/dashboard"); }
export async function moderateCarAction(carId: string, approved: boolean, rejectionReason?: string) { await requireRole("admin"); const supabase = await createClient(); const { error } = await supabase.rpc("moderate_car", { p_car_id: carId, p_approved: approved, p_rejection_reason: rejectionReason }); if (error) return { error: "Unable to moderate this listing." }; revalidatePath("/admin/cars"); revalidatePath("/"); revalidatePath(`/cars/${carId}`); return { success: approved ? "Listing approved." : "Listing rejected." }; }
