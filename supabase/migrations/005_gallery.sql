-- Erin May: gallery section (separate from the hero carousel)
-- Run this in the Supabase SQL editor.

create table if not exists gallery_images (
  id            uuid primary key default gen_random_uuid(),
  state         text not null check (state in ('draft', 'published')),
  storage_path  text not null,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists gallery_images_state_sort_idx
  on gallery_images (state, sort_order);

alter table gallery_images enable row level security;

create policy "public can read published gallery_images"
  on gallery_images for select
  using (state = 'published');

-- publish_site() must now also copy gallery images draft -> published.
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
      faqs         = d.faqs,
      updated_at   = now()
  from site_content d
  where p.state = 'published' and d.state = 'draft';

  delete from carousel_images where state = 'published';

  insert into carousel_images (state, storage_path, sort_order, caption)
  select 'published', storage_path, sort_order, caption
  from carousel_images
  where state = 'draft';

  delete from gallery_images where state = 'published';

  insert into gallery_images (state, storage_path, sort_order)
  select 'published', storage_path, sort_order
  from gallery_images
  where state = 'draft';
end;
$$;

revoke execute on function publish_site() from public, anon, authenticated;
