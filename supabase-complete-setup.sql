-- Game Aksara Sunda - Supabase complete setup
-- Paste this file into Supabase SQL Editor and run it once on a fresh project.

create schema if not exists extensions;
create extension if not exists "pgcrypto" with schema extensions;

create or replace function public.normalize_student_name(input_name text)
returns text
language sql
immutable
as $$
  select lower(regexp_replace(trim(coalesce(input_name, '')), '\s+', ' ', 'g'));
$$;

create or replace function public.is_valid_class_name(input_class text)
returns boolean
language sql
immutable
as $$
  select input_class in (
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
  );
$$;

create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  display_name_key text not null,
  class_name text not null check (public.is_valid_class_name(class_name)),
  avatar_key text not null default 'boy' check (avatar_key in ('boy', 'girl')),
  password_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_name, display_name_key)
);

alter table public.students
  add column if not exists avatar_key text not null default 'boy';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'students_avatar_key_check'
      and conrelid = 'public.students'::regclass
  ) then
    alter table public.students
      add constraint students_avatar_key_check check (avatar_key in ('boy', 'girl'));
  end if;
end;
$$;

create table if not exists public.student_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.student_progress (
  student_id uuid primary key references public.students(id) on delete cascade,
  highest_level integer not null default 1 check (highest_level between 1 and 4),
  total_score integer not null default 0 check (total_score >= 0),
  total_plays integer not null default 0 check (total_plays >= 0),
  music_enabled boolean not null default true,
  sfx_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  level_number integer not null check (level_number between 1 and 4),
  level_title text not null,
  score integer not null default 0 check (score >= 0),
  correct_count integer not null default 0 check (correct_count >= 0),
  wrong_count integer not null default 0 check (wrong_count >= 0),
  total_questions integer not null default 0 check (total_questions >= 0),
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

create index if not exists students_class_name_idx on public.students (class_name);
create index if not exists students_active_idx on public.students (is_active);
create index if not exists student_sessions_student_id_idx on public.student_sessions (student_id);
create index if not exists student_sessions_expires_at_idx on public.student_sessions (expires_at);
create index if not exists quiz_attempts_student_id_idx on public.quiz_attempts (student_id);
create index if not exists quiz_attempts_created_at_idx on public.quiz_attempts (created_at desc);
create index if not exists reading_attempts_student_id_idx on public.reading_attempts (student_id);
create index if not exists tracing_attempts_student_id_idx on public.tracing_attempts (student_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_student_display_name_key()
returns trigger
language plpgsql
as $$
begin
  new.display_name = regexp_replace(trim(new.display_name), '\s+', ' ', 'g');
  new.display_name_key = public.normalize_student_name(new.display_name);
  return new;
end;
$$;

drop trigger if exists students_touch_updated_at on public.students;
create trigger students_touch_updated_at
  before update on public.students
  for each row execute function public.touch_updated_at();

drop trigger if exists student_progress_touch_updated_at on public.student_progress;
create trigger student_progress_touch_updated_at
  before update on public.student_progress
  for each row execute function public.touch_updated_at();

drop trigger if exists students_set_display_name_key on public.students;
create trigger students_set_display_name_key
  before insert or update of display_name on public.students
  for each row execute function public.set_student_display_name_key();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public, extensions
as $$
  select exists (
    select 1
    from public.admin_profiles
    where id = auth.uid()
  );
$$;

create or replace function public._student_payload(input_student_id uuid)
returns jsonb
language sql
security definer
set search_path = public, extensions
as $$
  select jsonb_build_object(
    'student',
    jsonb_build_object(
      'id', s.id,
      'display_name', s.display_name,
      'class_name', s.class_name,
      'avatar_key', s.avatar_key,
      'is_active', s.is_active
    ),
    'progress',
    jsonb_build_object(
      'highest_level', sp.highest_level,
      'total_score', sp.total_score,
      'total_plays', sp.total_plays,
      'music_enabled', sp.music_enabled,
      'sfx_enabled', sp.sfx_enabled,
      'updated_at', sp.updated_at
    ),
    'history',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'date',
            trim(to_char(qa.created_at at time zone 'Asia/Jakarta', 'DD TMMonth YYYY')),
            'level',
            qa.level_number,
            'score',
            qa.score
          )
          order by qa.created_at desc
        )
        from (
          select created_at, level_number, score
          from public.quiz_attempts
          where student_id = s.id
          order by created_at desc
          limit 8
        ) qa
      ),
      '[]'::jsonb
    )
  )
  from public.students s
  join public.student_progress sp on sp.student_id = s.id
  where s.id = input_student_id;
