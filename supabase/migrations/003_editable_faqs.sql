-- Erin May: make FAQs admin-editable
-- Run this in the Supabase SQL editor.

alter table site_content add column if not exists faqs jsonb not null default '[]'::jsonb;

update site_content
set faqs = '[
  {"question": "How much is postage?", "answer": "It depends on size of parcel and location."},
  {"question": "How long does delivery take?", "answer": "4 to 12 days on average."},
  {"question": "Is it wrapped?", "answer": "Yes, we custom wrap it (depending on the size of the package)."},
  {"question": "Can I choose my own colours?", "answer": "No you can''t you can''t."}
]'::jsonb
where faqs = '[]'::jsonb;

-- publish_site() must now also copy the faqs column draft -> published.
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

  insert into carousel_images (state, storage_path, sort_order)
  select 'published', storage_path, sort_order
  from carousel_images
  where state = 'draft';
end;
$$;

revoke execute on function publish_site() from public, anon, authenticated;
