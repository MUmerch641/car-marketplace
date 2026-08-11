import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const RETENTION_DAYS = 30;

Deno.serve(async (request) => {
  const cronSecret = Deno.env.get("CLEANUP_CRON_SECRET");
  if (!cronSecret || request.headers.get("x-cleanup-secret") !== cronSecret) {
    return Response.json({ error: "Unauthorised" }, { status: 401 });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) return Response.json({ error: "Function configuration is incomplete" }, { status: 500 });
  const supabase = createClient(url, serviceRoleKey);
  const { data: images, error } = await supabase
    .from("car_images")
    .select("id, storage_path, cars!inner(status, sold_at, archived_at)")
    .in("cars.status", ["sold", "archived"])
    .limit(100);

  if (error) {
    console.error("Failed to load eligible images", error);
    return Response.json({ error: "Unable to load eligible images" }, { status: 500 });
  }

  let deleted = 0;
  const failures: string[] = [];
  const cutoff = Date.now() - RETENTION_DAYS * 86_400_000;
  const eligible = (images ?? []).filter((image) => {
    const car = Array.isArray(image.cars) ? image.cars[0] : image.cars;
    const retainedUntil = car?.sold_at ?? car?.archived_at;
    return retainedUntil && new Date(retainedUntil).getTime() < cutoff;
  });
  for (const image of eligible) {
    const { error: storageError } = await supabase.storage.from("car-images").remove([image.storage_path]);
    if (storageError) {
      console.error("Storage removal failed", { imageId: image.id, storageError });
      failures.push(image.id);
      continue;
    }
    const { error: metadataError } = await supabase.from("car_images").delete().eq("id", image.id);
    if (metadataError) {
      console.error("Metadata removal failed after storage deletion", { imageId: image.id, metadataError });
      failures.push(image.id);
      continue;
    }
    deleted += 1;
  }

  return Response.json({ deleted, failures, retentionDays: RETENTION_DAYS });
});
