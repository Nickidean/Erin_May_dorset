import { getSupabaseAdmin } from './_shared/supabaseAdmin.js'
import { verifyPin, generateSessionToken, hashToken } from './_shared/hash.js'
import { logActivity } from './_shared/logActivity.js'

const SESSION_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const { admin, pin } = body
  if (!admin || !pin || !/^\d{4}$/.test(pin)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'admin and 4-digit pin are required' }) }
  }

  const supabase = getSupabaseAdmin()

  const { data: adminRow } = await supabase
    .from('admins')
    .select('name, pin_hash, pin_salt')
    .eq('name', admin)
    .maybeSingle()

  if (!adminRow || !verifyPin(pin, adminRow.pin_salt, adminRow.pin_hash)) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Incorrect PIN' }) }
  }

  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString()

  const { error: sessionError } = await supabase.from('sessions').insert({
    admin_name: adminRow.name,
    token_hash: hashToken(token),
    expires_at: expiresAt,
  })

  if (sessionError) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not create session' }) }
  }

  await logActivity(adminRow.name, 'login')

  return {
    statusCode: 200,
    body: JSON.stringify({ token, adminName: adminRow.name }),
  }
}
