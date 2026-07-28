#!/usr/bin/env node
/**
 * Backup Supabase untuk Game Aksara Sunda
 *
 * Cara pakai (di PowerShell):
 *   $env:SUPABASE_ADMIN_EMAIL = "email-admin-lo@gmail.com"
 *   $env:SUPABASE_ADMIN_PASSWORD = "password-admin-lo"
 *   node scripts/backup-supabase.mjs
 *
 * Output: folder backups/supabase-YYYYMMDD-HHmmss/ berisi JSON per tabel
 */

import { createClient } from "@supabase/supabase-js";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const SUPABASE_URL = "https://ivxvageeuttcopaffcgq.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2eHZhZ2VldXR0Y29wYWZmY2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0NDA0NzQsImV4cCI6MjA5NDAxNjQ3NH0.NZ8jIXyjXfSL9dn-bXnfKWTZ8yG05qyRquLWPw6HaTI";

const TABLES = [
  "admin_profiles",
  "students",
  "student_sessions",
  "student_progress",
  "quiz_attempts",
  "reading_attempts",
  "tracing_attempts",
  "admin_audit_logs",
];

const stamp = new Date()
  .toISOString()
  .replace(/[-:T]/g, "")
  .replace(/\..+/, "")
  .slice(0, 15); // YYYYMMDDHHmmss
const outDir = join(process.cwd(), "backups", `supabase-${stamp}`);
mkdirSync(outDir, { recursive: true });

const log = (...a) => console.log("[backup]", ...a);
const fail = (msg) => {
  console.error("[backup] GAGAL:", msg);
  process.exit(1);
};

const email = process.env.SUPABASE_ADMIN_EMAIL;
const password = process.env.SUPABASE_ADMIN_PASSWORD;

if (!email || !password) {
  fail(
    "Set env dulu: $env:SUPABASE_ADMIN_EMAIL dan $env:SUPABASE_ADMIN_PASSWORD",
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

log(`Output folder: ${outDir}`);
log(`Login sebagai ${email} ...`);

const { data: signIn, error: signErr } =
  await supabase.auth.signInWithPassword({ email, password });

if (signErr || !signIn?.session) {
  fail(`Login gagal: ${signErr?.message ?? "no session"}`);
}

log("Login OK. Mulai pull data per tabel...");

const summary = { pulledAt: new Date().toISOString(), tables: {} };

for (const table of TABLES) {
  const all = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .range(from, from + pageSize - 1);

    if (error) {
      log(`  ! ${table}: ${error.message}`);
      summary.tables[table] = { error: error.message };
      break;
    }
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  const filePath = join(outDir, `${table}.json`);
  writeFileSync(filePath, JSON.stringify(all, null, 2), "utf8");
  summary.tables[table] = { count: all.length, file: filePath };
  log(`  ${table}: ${all.length} baris -> ${table}.json`);
}

writeFileSync(
  join(outDir, "_summary.json"),
  JSON.stringify(summary, null, 2),
  "utf8",
);

log("");
log("=================================");
log("BACKUP SELESAI");
log("=================================");
log("Files:");
for (const t of Object.keys(summary.tables)) {
  const s = summary.tables[t];
  if (s.error) log(`  ! ${t}: ERROR - ${s.error}`);
  else log(`  + ${t}.json (${s.count} baris)`);
}
log("");
log(`Lokasi: ${outDir}`);
log("");
log("LANGKAH SELANJUTNYA:");
log("1. Cek file _summary.json untuk validasi");
log("2. Simpan folder backup ke tempat aman (Drive/Hardisk)");
log("3. Untuk restore: insert balik via SQL Editor atau psql");
