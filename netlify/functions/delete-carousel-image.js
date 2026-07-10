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

  if (!body.imageId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'imageId is required' }) }
  }

  const supabase = getSupabaseAdmin()

  const { data: row } = await supabase
    .from('carousel_images')
    .select('id, storage_path')
    .eq('id', body.imageId)
    .eq('state', 'draft')
    .maybeSingle()

  if (!row) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Image not found' }) }
  }

  await supabase.storage.from('media').remove([row.storage_path])
  await supabase.from('carousel_images').delete().eq('id', row.id)

  await logActivity(session.adminName, 'remove_image', { storagePath: row.storage_path })

  return { statusCode: 200, body: JSON.stringify({ ok: true }) }
}
