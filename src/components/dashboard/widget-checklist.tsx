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

const SUGGESTIONS = [
  'Vérifier les sauvegardes',
  'Contrôler les imprimantes',
  'Vider les alertes antivirus',
  'Vérifier la connectivité',
  'Contrôler la messagerie',
  'Journal des incidents',
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
  const fait  = coches.length
  const pct   = total === 0 ? 0 : Math.round((fait / total) * 100)

  async function soumettre(e: React.FormEvent) {
    e.preventDefault()
    const titre = nouvelItem.trim()
    if (!titre) return
    await ajouter(titre)
    setNouvelItem('')
    setAjoutOuvert(false)
  }

  if (isError) return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3">
      <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
        <ClipboardList className="w-3.5 h-3.5 text-emerald-500" />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-900 dark:text-white">Checklist</p>
        <p className="text-[10px] text-amber-500">Exécuter le SQL dans Supabase</p>
      </div>
    </div>
  )

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
            <ClipboardList className="w-3 h-3 text-emerald-500" />
          </div>
          <span className="text-xs font-bold text-gray-900 dark:text-white">Checklist</span>
        </div>
        <div className="flex items-center gap-1.5">
          {total > 0 && (
            <span className={cn(
              'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
              pct === 100
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
            )}>
              {fait}/{total}
            </span>
          )}
          {total > 0 && (
            <button
              onClick={() => setSuppression(v => !v)}
              className={cn('w-5 h-5 rounded flex items-center justify-center transition-colors',
                suppression ? 'text-red-400' : 'text-gray-300 hover:text-red-400')}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={() => setAjoutOuvert(v => !v)}
            className="w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-emerald-500 transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Barre progression */}
      {total > 0 && (
        <div className="px-4 mb-2">
          <div className="h-1 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', pct === 100 ? 'bg-emerald-500' : 'bg-indigo-400')}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      )}

      {/* Formulaire ajout */}
      <AnimatePresence>
        {ajoutOuvert && (
          <motion.div
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden px-4 pb-2"
          >
            <form onSubmit={soumettre} className="flex gap-1.5">
              <input
                autoFocus
                value={nouvelItem}
                onChange={e => setNouvelItem(e.target.value)}
                placeholder="Nouvelle tâche…"
                className="flex-1 text-[11px] border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-900 outline-none focus:ring-1 focus:ring-emerald-400"
              />
              <button type="submit" className="px-2 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold">OK</button>
              <button type="button" onClick={() => setAjoutOuvert(false)} className="px-1 text-gray-400 hover:text-gray-600"><X className="w-3 h-3" /></button>
            </form>
            {items.length === 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {SUGGESTIONS.map(s => (
                  <button key={s} type="button" onClick={async () => { await ajouter(s); toast.success('Ajouté') }}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                    +{s}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste */}
      <div className="flex-1 px-4 pb-3 space-y-1 overflow-y-auto max-h-48">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-4 text-center">
            <ClipboardList className="w-6 h-6 text-gray-200 dark:text-gray-700" />
            <p className="text-[10px] text-gray-400 dark:text-gray-600">Aucune tâche</p>
            <button onClick={() => setAjoutOuvert(true)} className="text-[10px] text-emerald-500 font-medium hover:underline">Créer la checklist</button>
          </div>
        ) : (
          <AnimatePresence>
            {items.map(item => {
              const estCoche = cochesSet.has(item.id)
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors',
                    estCoche ? 'bg-emerald-50 dark:bg-emerald-950/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  )}
                  onClick={() => !suppression && toggle({ itemId: item.id, estCoche })}
                >
                  <span className={cn('shrink-0', estCoche ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600')}>
                    {estCoche ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                  </span>
                  <p className={cn('flex-1 text-[11px] font-medium', estCoche ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200')}>
                    {item.titre}
                  </p>
                  <AnimatePresence>
                    {suppression && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                        onClick={async e => { e.stopPropagation(); await supprimer(item.id) }}
                        className="shrink-0 w-4 h-4 flex items-center justify-center text-red-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {pct === 100 && total > 0 && (
        <p className="text-[10px] text-emerald-500 font-semibold text-center pb-2">Tout coché ✓</p>
      )}
    </div>
  )
}
