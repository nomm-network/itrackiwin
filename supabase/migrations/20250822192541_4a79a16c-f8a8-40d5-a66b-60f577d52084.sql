-- Fix RLS issues by enabling RLS on tables that need it
alter table public.user_exercise_estimates enable row level security;

-- Fix function search path issues
create or replace function public.has_role(_user_id uuid, _role app_role)
 returns boolean
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = _user_id and ur.role = _role
  );
$function$;

create or replace function public.get_default_gym(_user_id uuid)
 returns uuid
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  select id from public.user_gyms
  where user_id = _user_id
  order by is_default desc, created_at asc
  limit 1;
$function$;

create or replace function public.next_template_id(_user_id uuid)
 returns uuid
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  select template_id
  from public.user_active_templates
  where user_id = _user_id and is_active = true
  order by coalesce(last_done_at, to_timestamp(0)) asc, order_index asc
  limit 1;
$function$;