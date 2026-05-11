'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { User } from '@supabase/supabase-js'

export function CarteUtilisateur() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const nomComplet = user?.user_metadata?.full_name ?? ''
  const prenom = nomComplet.split(' ')[0] || 'Docteur'
  const avatar = user?.user_metadata?.avatar_url as string | undefined
  const dateFormatee = format(new Date(), "EEEE d MMMM", { locale: fr })

  return (
    <div className="flex items-center gap-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-4">
      {avatar ? (
        <img
          src={avatar}
          alt={nomComplet}
          className="w-12 h-12 rounded-full border-2 border-blue-100 dark:border-blue-900 shrink-0"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
          {prenom[0]?.toUpperCase()}
        </div>
      )}
      <div className="min-w-0">
        <p className="font-semibold text-gray-900 dark:text-white truncate">
          Bonjour, {nomComplet || prenom}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{dateFormatee}</p>
      </div>
    </div>
  )
}