$$;

create or replace function public._create_student_session(input_student_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  raw_token text := encode(gen_random_bytes(32), 'hex');
  session_expires_at timestamptz := now() + interval '30 days';
begin
  delete from public.student_sessions
  where student_id = input_student_id
    and expires_at < now();

  insert into public.student_sessions (student_id, token_hash, expires_at)
  values (
    input_student_id,
    encode(digest(raw_token, 'sha256'), 'hex'),
    session_expires_at
  );

  return jsonb_build_object(
    'session_token', raw_token,
    'expires_at', session_expires_at
  );
end;
$$;

create or replace function public._student_id_from_token(input_session_token text)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  found_student_id uuid;
begin
  if input_session_token is null or length(trim(input_session_token)) < 20 then
    raise exception 'INVALID_SESSION';
  end if;

  select ss.student_id
    into found_student_id
  from public.student_sessions ss
  join public.students s on s.id = ss.student_id
  where ss.token_hash = encode(digest(input_session_token, 'sha256'), 'hex')
    and ss.expires_at > now()
    and s.is_active = true
  limit 1;

  if found_student_id is null then
    raise exception 'INVALID_SESSION';
  end if;

  return found_student_id;
end;
$$;

create or replace function public.student_register(
  input_display_name text,
  input_class_name text,
  input_password text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  clean_name text := regexp_replace(trim(coalesce(input_display_name, '')), '\s+', ' ', 'g');
  new_student_id uuid;
begin
  if char_length(clean_name) < 2 then
    raise exception 'NAME_TOO_SHORT';
  end if;

  if not public.is_valid_class_name(input_class_name) then
    raise exception 'INVALID_CLASS';
  end if;

  if char_length(coalesce(input_password, '')) < 4 then
    raise exception 'PASSWORD_TOO_SHORT';
  end if;

  insert into public.students (display_name, class_name, password_hash)
  values (clean_name, input_class_name, crypt(input_password, gen_salt('bf', 10)))
  returning id into new_student_id;

  insert into public.student_progress (student_id)
  values (new_student_id);

  return public._student_payload(new_student_id)
    || public._create_student_session(new_student_id);
exception
  when unique_violation then
    raise exception 'STUDENT_ALREADY_EXISTS';
end;
$$;

create or replace function public.student_login(
  input_display_name text,
  input_class_name text,
  input_password text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  found_student_id uuid;
  found_password_hash text;
begin
  select id, password_hash
    into found_student_id, found_password_hash
  from public.students
  where class_name = input_class_name
    and display_name_key = public.normalize_student_name(input_display_name)
    and is_active = true
  limit 1;

  if found_student_id is null then
    raise exception 'INVALID_LOGIN';
  end if;

  if found_password_hash <> crypt(coalesce(input_password, ''), found_password_hash) then
    raise exception 'INVALID_LOGIN';
  end if;

  return public._student_payload(found_student_id)
    || public._create_student_session(found_student_id);
end;
$$;

create or replace function public.student_logout(input_session_token text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  delete from public.student_sessions
  where token_hash = encode(digest(input_session_token, 'sha256'), 'hex');

  return true;
end;
$$;

create or replace function public.student_me(input_session_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  found_student_id uuid;
begin
  found_student_id := public._student_id_from_token(input_session_token);
  return public._student_payload(found_student_id);
end;
$$;

create or replace function public.update_student_settings(
  input_session_token text,
  input_music_enabled boolean,
  input_sfx_enabled boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  found_student_id uuid;
begin
  found_student_id := public._student_id_from_token(input_session_token);

  update public.student_progress
  set
    music_enabled = coalesce(input_music_enabled, music_enabled),
    sfx_enabled = coalesce(input_sfx_enabled, sfx_enabled)
  where student_id = found_student_id;

  return public._student_payload(found_student_id);
end;
$$;

create or replace function public.update_student_avatar(
  input_session_token text,
  input_avatar_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  found_student_id uuid;
begin
  found_student_id := public._student_id_from_token(input_session_token);

  if input_avatar_key not in ('boy', 'girl') then
    raise exception 'INVALID_AVATAR';
  end if;

  update public.students
  set avatar_key = input_avatar_key
  where id = found_student_id;

  return public._student_payload(found_student_id);
end;
$$;

create or replace function public.record_activity_progress(
  input_session_token text,
  input_score integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  found_student_id uuid;
  safe_score integer := greatest(coalesce(input_score, 0), 0);
begin
  found_student_id := public._student_id_from_token(input_session_token);

  update public.student_progress
  set
    total_score = total_score + safe_score,
    total_plays = total_plays + 1
  where student_id = found_student_id;

  return public._student_payload(found_student_id);
end;
$$;

create or replace function public.finish_quiz(
  input_session_token text,
  input_level_number integer,
  input_level_title text,
  input_score integer,
  input_correct_count integer,
  input_wrong_count integer,
  input_total_questions integer
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  found_student_id uuid;
  passed boolean;
  unlocked_level integer;
begin
  found_student_id := public._student_id_from_token(input_session_token);

  if input_level_number not between 1 and 4 then
    raise exception 'INVALID_LEVEL';
  end if;

  if input_total_questions <= 0 then
    raise exception 'INVALID_TOTAL_QUESTIONS';
  end if;

  if input_score < 0 or input_correct_count < 0 or input_wrong_count < 0 then
    raise exception 'INVALID_SCORE';
  end if;

  passed := (input_correct_count::numeric / input_total_questions::numeric) >= 0.7;
  unlocked_level := case
    when passed then least(4, input_level_number + 1)
    else input_level_number
  end;

  insert into public.quiz_attempts (
    student_id,
    level_number,
    level_title,
    score,
    correct_count,
    wrong_count,
    total_questions
  )
  values (
    found_student_id,
    input_level_number,
    coalesce(nullif(trim(input_level_title), ''), 'Level ' || input_level_number),
    input_score,
    input_correct_count,
    input_wrong_count,
    input_total_questions
  );

  update public.student_progress
  set
    total_score = total_score + input_score,
    total_plays = total_plays + 1,
    highest_level = greatest(highest_level, unlocked_level)
  where student_id = found_student_id;

  return public._student_payload(found_student_id)
    || jsonb_build_object('passed', passed);
end;
$$;

create or replace function public.sync_student_local_progress(
  input_session_token text,
  input_total_score integer default 0,
  input_highest_level integer default 1,
  input_total_plays integer default 0
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  found_student_id uuid;
  safe_total_score integer := greatest(coalesce(input_total_score, 0), 0);
  safe_highest_level integer := least(4, greatest(coalesce(input_highest_level, 1), 1));
  safe_total_plays integer := greatest(coalesce(input_total_plays, 0), 0);
begin
  found_student_id := public._student_id_from_token(input_session_token);

  update public.student_progress
  set
    total_score = greatest(total_score, safe_total_score),
    highest_level = greatest(highest_level, safe_highest_level),
    total_plays = greatest(total_plays, safe_total_plays)
  where student_id = found_student_id;

  return public._student_payload(found_student_id);
end;
$$;

create or replace function public.save_reading_attempt(
  input_session_token text,
  input_prompt_text text,
  input_expected_text text,
  input_answer_text text,
  input_is_correct boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  found_student_id uuid;
begin
  found_student_id := public._student_id_from_token(input_session_token);

  insert into public.reading_attempts (
    student_id,
    prompt_text,
    expected_text,
    answer_text,
    is_correct
  )
  values (
    found_student_id,
    input_prompt_text,
    input_expected_text,
    input_answer_text,
    input_is_correct
  );

  return public._student_payload(found_student_id);
end;
$$;

create or replace function public.save_tracing_attempt(
  input_session_token text,
  input_target_text text,
  input_completed boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  found_student_id uuid;
begin
  found_student_id := public._student_id_from_token(input_session_token);

  insert into public.tracing_attempts (student_id, target_text, completed)
  values (found_student_id, input_target_text, coalesce(input_completed, true));

  return public._student_payload(found_student_id);
end;
$$;

drop function if exists public.admin_list_students(text, text);

create or replace function public.admin_list_students(
  input_class_name text default null,
  input_search text default null
)
returns table (
  id uuid,
  display_name text,
  class_name text,
  avatar_key text,
  is_active boolean,
  highest_level integer,
  total_score integer,
  total_plays integer,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;

  return query
  select
    s.id,
    s.display_name,
    s.class_name,
    s.avatar_key,
    s.is_active,
    sp.highest_level,
    sp.total_score,
    sp.total_plays,
    s.created_at,
    s.updated_at
  from public.students s
  join public.student_progress sp on sp.student_id = s.id
  where (input_class_name is null or s.class_name = input_class_name)
    and (
      input_search is null
      or public.normalize_student_name(s.display_name) like '%' || public.normalize_student_name(input_search) || '%'
    )
  order by s.class_name, s.display_name;
end;
$$;

create or replace function public.admin_create_student(
  input_display_name text,
  input_class_name text,
  input_password text
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  clean_name text := regexp_replace(trim(coalesce(input_display_name, '')), '\s+', ' ', 'g');
  new_student_id uuid;
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;

  if char_length(clean_name) < 2 then
    raise exception 'NAME_TOO_SHORT';
  end if;

  if not public.is_valid_class_name(input_class_name) then
    raise exception 'INVALID_CLASS';
  end if;

  if char_length(coalesce(input_password, '')) < 4 then
    raise exception 'PASSWORD_TOO_SHORT';
  end if;

  insert into public.students (display_name, class_name, password_hash)
  values (clean_name, input_class_name, crypt(input_password, gen_salt('bf', 10)))
  returning id into new_student_id;

  insert into public.student_progress (student_id)
  values (new_student_id);

  insert into public.admin_audit_logs (admin_id, action, target_student_id)
  values (auth.uid(), 'admin_create_student', new_student_id);

  return public._student_payload(new_student_id);
exception
  when unique_violation then
    raise exception 'STUDENT_ALREADY_EXISTS';
end;
$$;

create or replace function public.admin_update_student(
  input_student_id uuid,
  input_display_name text default null,
  input_class_name text default null,
  input_is_active boolean default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  final_class_name text;
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;

  select coalesce(input_class_name, class_name)
    into final_class_name
  from public.students
  where id = input_student_id;

  if final_class_name is null then
    raise exception 'STUDENT_NOT_FOUND';
  end if;

  if not public.is_valid_class_name(final_class_name) then
    raise exception 'INVALID_CLASS';
  end if;

  update public.students
  set
    display_name = coalesce(nullif(trim(input_display_name), ''), display_name),
    class_name = final_class_name,
    is_active = coalesce(input_is_active, is_active)
  where id = input_student_id;

  if not found then
    raise exception 'STUDENT_NOT_FOUND';
  end if;

  insert into public.admin_audit_logs (admin_id, action, target_student_id)
  values (auth.uid(), 'admin_update_student', input_student_id);

  return public._student_payload(input_student_id);
exception
  when unique_violation then
    raise exception 'STUDENT_ALREADY_EXISTS';
end;
$$;

create or replace function public.admin_reset_student_password(
  input_student_id uuid,
  input_new_password text
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;

  if char_length(coalesce(input_new_password, '')) < 4 then
    raise exception 'PASSWORD_TOO_SHORT';
  end if;

  update public.students
  set password_hash = crypt(input_new_password, gen_salt('bf', 10))
  where id = input_student_id;

  if not found then
    raise exception 'STUDENT_NOT_FOUND';
  end if;

  delete from public.student_sessions
  where student_id = input_student_id;

  insert into public.admin_audit_logs (admin_id, action, target_student_id)
  values (auth.uid(), 'admin_reset_student_password', input_student_id);

  return true;
end;
$$;

create or replace function public.admin_reset_student_progress(input_student_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;

  update public.student_progress
  set
    highest_level = 1,
    total_score = 0,
    total_plays = 0
  where student_id = input_student_id;

  if not found then
    raise exception 'STUDENT_NOT_FOUND';
  end if;

  delete from public.quiz_attempts where student_id = input_student_id;
  delete from public.reading_attempts where student_id = input_student_id;
  delete from public.tracing_attempts where student_id = input_student_id;

  insert into public.admin_audit_logs (admin_id, action, target_student_id)
  values (auth.uid(), 'admin_reset_student_progress', input_student_id);

  return public._student_payload(input_student_id);
end;
$$;

create or replace function public.admin_delete_student(input_student_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;

  if not exists (select 1 from public.students where id = input_student_id) then
    raise exception 'STUDENT_NOT_FOUND';
  end if;

  insert into public.admin_audit_logs (admin_id, action, target_student_id)
  values (auth.uid(), 'admin_delete_student', input_student_id);

  delete from public.students
  where id = input_student_id;

  return true;
end;
$$;

create or replace function public.admin_list_admins()
returns table (
  id uuid,
  email text,
  display_name text,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;

  return query
  select
    ap.id,
    coalesce(u.email, ap.email) as email,
    ap.display_name,
    ap.created_at,
    u.last_sign_in_at
  from public.admin_profiles ap
  left join auth.users u on u.id = ap.id
  order by ap.created_at desc;
end;
$$;

create or replace function public.admin_add_admin_by_email(
  input_email text,
  input_display_name text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  clean_email text := lower(trim(coalesce(input_email, '')));
  found_user_id uuid;
  found_email text;
  found_last_sign_in_at timestamptz;
  final_display_name text;
  admin_created_at timestamptz;
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;

  if clean_email = '' or position('@' in clean_email) = 0 then
    raise exception 'INVALID_EMAIL';
  end if;

  select u.id, u.email, u.last_sign_in_at
    into found_user_id, found_email, found_last_sign_in_at
  from auth.users u
  where lower(u.email) = clean_email
  limit 1;

  if found_user_id is null then
    raise exception 'AUTH_USER_NOT_FOUND';
  end if;

  final_display_name := coalesce(nullif(trim(input_display_name), ''), split_part(found_email, '@', 1), 'Admin');

  insert into public.admin_profiles (id, email, display_name)
  values (found_user_id, found_email, final_display_name)
  on conflict (id) do update
  set
    email = excluded.email,
    display_name = excluded.display_name
  returning created_at into admin_created_at;

  insert into public.admin_audit_logs (admin_id, action, metadata)
  values (
    auth.uid(),
    'admin_add_admin_by_email',
    jsonb_build_object('target_admin_id', found_user_id, 'target_email', found_email)
  );

  return jsonb_build_object(
    'id', found_user_id,
    'email', found_email,
    'display_name', final_display_name,
    'created_at', admin_created_at,
    'last_sign_in_at', found_last_sign_in_at
  );
end;
$$;

create or replace function public.admin_update_admin(
  input_admin_id uuid,
  input_display_name text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  clean_display_name text := regexp_replace(trim(coalesce(input_display_name, '')), '\s+', ' ', 'g');
  updated_email text;
  updated_display_name text;
  updated_created_at timestamptz;
  updated_last_sign_in_at timestamptz;
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;

  if char_length(clean_display_name) < 2 then
    raise exception 'NAME_TOO_SHORT';
  end if;

  update public.admin_profiles
  set display_name = clean_display_name
  where id = input_admin_id
  returning email, display_name, created_at
    into updated_email, updated_display_name, updated_created_at;

  if not found then
    raise exception 'ADMIN_NOT_FOUND';
  end if;

  select u.last_sign_in_at
    into updated_last_sign_in_at
  from auth.users u
  where u.id = input_admin_id;

  insert into public.admin_audit_logs (admin_id, action, metadata)
  values (
    auth.uid(),
    'admin_update_admin',
    jsonb_build_object('target_admin_id', input_admin_id)
  );

  return jsonb_build_object(
    'id', input_admin_id,
    'email', updated_email,
    'display_name', updated_display_name,
    'created_at', updated_created_at,
    'last_sign_in_at', updated_last_sign_in_at
  );
end;
$$;

create or replace function public.admin_remove_admin(input_admin_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  if not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;

  if input_admin_id = auth.uid() then
    raise exception 'CANNOT_REMOVE_SELF';
  end if;

  if (select count(*) from public.admin_profiles) <= 1 then
    raise exception 'CANNOT_REMOVE_LAST_ADMIN';
  end if;

  delete from public.admin_profiles
  where id = input_admin_id;

  if not found then
    raise exception 'ADMIN_NOT_FOUND';
  end if;

  insert into public.admin_audit_logs (admin_id, action, metadata)
  values (
    auth.uid(),
    'admin_remove_admin',
    jsonb_build_object('target_admin_id', input_admin_id)
  );

  return true;
end;
$$;

alter table public.admin_profiles enable row level security;
alter table public.students enable row level security;
alter table public.student_sessions enable row level security;
alter table public.student_progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.reading_attempts enable row level security;
alter table public.tracing_attempts enable row level security;
alter table public.admin_audit_logs enable row level security;

drop policy if exists "admin_profiles_select_own" on public.admin_profiles;
create policy "admin_profiles_select_own"
  on public.admin_profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "admin_profiles_select_for_admin" on public.admin_profiles;
create policy "admin_profiles_select_for_admin"
  on public.admin_profiles for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admin_audit_logs_select_admin" on public.admin_audit_logs;
create policy "admin_audit_logs_select_admin"
  on public.admin_audit_logs for select
  to authenticated
  using (public.is_admin());

-- Private student tables intentionally have no direct select/insert/update policies.
-- Use the RPC functions above from the app instead of direct table access.

revoke all on function public._student_payload(uuid) from public, anon, authenticated;
revoke all on function public._create_student_session(uuid) from public, anon, authenticated;
revoke all on function public._student_id_from_token(text) from public, anon, authenticated;

grant execute on function public.student_register(text, text, text) to anon, authenticated;
grant execute on function public.student_login(text, text, text) to anon, authenticated;
grant execute on function public.student_logout(text) to anon, authenticated;
grant execute on function public.student_me(text) to anon, authenticated;
grant execute on function public.update_student_settings(text, boolean, boolean) to anon, authenticated;
grant execute on function public.update_student_avatar(text, text) to anon, authenticated;
grant execute on function public.record_activity_progress(text, integer) to anon, authenticated;
grant execute on function public.finish_quiz(text, integer, text, integer, integer, integer, integer) to anon, authenticated;
grant execute on function public.save_reading_attempt(text, text, text, text, boolean) to anon, authenticated;
grant execute on function public.save_tracing_attempt(text, text, boolean) to anon, authenticated;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.admin_list_students(text, text) to authenticated;
grant execute on function public.admin_create_student(text, text, text) to authenticated;
grant execute on function public.admin_update_student(uuid, text, text, boolean) to authenticated;
grant execute on function public.admin_reset_student_password(uuid, text) to authenticated;
grant execute on function public.admin_reset_student_progress(uuid) to authenticated;
grant execute on function public.admin_delete_student(uuid) to authenticated;
grant execute on function public.admin_list_admins() to authenticated;
grant execute on function public.admin_add_admin_by_email(text, text) to authenticated;
grant execute on function public.admin_update_admin(uuid, text) to authenticated;
grant execute on function public.admin_remove_admin(uuid) to authenticated;

select pg_notify('pgrst', 'reload schema');

-- First admin setup:
-- 1. Open Supabase Dashboard > Authentication > Users.
-- 2. Create your admin email/password there.
-- 3. Replace the email below, uncomment it, and run it once.
--
-- insert into public.admin_profiles (id, email, display_name)
-- select id, email, 'Admin'
-- from auth.users
-- where email = 'admin@example.com'
-- on conflict (id) do update
-- set email = excluded.email,
--     display_name = excluded.display_name;
