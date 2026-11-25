import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL ?? 'https://arbqospfobibiiyivfhp.supabase.co'
export const BUCKET = 'site'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? 'neilalexivergara@gmail.com')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export function serviceClient() {
  const key = process.env.SUPABASE_SECRET_KEY
  if (!key) throw new Error('SUPABASE_SECRET_KEY is not configured on the server')
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false } })
}

/** Returns an error message, or null when the bearer token belongs to an allowed admin. */
export async function checkAdmin(authHeader: string | undefined): Promise<string | null> {
  const token = authHeader?.replace(/^Bearer\s+/i, '')
  if (!token) return 'Not signed in'
  const { data, error } = await serviceClient().auth.getUser(token)
  if (error || !data.user?.email) return 'Session expired — sign in again'
  if (!ADMIN_EMAILS.includes(data.user.email.toLowerCase())) return 'This account is not an editor'
  return null
}
