import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspect() {
  const { data, error } = await supabase
    .from("parts")
    .select("*, part_images(*)");
  
  if (error) {
    console.error("SUPABASE ERROR:", error);
  } else {
    console.log("Success, data length:", data.length);
  }
}

inspect();
