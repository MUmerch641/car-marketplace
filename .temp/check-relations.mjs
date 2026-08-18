import dotenv from 'dotenv';
dotenv.config();

async function fetchSchema() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`;
  const res = await fetch(url, {
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Accept': 'application/openapi+json'
    }
  });
  const data = await res.json();
  
  if (data.definitions && data.definitions['parts']) {
    console.log("parts schema:");
    console.log(data.definitions['parts']);
  }
  if (data.definitions && data.definitions['part_images']) {
    console.log("part_images schema:");
    console.log(data.definitions['part_images']);
  }
}

fetchSchema();
