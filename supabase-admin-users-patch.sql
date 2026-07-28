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

grant execute on function public.admin_list_admins() to authenticated;
grant execute on function public.admin_add_admin_by_email(text, text) to authenticated;
grant execute on function public.admin_update_admin(uuid, text) to authenticated;
grant execute on function public.admin_remove_admin(uuid) to authenticated;

select pg_notify('pgrst', 'reload schema');
