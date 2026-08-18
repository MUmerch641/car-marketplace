import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspect() {
  const { data, error } = await supabase
    .from("part_categories")
    .select("*")
    .eq("is_active", true);
  
  if (error) {
    console.log("SUPABASE ERROR:", error);
  } else {
    console.log("Success part_categories");
  }
}

inspect();
