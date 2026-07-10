import { getSupabaseAdmin } from './_shared/supabaseAdmin.js'
import { verifySession, unauthorized } from './_shared/verifySession.js'
import { logActivity } from './_shared/logActivity.js'
import { parseDataUrl } from './_shared/dataUrl.js'

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

  let buffer, contentType, ext
  try {
    ;({ buffer, contentType, ext } = parseDataUrl(body.imageBase64))
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) }
  }

  const supabase = getSupabaseAdmin()
  const path = `logo-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(path, buffer, { contentType, upsert: true })

  if (uploadError) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not upload logo' }) }
  }

  const { error: updateError } = await supabase
    .from('site_content')
    .update({ logo_path: path, updated_at: new Date().toISOString() })
    .eq('state', 'draft')

  if (updateError) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not save logo' }) }
  }

  await logActivity(session.adminName, 'change_logo', { storagePath: path })

  return { statusCode: 200, body: JSON.stringify({ logoPath: path }) }
}
