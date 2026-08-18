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
  
  if (!data.paths) {
    console.log("No paths found. Response:", data);
    return;
  }

  const rpcs = Object.keys(data.paths).filter(p => p.startsWith('/rpc/admin_'));
  
  for (const rpc of rpcs) {
    const details = data.paths[rpc].post;
    if (details) {
      console.log(`\nRPC: ${rpc}`);
      const params = details.parameters || [];
      const bodyParam = params.find(p => p.in === 'body');
      if (bodyParam) {
        console.log(JSON.stringify(bodyParam.schema.properties, null, 2));
      } else {
        console.log("No body parameter");
      }
    }
  }

  // Also let's inspect the `part_vehicle_compatibility` table
  console.log('\n--- part_vehicle_compatibility schema ---');
  if (data.definitions && data.definitions['part_vehicle_compatibility']) {
    console.log(JSON.stringify(data.definitions['part_vehicle_compatibility'].properties, null, 2));
  }
}

fetchSchema();
