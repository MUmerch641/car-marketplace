import dotenv from 'dotenv';
dotenv.config();

async function fetchSchema() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/?apikey=${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  
  const rpcs = Object.keys(data.paths).filter(p => p.startsWith('/rpc/admin_'));
  
  for (const rpc of rpcs) {
    const details = data.paths[rpc].post;
    if (details) {
      console.log(`\nRPC: ${rpc}`);
      console.log('Parameters:');
      const params = details.parameters || [];
      const bodyParam = params.find(p => p.in === 'body');
      if (bodyParam) {
        console.log(bodyParam.schema);
      }
    }
  }
}

fetchSchema();
