import { getSupabaseAdmin } from './supabaseAdmin.js'
import { hashToken } from './hash.js'

// Extracts and verifies the Bearer session token from a request.
// Returns { adminName } on success, or null if missing/invalid/expired.
export async function verifySession(event) {
  const authHeader = event.headers?.authorization || event.headers?.Authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null

  const token = authHeader.slice('Bearer '.length).trim()
  if (!token) return null

  const tokenHash = hashToken(token)
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('sessions')
    .select('admin_name, expires_at')
    .eq('token_hash', tokenHash)
    .maybeSingle()

  if (error || !data) return null
  if (new Date(data.expires_at) < new Date()) return null

  return { adminName: data.admin_name }
}

export function unauthorized() {
  return {
    statusCode: 401,
    body: JSON.stringify({ error: 'Unauthorized' }),
  }
}
