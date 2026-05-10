'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function useRequireAuth() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (!error) {
          window.history.replaceState({}, '', window.location.pathname)
        } else {
          router.push('/connexion')
        }
      })
      return
    }

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
