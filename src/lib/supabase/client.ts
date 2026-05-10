'use client'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/^﻿/, '').trim()
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').replace(/^﻿/, '').trim()
  return createSupabaseClient<any>(url, key, { auth: { flowType: 'pkce' } })
}
