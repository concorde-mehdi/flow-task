'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function useRequireAuth() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // With flowType: 'pkce', Supabase auto-exchanges ?code= from URL during _initialize
    // INITIAL_SESSION fires after the exchange completes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION' && !session) {
        router.push('/connexion')
      }
      if (event === 'SIGNED_OUT') {
        router.push('/connexion')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])
}
