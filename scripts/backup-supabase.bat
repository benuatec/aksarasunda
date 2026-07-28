@echo off
REM Backup Supabase Aksara Sunda - jalankan dari PowerShell
REM Edit EMAIL dan PASSWORD di bawah, terus simpen & double-click

setlocal

if "%SUPABASE_ADMIN_EMAIL%"=="" set SUPABASE_ADMIN_EMAIL=ISI_EMAIL_ADMIN_DISINI
if "%SUPABASE_ADMIN_PASSWORD%"=="" set SUPABASE_ADMIN_PASSWORD=ISI_PASSWORD_ADMIN_DISINI

if "%SUPABASE_ADMIN_EMAIL%"=="ISI_EMAIL_ADMIN_DISINI" (
  echo Edit dulu file ini: set email dan password admin Supabase lo
  echo Baris: SUPABASE_ADMIN_EMAIL=... dan SUPABASE_ADMIN_PASSWORD=...
  pause
  exit /b 1
)

cd /d "%~dp0\.."
node scripts\backup-supabase.mjs
pause
