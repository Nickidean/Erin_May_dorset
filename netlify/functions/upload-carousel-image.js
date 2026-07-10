import { getSupabaseAdmin } from './_shared/supabaseAdmin.js'
import { verifySession, unauthorized } from './_shared/verifySession.js'
import { logActivity } from './_shared/logActivity.js'
import { parseDataUrl } from './_shared/dataUrl.js'

const MAX_CAROUSEL_IMAGES = 5

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

  const { data: existing, error: countError } = await supabase
    .from('carousel_images')
    .select('id, sort_order')
    .eq('state', 'draft')
    .order('sort_order')

  if (countError) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not check existing images' }) }
  }
  if (existing.length >= MAX_CAROUSEL_IMAGES) {
    return { statusCode: 400, body: JSON.stringify({ error: `Maximum ${MAX_CAROUSEL_IMAGES} images allowed` }) }
  }

  const path = `carousel-${Date.now()}.${ext}`
  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(path, buffer, { contentType, upsert: true })

  if (uploadError) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not upload image' }) }
  }

  const nextSortOrder = existing.length
    ? Math.max(...existing.map((row) => row.sort_order)) + 1
    : 0

  const { data: inserted, error: insertError } = await supabase
    .from('carousel_images')
    .insert({ state: 'draft', storage_path: path, sort_order: nextSortOrder })
    .select()
    .single()

  if (insertError) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not save image' }) }
  }

  await logActivity(session.adminName, 'add_image', { storagePath: path })

  return { statusCode: 200, body: JSON.stringify({ image: inserted }) }
}
