# Erin May

One-page site for Erin May (handmade bracelets by Amelie and Lily), with a small PIN-protected admin area for editing content and photos.

## Stack

- React + Vite, deployed on Netlify
- Supabase (Postgres + Storage) for content and photos
- Custom PIN login — not Supabase Auth. Admin writes go through Netlify functions using the Supabase service role key; the browser only ever holds the anon key, which can read published content only.

## Local setup

1. `npm install`
2. Create a Supabase project, then run `supabase/migrations/001_init_schema.sql` in the Supabase SQL editor.
3. Generate admin PIN hashes locally (never commit real values):
   ```
   node scripts/hash-pin.js 1234
   ```
   Paste the resulting `pin_hash`/`pin_salt` into `supabase/migrations/002_seed_admins.sql` (replacing the placeholders) and run that file in the SQL editor too — once for Amelie, once for Lily.
4. Copy `.env.example` to `.env` and fill in:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — from Supabase project settings, used by the browser.
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — same project, service role key. **Server-only** — deliberately not prefixed `VITE_` so Vite never bundles it into client code.
5. Run the public site only: `npm run dev`.
   To exercise the admin area (Netlify functions), install the Netlify CLI and run `netlify dev` instead — it proxies both Vite and the functions together.

## Deploying

1. Push this repo to GitHub.
2. Connect the repo in the Netlify dashboard (Add new site → Import from GitHub).
3. Set the four env vars above in Netlify's site settings (Site configuration → Environment variables).
4. Deploy. `netlify.toml` already points at `npm run build`, publishes `dist`, and wires up `netlify/functions`.

## Content model

- `site_content` and `carousel_images` both have a `state` of `'draft'` or `'published'`. Admin edits only ever touch the draft rows; the public site only ever reads published rows.
- Clicking **Publish** in the admin area calls the `publish_site()` Postgres function, which copies draft → published atomically, so a half-finished edit is never visible on the live site.
- The photo carousel is capped at 5 images, enforced both in the UI and server-side in `upload-carousel-image.js`.
- FAQs are static (`src/lib/constants.js`) — not admin-editable by design.

## Safeguarding

First names only, no faces/school/location beyond "Dorset." `/admin` is not linked from the public site. See the original spec for full detail.
