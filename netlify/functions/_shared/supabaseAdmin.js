import { createClient } from '@supabase/supabase-js'

let client = null

export function getSupabaseAdmin() {
  if (client) return client

  const url = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set')
  }

  client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  })
  return client
}
