-- Erin May: initial schema
-- Run this in the Supabase SQL editor for the project.

create extension if not exists pgcrypto;

-- ===== site_content =====
-- Exactly 2 rows: one 'draft', one 'published'. Public reads only ever see 'published'.
create table if not exists site_content (
  state        text primary key check (state in ('draft', 'published')),
  about_text   text not null default '',
  vinted_url   text not null default '',
  whatsapp_url text not null default '',
  logo_path    text,
  updated_at   timestamptz not null default now()
);

-- ===== carousel_images =====
create table if not exists carousel_images (
  id            uuid primary key default gen_random_uuid(),
  state         text not null check (state in ('draft', 'published')),
  storage_path  text not null,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists carousel_images_state_sort_idx
  on carousel_images (state, sort_order);

-- ===== admins =====
-- PIN hashes only, never plaintext. Seeded separately via 002_seed_admins.sql.
create table if not exists admins (
  name       text primary key check (name in ('amelie', 'lily')),
  pin_hash   text not null,
  pin_salt   text not null,
  created_at timestamptz not null default now()
);

-- ===== sessions =====
-- Opaque session tokens: only the sha256 hash of the raw token is ever stored.
create table if not exists sessions (
  id          uuid primary key default gen_random_uuid(),
  admin_name  text not null references admins (name) on delete cascade,
  token_hash  text not null unique,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

create index if not exists sessions_expires_at_idx on sessions (expires_at);

-- ===== activity_log =====
create table if not exists activity_log (
  id          uuid primary key default gen_random_uuid(),
  admin_name  text not null,
  action      text not null,
  details     jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists activity_log_created_at_idx on activity_log (created_at desc);

-- ===== Row Level Security =====
-- Public (anon/authenticated) may only ever SELECT published content.
-- There are no insert/update/delete policies anywhere: all writes happen
-- through Netlify functions using the Supabase service role key, which
-- bypasses RLS entirely. admins/sessions/activity_log have no public
-- policies at all -- they are invisible to the anon key.

alter table site_content enable row level security;
alter table carousel_images enable row level security;
alter table admins enable row level security;
alter table sessions enable row level security;
alter table activity_log enable row level security;

create policy "public can read published site_content"
  on site_content for select
  using (state = 'published');

create policy "public can read published carousel_images"
  on carousel_images for select
  using (state = 'published');

-- ===== publish_site() =====
-- Atomically copies draft -> published for both site_content and carousel_images.
-- Only callable by the service role (see revoke below) -- never exposed to anon/authenticated.
create or replace function publish_site()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update site_content p
  set about_text   = d.about_text,
      vinted_url   = d.vinted_url,
      whatsapp_url = d.whatsapp_url,
      logo_path    = d.logo_path,
      updated_at   = now()
  from site_content d
  where p.state = 'published' and d.state = 'draft';

  delete from carousel_images where state = 'published';

  insert into carousel_images (state, storage_path, sort_order)
  select 'published', storage_path, sort_order
  from carousel_images
  where state = 'draft';
end;
$$;

revoke execute on function publish_site() from public, anon, authenticated;

-- ===== Storage =====
-- 'media' bucket: public read (so <img> tags work directly), no public write.
-- Uploads/deletes only ever happen server-side via the service role key.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "public can read media bucket"
  on storage.objects for select
  using (bucket_id = 'media');

-- ===== Seed default content =====
-- Real default copy and URLs, seeded into both draft and published so the
-- site is correct immediately without requiring a first admin login/publish.
insert into site_content (state, about_text, vinted_url, whatsapp_url, logo_path)
values
  (
    'draft',
    'We started making bracelets late 2024 just for fun. Until we really started to enjoy making bracelets together. Our favourite bracelets to make are clay bead bracelets because they were the ones which we first started making, they are our signature bracelet type.',
    'https://www.vinted.co.uk/catalog?search_text=erin_may_dorset',
    'https://whatsapp.com/channel/0029Vb8XWNCChq6FnoKAWp0x',
    null
  ),
  (
    'published',
    'We started making bracelets late 2024 just for fun. Until we really started to enjoy making bracelets together. Our favourite bracelets to make are clay bead bracelets because they were the ones which we first started making, they are our signature bracelet type.',
    'https://www.vinted.co.uk/catalog?search_text=erin_may_dorset',
    'https://whatsapp.com/channel/0029Vb8XWNCChq6FnoKAWp0x',
    null
  )
on conflict (state) do nothing;
