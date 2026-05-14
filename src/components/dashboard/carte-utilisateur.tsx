'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { User } from '@supabase/supabase-js'

export function CarteUtilisateur() {
  const [user, setUser] = useState<User | null>(null)
  const [titrePoste, setTitrePoste] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user)
      if (data.user) {
        const { data: profil } = await supabase
          .from('profils')
          .select('titre_poste')
          .eq('user_id', data.user.id)
          .single()
        if (profil) setTitrePoste(profil.titre_poste)
      }
    })
  }, [])

  const [maintenant, setMaintenant] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setMaintenant(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])

  const nomComplet = user?.user_metadata?.full_name ?? ''
  const prenom = nomComplet.split(' ')[0] || 'Utilisateur'
  const avatar = user?.user_metadata?.avatar_url as string | undefined
  const dateFormatee = format(maintenant, "EEEE d MMMM yyyy", { locale: fr })
  const heureFormatee = format(maintenant, "HH:mm")

  const initiale = (nomComplet || prenom)[0]?.toUpperCase() ?? 'U'

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 px-6 py-5 shadow-lg shadow-blue-500/20">
      {/* Cercles décoratifs */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute right-16 -bottom-8 h-24 w-24 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute right-4 top-4 h-14 w-14 rounded-full bg-white/5" />

      <div className="relative flex items-center gap-4">
        {/* Avatar */}
        {avatar ? (
          <img
            src={avatar}
            alt={nomComplet}
            className="h-14 w-14 shrink-0 rounded-2xl border-2 border-white/30 object-cover shadow-md"
          />
        ) : (
          <div className="h-14 w-14 shrink-0 rounded-2xl bg-white/20 flex items-center justify-center shadow-md border border-white/10">
            <span className="text-2xl font-bold text-white">{initiale}</span>
          </div>
        )}

        {/* Texte */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-blue-100">Bonjour,</p>
          <p className="text-xl font-bold text-white truncate leading-tight">
            {nomComplet || prenom}
          </p>
          {titrePoste && (
            <p className="mt-0.5 text-sm font-medium text-blue-100 truncate">{titrePoste}</p>
          )}
        </div>

        {/* Date + heure */}
        <div className="shrink-0 text-right hidden sm:block">
          <p className="text-2xl font-bold text-white tabular-nums">{heureFormatee}</p>
          <p className="text-xs font-medium text-blue-100 capitalize mt-0.5">{dateFormatee}</p>
        </div>
      </div>
    </div>
  )
}
