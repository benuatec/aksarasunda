import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const table = process.env.SUPABASE_TABLE;

if (!url || !anonKey || !table) {
  console.error("❌ Environment variables belum lengkap.");
  process.exit(1);
}

const supabase = createClient(url, anonKey);

async function main() {
  const start = Date.now();

  console.log("======================================");
  console.log("🚀 Supabase Keep Alive");
  console.log(`🕒 Time   : ${new Date().toISOString()}`);
  console.log(`📋 Table  : ${table}`);

  const { data, error } = await supabase
    .from(table)
    .select("id")
    .limit(1);

  if (error) {
    console.error("❌ Status : FAILED");
    console.error(error);
    process.exit(1);
  }

  const duration = Date.now() - start;

  console.log(`📊 Rows   : ${data.length}`);
  console.log(`⚡ Time   : ${duration} ms`);
  console.log("✅ Status : SUCCESS");
  console.log("======================================");
}

main();
