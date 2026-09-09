"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

const value = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const nullableNumber = (form: FormData, key: string) => value(form, key) ? Number(value(form, key)) : null;
const supplierStatuses = ["prospective", "active", "paused"] as const;

export async function createSupplierAction(form: FormData) {
  await requireRole("admin");
  const name = value(form, "name");
  const status = value(form, "status");
  if (!name || !supplierStatuses.includes(status as typeof supplierStatuses[number])) throw new Error("Enter a supplier name and status.");
  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").insert({
    name,
    status,
    contact_name: value(form, "contactName") || null,
    contact_email: value(form, "contactEmail") || null,
    contact_phone: value(form, "contactPhone") || null,
    ordering_notes: value(form, "orderingNotes") || null,
  });
  if (error) throw new Error("Unable to add this supplier. Check that it has not already been added.");
  revalidatePath("/admin/oils"); revalidatePath("/admin/bookings"); revalidatePath("/admin");
}

export async function saveSupplierAction(form: FormData) {
  await requireRole("admin");
  const id = value(form, "id");
  const status = value(form, "status");
  if (!id) throw new Error("Supplier not found.");
  if (!supplierStatuses.includes(status as typeof supplierStatuses[number])) throw new Error("Choose a valid supplier status.");
  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").update({
    status,
    contact_name: value(form, "contactName") || null,
    contact_email: value(form, "contactEmail") || null,
    contact_phone: value(form, "contactPhone") || null,
    ordering_notes: value(form, "orderingNotes") || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) throw new Error("Unable to save supplier details.");
  revalidatePath("/admin/oils"); revalidatePath("/admin/bookings"); revalidatePath("/admin");
}

export async function saveOilProductAction(form: FormData) {
  await requireRole("admin");
  const id = value(form, "id");
  const price = Number(value(form, "price"));
  const volume = Number(value(form, "volumeLitres"));
  if (!value(form, "brand") || !value(form, "name") || !value(form, "viscosityGrade") || !Number.isFinite(price) || price < 0 || !Number.isFinite(volume) || volume <= 0) throw new Error("Complete the required oil product details.");
  const payload: Database["public"]["Tables"]["oil_products"]["Insert"] = {
    supplier_id: value(form, "supplierId") || null,
    supplier_sku: value(form, "supplierSku") || null,
    brand: value(form, "brand"),
    name: value(form, "name"),
    viscosity_grade: value(form, "viscosityGrade").toUpperCase(),
    specifications: value(form, "specifications").split(",").map((item) => item.trim()).filter(Boolean),
    volume_litres: volume,
    price,
    image_url: value(form, "imageUrl") || null,
    description: value(form, "description") || null,
    is_active: form.get("isActive") === "on",
  };
  const supabase = await createClient();
  const result = id ? await supabase.from("oil_products").update(payload).eq("id", id) : await supabase.from("oil_products").insert(payload);
  if (result.error) throw new Error("Unable to save this oil product.");
  revalidatePath("/admin/oils"); revalidatePath("/services"); revalidatePath("/");
}

export async function saveOilFitmentAction(form: FormData) {
  await requireRole("admin");
  const fuel = value(form, "fuelType") as Database["public"]["Enums"]["fuel_type"] | "";
  if (!value(form, "oilProductId") || !value(form, "make") || !value(form, "model")) throw new Error("Choose an oil and enter a make and model.");
  const supabase = await createClient();
  const { error } = await supabase.from("oil_fitments").insert({
    oil_product_id: value(form, "oilProductId"),
    make: value(form, "make"),
    model: value(form, "model"),
    year_from: nullableNumber(form, "yearFrom"),
    year_to: nullableNumber(form, "yearTo"),
    fuel_type: fuel || null,
    engine_capacity_min_cc: nullableNumber(form, "engineMin"),
    engine_capacity_max_cc: nullableNumber(form, "engineMax"),
    is_primary: form.get("isPrimary") === "on",
    source_reference: value(form, "sourceReference") || null,
    notes: value(form, "notes") || null,
    verified_at: form.get("isVerified") === "on" ? new Date().toISOString() : null,
  });
  if (error) throw new Error("Unable to save this fitment. Check for a duplicate primary recommendation.");
  revalidatePath("/admin/oils"); revalidatePath("/services"); revalidatePath("/");
}
