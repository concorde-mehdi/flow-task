'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Clock, Trash2, AlertTriangle } from 'lucide-react'
import { cn, formatDeadline, formatHeure, badgePriorite, estUrgente, estEnRetard } from '@/lib/utils'
import { useToggleTache, useSupprimerTache } from '@/hooks/use-taches'
import type { Tache } from '@/types'

interface CarteTacheProps {
  tache: Tache
  onModifier?: (tache: Tache) => void
}

export function CarteTache({ tache, onModifier }: CarteTacheProps) {
  const { mutate: toggleStatut } = useToggleTache()
  const { mutate: supprimer } = useSupprimerTache()
  const urgente = estUrgente(tache)
  const retard = estEnRetard(tache)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group flex items-start gap-3 p-4 rounded-xl border transition-all duration-150',
        tache.statut
          ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 opacity-60'
          : urgente
            ? 'bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30'
            : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800/50'
      )}
    >
      {/* Checkbox */}
      <button
        onClick={() => toggleStatut({ id: tache.id, statut: !tache.statut })}
        className="mt-0.5 flex-shrink-0 text-gray-400 hover:text-blue-500 transition-colors"
      >
        {tache.statut ? (
          <CheckCircle2 className="w-5 h-5 text-blue-500" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </button>

      {/* Contenu */}
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => !tache.statut && onModifier?.(tache)}
      >
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            'text-sm font-medium leading-snug',
            tache.statut
              ? 'line-through text-gray-400 dark:text-gray-600'
              : 'text-gray-900 dark:text-white'
          )}>
            {tache.titre}
          </p>

          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0', badgePriorite(tache.priorite))}>
            {tache.priorite}
          </span>
        </div>

        {tache.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {tache.description}
          </p>
        )}

        <div className="flex items-center gap-3 mt-2">
          {/* Deadline */}
          {tache.deadline && (
            <div className={cn(
              'flex items-center gap-1 text-xs',
              retard && !tache.statut
                ? 'text-red-500'
                : urgente
                  ? 'text-orange-500'
                  : 'text-gray-400 dark:text-gray-500'
            )}>
              {urgente && <AlertTriangle className="w-3 h-3" />}
              <Clock className="w-3 h-3" />
              <span>{formatDeadline(tache.deadline)} {formatHeure(tache.deadline)}</span>
            </div>
          )}

          {/* Tags */}
          <div className="flex items-center gap-1 flex-wrap">
            {tache.tags.map((tag) => (
              <span
                key={tag.nom}
                className="text-xs px-1.5 py-0.5 rounded-full text-white font-medium"
                style={{ backgroundColor: tag.couleur }}
              >
                {tag.nom}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Supprimer */}
      <button
        onClick={() => supprimer(tache.id)}
        className="opacity-0 group-hover:opacity-100 flex-shrink-0 text-gray-300 hover:text-red-500 dark:text-gray-700 dark:hover:text-red-400 transition-all mt-0.5"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  )
}
