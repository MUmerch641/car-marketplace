import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Use anon key to simulate client with no active session, or just service role
);

async function inspect() {
  const { data, error } = await supabase
    .from("parts")
    .select("*, part_images(*)");
  
  if (error) {
    console.log("SUPABASE ERROR:", error);
  } else {
    console.log("Success, data length:", data.length);
  }
}

inspect();
