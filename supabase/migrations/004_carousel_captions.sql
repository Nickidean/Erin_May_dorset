-- Erin May: per-image captions on the carousel
-- Run this in the Supabase SQL editor.

alter table carousel_images add column if not exists caption text not null default '';

-- publish_site() must now also copy captions draft -> published.
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
end;
$$;

revoke execute on function publish_site() from public, anon, authenticated;
