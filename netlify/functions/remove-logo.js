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

  const { data: draft } = await supabase
    .from('site_content')
    .select('logo_path')
    .eq('state', 'draft')
    .maybeSingle()

  if (draft?.logo_path) {
    await supabase.storage.from('media').remove([draft.logo_path])
  }

  const { error } = await supabase
    .from('site_content')
    .update({ logo_path: null, updated_at: new Date().toISOString() })
    .eq('state', 'draft')

  if (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not remove logo' }) }
  }

  await logActivity(session.adminName, 'remove_logo')

  return { statusCode: 200, body: JSON.stringify({ ok: true }) }
}
