#!/usr/bin/env node
/**
 * Restore backup Supabase ke project (perlu service_role key)
 *
 * Cara pakai:
 *   $env:SUPABASE_SERVICE_ROLE_KEY = "eyJ..."
 *   node scripts/restore-supabase.mjs "backups/supabase-20260714074126"
 *
 * ⚠️  HATI-HATI: script ini INSERT data, kalo dijalanin 2x bisa duplikat
 *     kecuali lo hapus data lama dulu
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const SUPABASE_URL = "https://ivxvageeuttcopaffcgq.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const targetDir = process.argv[2];

if (!SERVICE_ROLE_KEY) {
  console.error("Set env dulu: $env:SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
if (!targetDir || !existsSync(targetDir)) {
  console.error("Usage: node restore-supabase.mjs <path-to-backup-folder>");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

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

const log = (...a) => console.log("[restore]", ...a);
const fail = (m) => {
  console.error("[restore] GAGAL:", m);
  process.exit(1);
};

log(`Source: ${targetDir}`);

for (const table of TABLES) {
  const file = join(targetDir, `${table}.json`);
  if (!existsSync(file)) {
    log(`  skip ${table}: file gak ada`);
    continue;
  }

  const rows = JSON.parse(readFileSync(file, "utf8"));
  if (!rows || rows.length === 0) {
    log(`  skip ${table}: 0 baris`);
    continue;
  }

  log(`  ${table}: ${rows.length} baris ...`);

  // batch insert per 500 baris biar gak timeout
  const BATCH = 500;
  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH);
    const { error } = await supabase.from(table).insert(slice);
    if (error) {
      log(`    ! batch ${i}-${i + slice.length}: ${error.message}`);
    } else {
      log(`    + batch ${i}-${i + slice.length} OK`);
    }
  }
}

log("RESTORE SELESAI");
log("Note: jalanin SQL untuk bersihin data lama dulu kalo perlu duplicate");
