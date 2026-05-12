'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Trash2, Pencil, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSupprimerLien, useMarquerConsulte } from '@/hooks/use-liens'
import type { Lien } from '@/types'

const COULEURS_CAT: Record<string, string> = {
  'Documentation': 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
  'Outils IT': 'bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400',
  'Formation': 'bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400',
  'Ressources clinique': 'bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400',
  'Fournisseurs': 'bg-teal-100 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400',
}

interface Props {
  lien: Lien
  onModifier?: (lien: Lien) => void
}

export function CarteLien({ lien, onModifier }: Props) {
  const { mutate: supprimer } = useSupprimerLien()
  const { mutate: marquerConsulte } = useMarquerConsulte()

  function ouvrir() {
    window.open(lien.url, '_blank', 'noopener,noreferrer')
    if (!lien.consulte) marquerConsulte(lien.id)
  }

  const couleurCat = COULEURS_CAT[lien.categorie] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group flex items-start gap-3 p-4 rounded-xl border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800/50 transition-all duration-150"
    >
      {/* Icône consulté */}
      <div className="shrink-0 mt-0.5">
        {lien.consulte ? (
          <CheckCircle2 className="w-4.5 h-4.5 text-green-500" />
        ) : (
          <div className="w-4.5 h-4.5 rounded-full border-2 border-gray-200 dark:border-gray-700" />
        )}
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <p className={cn('text-sm font-medium truncate', lien.consulte ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white')}>
            {lien.titre}
          </p>
          <div className="flex items-center gap-1 shrink-0">
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', couleurCat)}>
              {lien.categorie}
            </span>
            {!lien.consulte && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 font-medium">
                Non consulté
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 truncate mb-2">{lien.url}</p>

        {lien.notes && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{lien.notes}</p>
        )}

        <button
          onClick={ouvrir}
          className="mt-2 flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Ouvrir
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
        <button
          onClick={() => onModifier?.(lien)}
          className="text-gray-300 hover:text-blue-500 dark:text-gray-700 dark:hover:text-blue-400 transition-colors p-1"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => supprimer(lien.id)}
          className="text-gray-300 hover:text-red-500 dark:text-gray-700 dark:hover:text-red-400 transition-colors p-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  )
}
