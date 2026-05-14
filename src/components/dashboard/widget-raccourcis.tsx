'use client'

import { useState } from 'react'
import { Send, Plus, Trash2, Loader2 } from 'lucide-react'
import { useRaccourcis, useCreerRaccourci, useSupprimerRaccourci } from '@/hooks/use-raccourcis'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

const COULEURS_GRILLE = [
  'bg-sky-50 dark:bg-sky-950/40 border-sky-100 dark:border-sky-900/40 text-sky-600 dark:text-sky-400',
  'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400',
  'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400',
  'bg-violet-50 dark:bg-violet-950/40 border-violet-100 dark:border-violet-900/40 text-violet-600 dark:text-violet-400',
  'bg-teal-50 dark:bg-teal-950/40 border-teal-100 dark:border-teal-900/40 text-teal-600 dark:text-teal-400',
  'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-100 dark:border-cyan-900/40 text-cyan-600 dark:text-cyan-400',
]

export function WidgetRaccourcis() {
  const { data: raccourcis = [], isLoading } = useRaccourcis()
  const { mutate: creer, isPending: creation } = useCreerRaccourci()
  const { mutate: supprimer } = useSupprimerRaccourci()

  const [ajoutOuvert, setAjoutOuvert] = useState(false)
  const [titre, setTitre] = useState('')
  const [message, setMessage] = useState('')
  const [envoi, setEnvoi] = useState<string | null>(null)

  async function envoyer(id: string, msg: string) {
    setEnvoi(id)
    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      })
      if (res.ok) {
        toast.success('Message Telegram envoyé ✓')
      } else {
        const err = await res.json()
        toast.error(err.error ?? 'Erreur Telegram')
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setEnvoi(null)
    }
  }

  function ajouter() {
    if (!titre.trim() || !message.trim()) return
    creer({ titre: titre.trim(), type: 'telegram', message: message.trim() }, {
      onSuccess: () => { setTitre(''); setMessage(''); setAjoutOuvert(false) }
    })
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center">
            <Send className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Raccourcis Telegram</p>
        </div>
        <button
          onClick={() => setAjoutOuvert(!ajoutOuvert)}
          className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />Ajouter
        </button>
      </div>

      {ajoutOuvert && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-2">
          <Input placeholder="Titre du raccourci" value={titre} onChange={e => setTitre(e.target.value)} className="text-sm" />
          <Textarea placeholder="Message à envoyer…" value={message} onChange={e => setMessage(e.target.value)} rows={2} className="text-sm resize-none" />
          <div className="flex gap-2">
            <Button size="sm" onClick={ajouter} disabled={!titre.trim() || !message.trim() || creation} className="flex-1">
              {creation ? 'Ajout…' : 'Sauvegarder'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setAjoutOuvert(false); setTitre(''); setMessage('') }}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}
        </div>
      ) : raccourcis.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-gray-600">
          Aucun raccourci. Ajoute un message pré-rempli pour l'envoyer en un clic.
        </p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {raccourcis.map((r, i) => {
            const couleur = COULEURS_GRILLE[i % COULEURS_GRILLE.length]
            return (
              <div key={r.id} className={`group relative rounded-xl border p-3 flex flex-col items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] ${couleur}`}>
                <button
                  onClick={() => envoyer(r.id, r.message)}
                  disabled={envoi === r.id}
                  className="flex flex-col items-center gap-1.5 w-full"
                  title={r.message}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/60 dark:bg-white/10 flex items-center justify-center">
                    {envoi === r.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Send className="w-4 h-4" />
                    }
                  </div>
                  <span className="text-xs font-semibold text-center leading-tight line-clamp-2">{r.titre}</span>
                </button>
                <button
                  onClick={() => supprimer(r.id)}
                  className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-current/40 hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
