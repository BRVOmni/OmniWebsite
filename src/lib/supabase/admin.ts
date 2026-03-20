/**
 * Supabase Client - Admin
 *
 * Service role client for admin operations
 * ⚠️ NEVER use this in client-side code!
 * ⚠️ Always validate permissions before using!
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Create admin Supabase client with service role key
 * ⚠️ Use only server-side, never expose to client!
 */
export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('createAdminClient can only be used server-side')
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
