
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function keepAlive() {
  const { error } = await supabase
    .from("profiles") // ganti dengan nama tabel Anda
    .select("id")
    .limit(1);

  if (error) {
    console.error(error);
    process.exit(1);
  }

  console.log("✅ Supabase berhasil di-ping");
}

keepAlive();
