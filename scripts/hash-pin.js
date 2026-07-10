// Usage: node scripts/hash-pin.js 1234
// Prints a salt+hash pair to paste into supabase/migrations/002_seed_admins.sql
// (or run directly in the Supabase SQL editor). The PIN itself is never stored anywhere.
import { hashPin } from '../netlify/functions/_shared/hash.js'

const pin = process.argv[2]

if (!pin || !/^\d{4}$/.test(pin)) {
  console.error('Usage: node scripts/hash-pin.js <4-digit-pin>')
  process.exit(1)
}

const { hash, salt } = hashPin(pin)

console.log('pin_hash:', hash)
console.log('pin_salt:', salt)
