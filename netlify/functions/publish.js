import { getSupabaseAdmin } from './_shared/supabaseAdmin.js'
import { verifySession, unauthorized } from './_shared/verifySession.js'
import { logActivity } from './_shared/logActivity.js'

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const session = await verifySession(event)
  if (!session) return unauthorized()

  const supabase = getSupabaseAdmin()
  const { error } = await supabase.rpc('publish_site')

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not publish' }) }
  }

  await logActivity(session.adminName, 'publish')

  return { statusCode: 200, body: JSON.stringify({ ok: true }) }
}
