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

  if (!body.imageId || typeof body.caption !== 'string') {
    return { statusCode: 400, body: JSON.stringify({ error: 'imageId and caption are required' }) }
  }

  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('carousel_images')
    .update({ caption: body.caption })
    .eq('id', body.imageId)
    .eq('state', 'draft')

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not save caption' }) }
  }

  await logActivity(session.adminName, 'edit_caption', { imageId: body.imageId })

  return { statusCode: 200, body: JSON.stringify({ ok: true }) }
}
