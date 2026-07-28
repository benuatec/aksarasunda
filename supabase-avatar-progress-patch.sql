-- Game Aksara Sunda - avatar + activity progress patch
-- Paste this into Supabase SQL Editor after the original setup.

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
    )
  )
  from public.students s
  join public.student_progress sp on sp.student_id = s.id
  where s.id = input_student_id;
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

grant execute on function public.update_student_avatar(text, text) to anon, authenticated;
grant execute on function public.record_activity_progress(text, integer) to anon, authenticated;
grant execute on function public.admin_list_students(text, text) to authenticated;

select pg_notify('pgrst', 'reload schema');
