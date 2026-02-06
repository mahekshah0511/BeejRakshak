import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Simple localStorage session (no Supabase Auth needed)
const SESSION_KEY = 'beejrakshak_session'

export function getLocalSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.id && parsed?.mobile) return parsed
    return null
  } catch {
    return null
  }
}

export function setLocalSession(farmer) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    id: farmer.id,
    name: farmer.name,
    mobile: farmer.mobile,
  }))
}

export function clearLocalSession() {
  localStorage.removeItem(SESSION_KEY)
}
