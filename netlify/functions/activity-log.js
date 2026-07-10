import { getSupabaseAdmin } from './_shared/supabaseAdmin.js'
import { verifySession, unauthorized } from './_shared/verifySession.js'

const LIMIT = 100

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const session = await verifySession(event)
  if (!session) return unauthorized()

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(LIMIT)

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not load activity log' }) }
  }

  return { statusCode: 200, body: JSON.stringify({ entries: data }) }
}
