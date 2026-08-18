import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Part, PartCategory, PartImage, PartWithImage } from "@/types/parts.types";

export async function getPartCategories(): Promise<PartCategory[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any;
  const { data, error } = await supabase
    .from("part_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching part categories:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    return [];
  }
  return data as PartCategory[];
}

export async function getParts(categoryId?: string): Promise<PartWithImage[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any;
  let query = supabase
    .from("parts")
    .select("*, part_images(*)")
    .eq("is_active", true);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching parts:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    return [];
  }

  return mapPartsWithPrimaryImage(supabase, data);
}

export async function getPartById(id: string): Promise<PartWithImage | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any;
  const { data, error } = await supabase
    .from("parts")
    .select("*, part_images(*)")
    .eq("id", id)
    .single();

  if (error || !data) {
    if (error) {
      console.error("Error fetching part:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
    }
    return null;
  }

  const mapped = await mapPartsWithPrimaryImage(supabase, [data]);
  return mapped[0] || null;
}

export async function getCompatiblePartsForVehicle(garageVehicleId: string): Promise<PartWithImage[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any;
  const { data, error } = await supabase.rpc("get_compatible_parts_for_garage_vehicle", {
    p_garage_vehicle_id: garageVehicleId
  });

  if (error) {
    console.error("Error fetching compatible parts:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    return [];
  }

  // The RPC returns parts, but we also want their images. 
  // Let's fetch all images for the returned part IDs to keep the shape consistent.
  const partIds = (data as Part[]).map(p => p.id);
  
  if (partIds.length === 0) {
    return [];
  }

  const { data: imagesData } = await supabase
    .from("part_images")
    .select("*")
    .in("part_id", partIds);

  // Group images by part_id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imagesByPartId = (imagesData || []).reduce((acc: Record<string, PartImage[]>, img: any) => {
    if (!acc[img.part_id]) {
      acc[img.part_id] = [];
    }
    acc[img.part_id].push(img as PartImage);
    return acc;
  }, {});

  const result: PartWithImage[] = [];
  
  for (const part of (data as Part[])) {
    const images = imagesByPartId[part.id] || [];
    // Sort by sort_order and take the first one
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const primaryImage = images.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))[0] || null;

    let signedPrimaryImage = null;
    if (primaryImage?.storage_path) {
      const adminClient = createAdminClient();
      const { data: signedData } = await adminClient.storage
        .from("part-images")
        .createSignedUrl(primaryImage.storage_path, 3600);
        
      signedPrimaryImage = {
        ...primaryImage,
        storage_path: signedData?.signedUrl || primaryImage.storage_path
      };
    }

    result.push({
      ...part,
      primary_image: signedPrimaryImage
    });
  }

  return result;
}

// Helper to extract the primary image from a join query response and generate signed URL
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function mapPartsWithPrimaryImage(supabase: any, data: any[]): Promise<PartWithImage[]> {
  const result: PartWithImage[] = [];
  
  for (const item of data) {
    const images = item.part_images || [];
    // Sort images by sort_order and take the first one
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sortedImages = Array.isArray(images) ? [...images].sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)) : [];
    const primaryImage = sortedImages[0] || (Array.isArray(images) ? images[0] : images) || null;

    let signedPrimaryImage = null;
    if (primaryImage?.storage_path) {
      const adminClient = createAdminClient();
      const { data: signedData } = await adminClient.storage
        .from("part-images")
        .createSignedUrl(primaryImage.storage_path, 3600); // 1 hour expiry
        
      signedPrimaryImage = {
        ...primaryImage,
        storage_path: signedData?.signedUrl || primaryImage.storage_path
      };
    }

    // Clean up the object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { part_images, ...partData } = item;
    
    result.push({
      ...(partData as Part),
      primary_image: signedPrimaryImage
    });
  }
  
  return result;
}
