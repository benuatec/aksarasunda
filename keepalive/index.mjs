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
  console.log(`🚀 ${new Date().toISOString()}`);
  console.log(`📋 Pinging table: ${table}`);

  const { error } = await supabase
    .from(table)
    .select("id")
    .limit(1);

  if (error) {
    console.error("❌ Keep Alive gagal");
    console.error(error);
    process.exit(1);
  }

  console.log("✅ Keep Alive berhasil");
}

main();
