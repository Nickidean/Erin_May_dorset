import { getSupabaseAdmin } from './_shared/supabaseAdmin.js'
import { verifySession, unauthorized } from './_shared/verifySession.js'

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const session = await verifySession(event)
  if (!session) return unauthorized()

  const supabase = getSupabaseAdmin()

  const [{ data: content }, { data: images }] = await Promise.all([
    supabase.from('site_content').select('*').eq('state', 'draft').maybeSingle(),
    supabase.from('carousel_images').select('*').eq('state', 'draft').order('sort_order'),
  ])

  return {
    statusCode: 200,
    body: JSON.stringify({ content, images: images || [] }),
  }
}
