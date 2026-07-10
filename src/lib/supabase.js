import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }

export function isSupabaseConfigured() {
  return !!(supabaseUrl && supabaseAnonKey)
}

export function getMediaPublicUrl(path) {
  if (!supabase || !path) return null
  const { data } = supabase.storage.from('media').getPublicUrl(path)
  return data.publicUrl
}
