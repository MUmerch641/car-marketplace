import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspect() {
  const { data, error } = await supabase.rpc('get_compatible_parts_for_garage_vehicle', { garage_vehicle_id: '00000000-0000-0000-0000-000000000000' });
  console.log("With garage_vehicle_id:", error ? error.message : "Success");
  
  if (error && error.message.includes('Could not find')) {
    const { data: data2, error: error2 } = await supabase.rpc('get_compatible_parts_for_garage_vehicle', { p_garage_vehicle_id: '00000000-0000-0000-0000-000000000000' });
    console.log("With p_garage_vehicle_id:", error2 ? error2.message : "Success");
  }
}

inspect();
