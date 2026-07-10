-- Erin May: seed admin PINs
--
-- 1. Run: node scripts/hash-pin.js <amelie's 4-digit pin>
-- 2. Run: node scripts/hash-pin.js <lily's 4-digit pin>
-- 3. Paste the resulting hash/salt pairs below, replacing the placeholders.
-- 4. Run this file in the Supabase SQL editor.
--
-- Do NOT commit this file with real hash/salt values filled in -- keep the
-- placeholders in git and only paste real values directly into the SQL editor.

insert into admins (name, pin_hash, pin_salt)
values
  ('amelie', 'REPLACE_WITH_AMELIE_PIN_HASH', 'REPLACE_WITH_AMELIE_PIN_SALT'),
  ('lily',   'REPLACE_WITH_LILY_PIN_HASH',   'REPLACE_WITH_LILY_PIN_SALT')
on conflict (name) do update
  set pin_hash = excluded.pin_hash,
      pin_salt = excluded.pin_salt;
