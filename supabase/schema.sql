-- 1. Tipi
create type public.app_role as enum ('admin', 'editor', 'viewer');
create type public.account_status as enum ('pending', 'approved', 'rejected');



-- 2. Tabella profili
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  first_name  text not null,
  last_name   text not null,
  phone       text,
  role        public.app_role,
  status      public.account_status not null default 'pending',
  created_at  timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id)
);

alter table public.profiles enable row level security;



-- 3. Trigger: crea il profilo alla registrazione
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();



-- 4. Helper: l'utente corrente è un admin approvato?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
      and status = 'approved'
  );
$$;



-- 5. Policy RLS
create policy "Users read own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Admins read all profiles"
  on public.profiles for select to authenticated
  using ((select public.is_admin()));

create policy "Admins update profiles"
  on public.profiles for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));





-- Verifica policy
select tablename, policyname, cmd from pg_policies where tablename = 'profiles';