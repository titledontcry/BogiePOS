const { Client } = require('pg');

async function testConnection(url) {
  console.log(`Testing: ${url}`);
  const client = new Client({ connectionString: url, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    console.log('Success!');
    await client.end();
    return true;
  } catch (err) {
    console.error('Failed:', err.message);
    return false;
  }
}

async function main() {
  const pass = '%21Anggag13579%21';
  const ref = 'watxxhmwsddykfhkhuku';
  
  const urls = [
    `postgresql://postgres.${ref}:${pass}@pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${ref}:${pass}@pooler.supabase.com:5432/postgres`
  ];

  for (const url of urls) {
    await testConnection(url);
  }
}

main();
