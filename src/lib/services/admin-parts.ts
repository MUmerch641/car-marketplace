"use server";

import { createClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getSupabase = async () => (await createClient()) as any;

export async function adminUpsertPartCategory(payload: {
  p_category_id: string | null;
  p_name: string;
  p_slug: string;
  p_description: string | null;
  p_is_active: boolean;
  p_sort_order: number;
}) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.rpc("admin_upsert_part_category", payload);
  if (error) {
    console.error("Supabase RPC Error:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    if (error.code === "23505") {
      throw new Error("A category with this slug already exists. Please choose a different slug.");
    }
    throw new Error(error.message || "An error occurred during the operation.");
  }
  return data;
}

export async function adminUpsertPart(payload: {
  p_part_id: string;
  p_category_id: string;
  p_sku: string;
  p_name: string;
  p_slug: string;
  p_brand: string;
  p_description: string | null;
  p_price_pence: number;
  p_stock_quantity: number;
  p_is_active: boolean;
}) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.rpc("admin_upsert_part", payload);
  if (error) {
    console.error("Supabase RPC Error:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(error.message || "An error occurred during the operation.");
  }
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function adminReplacePartFitments(partId: string, fitments: any[]) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.rpc("admin_replace_part_fitments", {
    p_part_id: partId,
    p_fitments: fitments,
  });
  if (error) {
    console.error("Supabase RPC Error:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(error.message || "An error occurred during the operation.");
  }
  return data;
}

export async function adminAddPartImage(payload: {
  p_part_id: string;
  p_storage_path: string;
  p_sort_order?: number;
  p_alt_text?: string;
}) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.rpc("admin_add_part_image", {
    p_part_id: payload.p_part_id,
    p_storage_path: payload.p_storage_path,
    p_sort_order: payload.p_sort_order || 0,
    p_alt_text: payload.p_alt_text || null
  });
  if (error) {
    console.error("Supabase RPC Error:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(error.message || "An error occurred during the operation.");
  }
  return data;
}

export async function adminUpdatePartImage(payload: {
  p_image_id: string;
  p_sort_order?: number;
  p_alt_text?: string;
}) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.rpc("admin_update_part_image", {
    p_image_id: payload.p_image_id,
    p_sort_order: payload.p_sort_order || 0,
    p_alt_text: payload.p_alt_text || null
  });
  if (error) {
    console.error("Supabase RPC Error:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(error.message || "An error occurred during the operation.");
  }
  return data;
}

export async function adminDeletePartImageMetadata(imageId: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.rpc("admin_delete_part_image_metadata", {
    p_image_id: imageId
  });
  if (error) {
    console.error("Supabase RPC Error:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(error.message || "An error occurred during the operation.");
  }
  return data;
}

// Note: File uploads usually need special handling for server actions if we pass File directly.
// The Next.js app router supports passing FormData or File directly in Server Actions.
// BUT we also need the browser to upload it directly to supabase storage for efficiency...
// Since the prompt says "Use existing private Storage bucket: part-images" and we need to upload FIRST before metadata.
// Actually, uploading from a server action is fine.
export async function uploadPartImage(formData: FormData, partId: string, fileName: string) {
  const file = formData.get("file") as File;
  const supabase = await getSupabase();
  const filePath = `${partId}/${fileName}`;
  const { data, error } = await supabase.storage
    .from("part-images")
    .upload(filePath, file, {
      upsert: true,
    });
  
  if (error) {
    console.error("Supabase Storage Error:", error);
    throw new Error(error.message || "An error occurred during upload.");
  }
  return data; // contains path
}

export async function deletePartImage(storagePath: string) {
  const supabase = await getSupabase();
  const { error } = await supabase.storage
    .from("part-images")
    .remove([storagePath]);
  
  if (error) {
    console.error("Supabase Storage Error:", error);
    throw new Error(error.message || "An error occurred during deletion.");
  }
  return true;
}
