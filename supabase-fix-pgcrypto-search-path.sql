-- Fix for Supabase pgcrypto functions such as gen_salt(), crypt(), digest(), and gen_random_bytes().
-- Run this after supabase-complete-setup.sql if student_register() fails with:
-- function gen_salt(unknown, integer) does not exist

create schema if not exists extensions;
create extension if not exists "pgcrypto" with schema extensions;

alter function public.is_admin()
  set search_path = public, extensions;

alter function public._student_payload(uuid)
  set search_path = public, extensions;

alter function public._create_student_session(uuid)
  set search_path = public, extensions;

alter function public._student_id_from_token(text)
  set search_path = public, extensions;

alter function public.student_register(text, text, text)
  set search_path = public, extensions;

alter function public.student_login(text, text, text)
  set search_path = public, extensions;

alter function public.student_logout(text)
  set search_path = public, extensions;

alter function public.student_me(text)
  set search_path = public, extensions;

alter function public.update_student_settings(text, boolean, boolean)
  set search_path = public, extensions;

alter function public.finish_quiz(text, integer, text, integer, integer, integer, integer)
  set search_path = public, extensions;

alter function public.save_reading_attempt(text, text, text, text, boolean)
  set search_path = public, extensions;

alter function public.save_tracing_attempt(text, text, boolean)
  set search_path = public, extensions;

alter function public.admin_list_students(text, text)
  set search_path = public, extensions;

alter function public.admin_create_student(text, text, text)
  set search_path = public, extensions;

alter function public.admin_update_student(uuid, text, text, boolean)
  set search_path = public, extensions;

alter function public.admin_reset_student_password(uuid, text)
  set search_path = public, extensions;

alter function public.admin_reset_student_progress(uuid)
  set search_path = public, extensions;

alter function public.admin_delete_student(uuid)
  set search_path = public, extensions;

-- Test after running:
-- select public.student_register('Budi', '10 Satu', '1234');
