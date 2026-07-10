import { getSupabaseAdmin } from './supabaseAdmin.js'

export async function logActivity(adminName, action, details = null) {
  const supabase = getSupabaseAdmin()
  await supabase.from('activity_log').insert({ admin_name: adminName, action, details })
}
