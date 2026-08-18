import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspect() {
  console.log("Fetching parts...");
  const { data: parts, error: partsError } = await supabase.from('parts').select('*').limit(1);
  console.log(partsError ? "Error: " + partsError.message : "Parts structure:", parts?.[0] ? Object.keys(parts[0]) : "Empty table");
  if (parts?.[0]) console.log("Example part:", parts[0]);

  console.log("Fetching part_categories...");
  const { data: cats, error: catsError } = await supabase.from('part_categories').select('*').limit(1);
  console.log(catsError ? "Error: " + catsError.message : "Categories structure:", cats?.[0] ? Object.keys(cats[0]) : "Empty table");
  if (cats?.[0]) console.log("Example cat:", cats[0]);

  console.log("Fetching part_images...");
  const { data: imgs, error: imgsError } = await supabase.from('part_images').select('*').limit(1);
  if (imgs?.[0]) console.log("Example image:", imgs[0]);
  
  // Test RPC with a dummy ID just to see if it exists
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_compatible_parts_for_garage_vehicle', { p_vehicle_id: '00000000-0000-0000-0000-000000000000' });
  console.log(rpcError ? "RPC Error: " + rpcError.message : "RPC response structure (length): " + (rpcData ? rpcData.length : 'null'));
}

inspect();
