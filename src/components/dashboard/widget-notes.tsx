'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StickyNote } from 'lucide-react'

export function WidgetNotes() {
  const [contenu, setContenu] = useState('')
  const [statut, setStatut] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [userId, setUserId] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      setUserId(data.user.id)
      const { data: note } = await supabase
        .from('notes_rapides')
        .select('contenu')
        .eq('user_id', data.user.id)
        .single()
      if (note) setContenu(note.contenu ?? '')
    })
  }, [])

  function onChangement(valeur: string) {
    setContenu(valeur)
    setStatut('saving')
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      if (!userId) return
      const supabase = createClient()
      await supabase.from('notes_rapides').upsert({
        user_id: userId,
        contenu: valeur,
        updated_at: new Date().toISOString(),
      })
      setStatut('saved')
      setTimeout(() => setStatut('idle'), 2000)
    }, 1000)
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-yellow-50 dark:bg-yellow-950/50 flex items-center justify-center">
            <StickyNote className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Notes rapides</p>
        </div>
        <span className={`text-xs transition-opacity ${statut === 'idle' ? 'opacity-0' : 'opacity-100'} ${statut === 'saved' ? 'text-green-500' : 'text-gray-400'}`}>
          {statut === 'saving' ? 'Sauvegarde…' : 'Sauvegardé ✓'}
        </span>
      </div>
      <textarea
        value={contenu}
        onChange={e => onChangement(e.target.value)}
        placeholder="Note rapide, numéro de téléphone, idée…"
        rows={4}
        className="w-full resize-none text-sm text-gray-700 dark:text-gray-300 bg-transparent placeholder:text-gray-300 dark:placeholder:text-gray-700 outline-none leading-relaxed"
      />
    </div>
  )
}
