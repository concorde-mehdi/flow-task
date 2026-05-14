'use client'

import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2, StickyNote } from 'lucide-react'
import { useStickyNotes, useCreerStickyNote, useMettreAJourStickyNote, useSupprimerStickyNote } from '@/hooks/use-sticky-notes'
import type { CouleurNote, StickyNote as StickyNoteType } from '@/types'

const COULEURS: { valeur: CouleurNote; bg: string; texte: string; border: string }[] = [
  { valeur: 'yellow', bg: 'bg-yellow-50 dark:bg-yellow-950/30', texte: 'text-yellow-900 dark:text-yellow-100', border: 'border-yellow-200 dark:border-yellow-800/50' },
  { valeur: 'blue',   bg: 'bg-blue-50 dark:bg-blue-950/30',     texte: 'text-blue-900 dark:text-blue-100',     border: 'border-blue-200 dark:border-blue-800/50' },
  { valeur: 'green',  bg: 'bg-green-50 dark:bg-green-950/30',   texte: 'text-green-900 dark:text-green-100',   border: 'border-green-200 dark:border-green-800/50' },
  { valeur: 'pink',   bg: 'bg-pink-50 dark:bg-pink-950/30',     texte: 'text-pink-900 dark:text-pink-100',     border: 'border-pink-200 dark:border-pink-800/50' },
  { valeur: 'purple', bg: 'bg-purple-50 dark:bg-purple-950/30', texte: 'text-purple-900 dark:text-purple-100', border: 'border-purple-200 dark:border-purple-800/50' },
]

const PASTILLES: Record<CouleurNote, string> = {
  yellow: 'bg-yellow-400',
  blue:   'bg-blue-400',
  green:  'bg-green-400',
  pink:   'bg-pink-400',
  purple: 'bg-purple-500',
}

function CarteNote({ note }: { note: StickyNoteType }) {
  const { mutate: metAJour } = useMettreAJourStickyNote()
  const { mutate: supprimer } = useSupprimerStickyNote()
  const [contenu, setContenu] = useState(note.contenu)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const style = COULEURS.find(c => c.valeur === note.couleur) ?? COULEURS[0]

  function onChangement(valeur: string) {
    setContenu(valeur)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      metAJour({ id: note.id, contenu: valeur })
    }, 800)
  }

  return (
    <div className={`group relative rounded-xl border p-3 flex flex-col gap-2 ${style.bg} ${style.border}`}>
      <button
        onClick={() => supprimer(note.id)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-400"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
      <textarea
        value={contenu}
        onChange={e => onChangement(e.target.value)}
        placeholder="Note…"
        rows={3}
        className={`w-full resize-none text-xs bg-transparent outline-none leading-relaxed placeholder:opacity-40 ${style.texte}`}
      />
    </div>
  )
}

export function WidgetNotes() {
  const { data: notes = [], isLoading } = useStickyNotes()
  const { mutate: creer, isPending } = useCreerStickyNote()
  const [couleurSelectionnee, setCouleurSelectionnee] = useState<CouleurNote>('yellow')

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-yellow-50 dark:bg-yellow-950/50 flex items-center justify-center">
            <StickyNote className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Notes sticky</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {COULEURS.map(c => (
              <button
                key={c.valeur}
                onClick={() => setCouleurSelectionnee(c.valeur)}
                className={`w-4 h-4 rounded-full transition-all ${PASTILLES[c.valeur]} ${couleurSelectionnee === c.valeur ? 'scale-125 ring-2 ring-offset-1 ring-gray-300 dark:ring-gray-600' : 'opacity-60 hover:opacity-100'}`}
              />
            ))}
          </div>
          <button
            onClick={() => creer(couleurSelectionnee)}
            disabled={isPending}
            className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1 transition-colors ml-1"
          >
            <Plus className="w-3.5 h-3.5" />Ajouter
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-50 dark:bg-gray-800 rounded-xl animate-pulse" />)}
        </div>
      ) : notes.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-gray-600">
          Clique sur <strong>Ajouter</strong> pour créer ta première note sticky.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {notes.map(note => <CarteNote key={note.id} note={note} />)}
        </div>
      )}
    </div>
  )
}
