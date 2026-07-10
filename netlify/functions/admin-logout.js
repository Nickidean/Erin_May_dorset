import { getSupabaseAdmin } from './_shared/supabaseAdmin.js'
import { hashToken } from './_shared/hash.js'

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const authHeader = event.headers?.authorization || event.headers?.Authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null

  if (token) {
    const supabase = getSupabaseAdmin()
    await supabase.from('sessions').delete().eq('token_hash', hashToken(token))
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) }
}
