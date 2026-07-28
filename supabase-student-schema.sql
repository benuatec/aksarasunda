create extension if not exists "pgcrypto";

create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  class_name text not null check (
    class_name in (
      '10 Satu',
      '10 Dua',
      '10 Tiga',
      '10 Empat',
      '10 Lima',
      '10 Enam',
      '10 Tujuh',
      '10 Delapan',
      '10 Sembilan',
      '10 Sepuluh',
      '10 Sebelas',
      '10 Dua Belas',
      '10 Tiga Belas'
    )
  ),
  password_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_name, display_name)
);

create table if not exists public.student_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.student_progress (
  student_id uuid primary key references public.students(id) on delete cascade,
  highest_level integer not null default 1,
  total_score integer not null default 0,
  total_plays integer not null default 0,
  music_enabled boolean not null default true,
  sfx_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  level_number integer not null,
  level_title text not null,
  score integer not null default 0,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  total_questions integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.reading_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  prompt_text text not null,
  expected_text text not null,
  answer_text text not null,
  is_correct boolean not null,
  created_at timestamptz not null default now()
);

create table if not exists public.tracing_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  target_text text not null,
  completed boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.admin_profiles(id) on delete set null,
  action text not null,
  target_student_id uuid references public.students(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where id = auth.uid()
  );
$$;

alter table public.admin_profiles enable row level security;
alter table public.students enable row level security;
alter table public.student_sessions enable row level security;
alter table public.student_progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.reading_attempts enable row level security;
alter table public.tracing_attempts enable row level security;
alter table public.admin_audit_logs enable row level security;

-- Do not create anon policies for private student tables.
-- Access these tables through Supabase Edge Functions using the service role key.
-- Admin-facing Edge Functions should verify public.is_admin() before using service-role access.

create policy "admin_profiles_select_own"
  on public.admin_profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "admin_profiles_select_for_admin"
  on public.admin_profiles for select
  to authenticated
  using (public.is_admin());

create policy "admin_audit_logs_select_admin"
  on public.admin_audit_logs for select
  to authenticated
  using (public.is_admin());
