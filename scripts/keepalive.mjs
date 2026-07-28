import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function main() {
  console.log(`🚀 ${new Date().toISOString()}`);
  console.log(`📋 Table: ${process.env.SUPABASE_TABLE}`);

  const { error } = await supabase
    .from(process.env.SUPABASE_TABLE)
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
