import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rjhsgtpkifmfunemvezw.supabase.co';
const supabaseKey = 'sb_publishable_TvFz12OXNPUSciYA6fK23Q_lkWQm5vr'; // NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  let query = supabase.from("cars").select("id, make, model, variant, year, price, mileage, fuel_type, transmission, city, is_verified, is_featured, status, created_at, car_images(storage_path,is_primary)").eq("status", "active").order("published_at", { ascending: false }).limit(4);
  const { data, error } = await query;
  console.log("Error:", error);
}

test();
