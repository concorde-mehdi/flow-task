'use client'

import { motion } from 'framer-motion'
import { Trash2, Pencil, Package, Calendar, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSupprimerMateriel, useChangerStatutMateriel } from '@/hooks/use-materiel'
import { format, parseISO, isPast } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Materiel, StatutMateriel } from '@/types'

const STATUTS: Record<StatutMateriel, { label: string; classe: string }> = {
  commande: { label: 'Commandé', classe: 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400' },
  en_livraison: { label: 'En livraison', classe: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' },
  livre: { label: 'Livré', classe: 'bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400' },
  en_panne: { label: 'En panne', classe: 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400' },
}

const STATUTS_SUIVANTS: Record<StatutMateriel, StatutMateriel> = {
  commande: 'en_livraison',
  en_livraison: 'livre',
  livre: 'livre',
  en_panne: 'en_panne',
}

interface Props {
  item: Materiel
  onModifier?: (item: Materiel) => void
}

export function CarteMateriel({ item, onModifier }: Props) {
  const { mutate: supprimer } = useSupprimerMateriel()
  const { mutate: changerStatut } = useChangerStatutMateriel()
  const info = STATUTS[item.statut]
  const enRetard = item.date_livraison_prevue && item.statut !== 'livre' && isPast(parseISO(item.date_livraison_prevue))

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group flex items-start gap-3 p-4 rounded-xl border transition-all',
        enRetard
          ? 'bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30'
          : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800/50'
      )}
    >
      <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 mt-0.5">
        <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.titre}</p>
            {item.quantite > 1 && <p className="text-xs text-gray-400">Qté : {item.quantite}</p>}
          </div>
          <button
            onClick={() => {
              const suivant = STATUTS_SUIVANTS[item.statut]
              if (suivant !== item.statut) changerStatut({ id: item.id, statut: suivant })
            }}
            className={cn('text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer hover:opacity-80 transition-opacity shrink-0', info.classe)}
          >
            {info.label}
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 flex-wrap">
          {item.fournisseur && <span>{item.fournisseur}</span>}
          {item.date_livraison_prevue && (
            <span className={cn('flex items-center gap-1', enRetard ? 'text-red-500 font-medium' : '')}>
              {enRetard && <AlertTriangle className="w-3 h-3" />}
              <Calendar className="w-3 h-3" />
              Livraison : {format(parseISO(item.date_livraison_prevue), 'd MMM yyyy', { locale: fr })}
            </span>
          )}
        </div>
        {item.notes && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 line-clamp-1">{item.notes}</p>}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0 mt-0.5">
        <button onClick={() => onModifier?.(item)} className="text-gray-300 hover:text-blue-500 dark:text-gray-700 dark:hover:text-blue-400 transition-colors p-1">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => supprimer(item.id)} className="text-gray-300 hover:text-red-500 dark:text-gray-700 dark:hover:text-red-400 transition-colors p-1">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  )
}
