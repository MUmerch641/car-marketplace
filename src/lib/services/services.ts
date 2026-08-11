import { createClient } from "@/lib/supabase/server";

export type PublicService = {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  basePrice: number;
  estimatedDurationMinutes: number | null;
};

function mapService(row: { id: string; name: string; slug: string; description: string; short_description: string | null; base_price: number; estimated_duration_minutes: number | null }): PublicService {
  return { id: row.id, name: row.name, slug: row.slug, description: row.description, shortDescription: row.short_description, basePrice: Number(row.base_price), estimatedDurationMinutes: row.estimated_duration_minutes };
}

export async function getActiveServices(limit?: number) {
  const supabase = await createClient();
  let query = supabase.from("service_types").select("id,name,slug,description,short_description,base_price,estimated_duration_minutes").eq("is_active", true).order("name");
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw new Error("Unable to load services.");
  return (data ?? []).map(mapService);
}

export async function getActiveService(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("service_types").select("id,name,slug,description,short_description,base_price,estimated_duration_minutes").eq("slug", slug).eq("is_active", true).maybeSingle();
  if (error) throw new Error("Unable to load this service.");
  return data ? mapService(data) : null;
}
