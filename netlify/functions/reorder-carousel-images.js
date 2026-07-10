import { getSupabaseAdmin } from './_shared/supabaseAdmin.js'
import { verifySession, unauthorized } from './_shared/verifySession.js'
import { logActivity } from './_shared/logActivity.js'

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

  const order = Array.isArray(body.order) ? body.order : null
  if (!order) {
    return { statusCode: 400, body: JSON.stringify({ error: 'order array is required' }) }
  }

  const supabase = getSupabaseAdmin()

  await Promise.all(
    order.map(({ id, sortOrder }) =>
      supabase.from('carousel_images').update({ sort_order: sortOrder }).eq('id', id).eq('state', 'draft')
    )
  )

  await logActivity(session.adminName, 'reorder_images')

  return { statusCode: 200, body: JSON.stringify({ ok: true }) }
}
