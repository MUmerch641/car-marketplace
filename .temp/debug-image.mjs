import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const anonSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

async function testSignedUrl() {
  const { data: parts } = await adminSupabase.from("part_images").select("*").limit(1);
  if (!parts || parts.length === 0) {
    console.log("No images");
    return;
  }
  const path = parts[0].storage_path;
  console.log("Testing path:", path);
  
  const resAdmin = await adminSupabase.storage.from("part-images").createSignedUrl(path, 3600);
  console.log("Admin Signed URL result:", !!resAdmin.data?.signedUrl, resAdmin.error?.message);
  
  const resAnon = await anonSupabase.storage.from("part-images").createSignedUrl(path, 3600);
  console.log("Anon Signed URL result:", !!resAnon.data?.signedUrl, resAnon.error?.message);
}

testSignedUrl();
