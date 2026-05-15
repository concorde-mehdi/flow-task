'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckSquare, Square, Plus, Trash2, ClipboardList, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  useChecklistItems,
  useChecklistCoches,
  useAjouterItem,
  useSupprimerItem,
  useToggleCoche,
} from '@/hooks/use-checklist'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

/* Items de départ suggérés pour un technicien IT clinique */
const SUGGESTIONS = [
  'Vérifier les sauvegardes serveur',
  'Contrôler les imprimantes réseau',
  'Vider les alertes antivirus',
  'Vérifier la connectivité internet',
  'Contrôler la messagerie',
  'Mettre à jour le journal des incidents',
]

export function WidgetChecklist() {
  const { data: items = [], isError } = useChecklistItems()
  const { data: coches = [] } = useChecklistCoches()
  const { mutateAsync: ajouter } = useAjouterItem()
  const { mutateAsync: supprimer } = useSupprimerItem()
  const { mutate: toggle } = useToggleCoche()

  const [ajoutOuvert, setAjoutOuvert] = useState(false)
  const [nouvelItem, setNouvelItem] = useState('')
  const [suppression, setSuppression] = useState(false)

  const cochesSet = new Set(coches.map(c => c.item_id))
  const total = items.length
  const fait = coches.length
  const pct = total === 0 ? 0 : Math.round((fait / total) * 100)

  async function soumettre(e: React.FormEvent) {
    e.preventDefault()
    const titre = nouvelItem.trim()
    if (!titre) return
    await ajouter(titre)
    setNouvelItem('')
    setAjoutOuvert(false)
    toast.success('Tâche ajoutée à la checklist')
  }

  async function ajouterSuggestion(s: string) {
    await ajouter(s)
    toast.success('Ajouté !')
  }

  if (isError) return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3">
      <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
        <ClipboardList className="w-3.5 h-3.5 text-emerald-500" />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-900 dark:text-white">Checklist du jour</p>
        <p className="text-[10px] text-amber-500">Tables manquantes — exécuter le SQL dans Supabase</p>
      </div>
    </div>
  )

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
            <ClipboardList className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Checklist du jour</h2>
          <span className="text-[10px] text-gray-400 dark:text-gray-600 font-medium">
            {format(new Date(), 'EEEE d MMM', { locale: fr })}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {total > 0 && (
            <button
              onClick={() => setSuppression(v => !v)}
              className={cn(
                'w-7 h-7 rounded-xl flex items-center justify-center text-xs transition-colors',
                suppression
                  ? 'bg-red-50 text-red-500 dark:bg-red-950/30'
                  : 'text-gray-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
              )}
              title="Gérer la liste"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setAjoutOuvert(v => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-xl transition-colors"
          >
            <Plus className="w-3 h-3" />
            Ajouter
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Barre de progression */}
        {total > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                {fait}/{total} effectuées
              </span>
              <span className={cn(
                'text-[10px] font-bold',
                pct === 100 ? 'text-emerald-500' : 'text-gray-500 dark:text-gray-400'
              )}>
                {pct}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <motion.div
                className={cn('h-full rounded-full transition-colors', pct === 100 ? 'bg-emerald-500' : 'bg-indigo-500')}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
            {pct === 100 && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] text-emerald-500 font-semibold text-center"
              >
                Checklist complète — belle journée ! ✓
              </motion.p>
            )}
          </div>
        )}

        {/* Formulaire ajout */}
        <AnimatePresence>
          {ajoutOuvert && (
            <motion.form
              key="form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={soumettre}
              className="overflow-hidden"
            >
              <div className="flex gap-2 mb-2">
                <input
                  autoFocus
                  value={nouvelItem}
                  onChange={e => setNouvelItem(e.target.value)}
                  placeholder="Ex: Vérifier les sauvegardes…"
                  className="flex-1 text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
                >
                  OK
                </button>
                <button
                  type="button"
                  onClick={() => { setAjoutOuvert(false); setNouvelItem('') }}
                  className="w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Suggestions rapides */}
              {items.length === 0 && (
                <div className="space-y-1.5 pb-1">
                  <p className="text-[10px] text-gray-400 dark:text-gray-600 font-medium">Suggestions :</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => ajouterSuggestion(s)}
                        className="text-[10px] px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400 transition-colors"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.form>
          )}
        </AnimatePresence>

        {/* Liste vide */}
        {items.length === 0 && !ajoutOuvert && (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <ClipboardList className="w-8 h-8 text-gray-200 dark:text-gray-700" />
            <p className="text-xs text-gray-400 dark:text-gray-600">Aucune tâche récurrente configurée</p>
            <button
              onClick={() => setAjoutOuvert(true)}
              className="text-xs text-emerald-500 font-medium hover:underline"
            >
              Créer la checklist
            </button>
          </div>
        )}

        {/* Liste des items */}
        <div className="space-y-1.5">
          <AnimatePresence>
            {items.map(item => {
              const estCoche = cochesSet.has(item.id)
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors cursor-pointer',
                    estCoche
                      ? 'bg-emerald-50 dark:bg-emerald-950/20'
                      : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                  onClick={() => !suppression && toggle({ itemId: item.id, estCoche })}
                >
                  <div className={cn(
                    'shrink-0 transition-colors',
                    estCoche ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'
                  )}>
                    {estCoche
                      ? <CheckSquare className="w-4 h-4" />
                      : <Square className="w-4 h-4" />
                    }
                  </div>
                  <p className={cn(
                    'flex-1 text-xs font-medium transition-colors',
                    estCoche
                      ? 'line-through text-gray-400 dark:text-gray-600'
                      : 'text-gray-800 dark:text-gray-200'
                  )}>
                    {item.titre}
                  </p>

                  <AnimatePresence>
                    {suppression && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={async (e) => {
                          e.stopPropagation()
                          await supprimer(item.id)
                          toast.success('Supprimé')
                        }}
                        className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
