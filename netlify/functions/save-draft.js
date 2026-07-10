import { getSupabaseAdmin } from './_shared/supabaseAdmin.js'
import { verifySession, unauthorized } from './_shared/verifySession.js'
import { logActivity } from './_shared/logActivity.js'

const ALLOWED_FIELDS = ['about_text', 'vinted_url', 'whatsapp_url']

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const session = await verifySession(event)
  if (!session) return unauthorized()

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const updates = {}
  for (const field of ALLOWED_FIELDS) {
    if (typeof body[field] === 'string') updates[field] = body[field]
  }

  if (Object.keys(updates).length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No valid fields provided' }) }
  }

  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('site_content')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('state', 'draft')

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not save draft' }) }
  }

  await logActivity(session.adminName, 'edit_content', { fields: Object.keys(updates) })

  return { statusCode: 200, body: JSON.stringify({ ok: true }) }
}
