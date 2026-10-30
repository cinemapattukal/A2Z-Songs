-- Run this in Supabase Dashboard → SQL Editor.
-- Keep public song listing read-only. Only signed-in admins can add/edit/delete.
create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text,
  album text,
  year integer,
  cover_url text,
  audio_url text not null,
  created_at timestamptz not null default now()
);

alter table public.songs enable row level security;

drop policy if exists "Public can read songs" on public.songs;
create policy "Public can read songs"
on public.songs for select
to anon, authenticated
using (true);

drop policy if exists "Signed-in admins can insert songs" on public.songs;
create policy "Signed-in admins can insert songs"
on public.songs for insert
to authenticated
with check (true);

drop policy if exists "Signed-in admins can update songs" on public.songs;
create policy "Signed-in admins can update songs"
on public.songs for update
to authenticated
using (true)
with check (true);

drop policy if exists "Signed-in admins can delete songs" on public.songs;
create policy "Signed-in admins can delete songs"
on public.songs for delete
to authenticated
using (true);

-- IMPORTANT:
-- In Supabase Authentication settings, disable public sign-ups.
-- Create your own admin user manually in Authentication → Users.
-- Do not give the admin password to anyone.
