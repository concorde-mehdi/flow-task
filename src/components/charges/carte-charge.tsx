'use client'

import { motion } from 'framer-motion'
import { Trash2, Calendar, CheckCircle2, Clock, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToggleStatutCharge, useSupprimerCharge } from '@/hooks/use-charges'
import { format, isPast, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Charge } from '@/types'

interface Props {
  charge: Charge
  onModifier?: (charge: Charge) => void
}

export function CarteCharge({ charge, onModifier }: Props) {
  const { mutate: toggleStatut } = useToggleStatutCharge()
  const { mutate: supprimer } = useSupprimerCharge()

  const estPayee = charge.statut === 'paye'
  const enRetard = charge.date_echeance && !estPayee && isPast(parseISO(charge.date_echeance))

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group flex items-center gap-3 p-4 rounded-xl border transition-all duration-150',
        estPayee
          ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 opacity-70'
          : enRetard
            ? 'bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30'
            : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800/50'
      )}
    >
      {/* Toggle statut */}
      <button
        onClick={() => toggleStatut({ id: charge.id, statut: estPayee ? 'en_attente' : 'paye' })}
        className="shrink-0 transition-colors"
        title={estPayee ? 'Marquer non payé' : 'Marquer comme payé'}
      >
        {estPayee ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
          <Clock className={cn('w-5 h-5', enRetard ? 'text-red-400' : 'text-gray-300 hover:text-green-400')} />
        )}
      </button>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className={cn(
            'text-sm font-medium truncate',
            estPayee ? 'line-through text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'
          )}>
            {charge.titre}
          </p>
          <span className={cn(
            'text-sm font-bold shrink-0',
            estPayee ? 'text-gray-400' : enRetard ? 'text-red-500' : 'text-gray-900 dark:text-white'
          )}>
            {charge.montant.toLocaleString('fr-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' DT'}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full font-medium',
            charge.type === 'facture'
              ? 'bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400'
              : 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
          )}>
            {charge.type === 'facture' ? 'Facture' : 'Dépense'}
          </span>

          {charge.categorie && (
            <span className="text-xs text-gray-400 dark:text-gray-500">{charge.categorie}</span>
          )}

          <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>{format(parseISO(charge.date_charge), 'd MMM yyyy', { locale: fr })}</span>
          </div>

          {charge.date_echeance && (
            <span className={cn(
              'text-xs',
              enRetard ? 'text-red-500 font-medium' : 'text-gray-400'
            )}>
              Échéance : {format(parseISO(charge.date_echeance), 'd MMM', { locale: fr })}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
        <button
          onClick={() => onModifier?.(charge)}
          className="text-gray-300 hover:text-blue-500 dark:text-gray-700 dark:hover:text-blue-400 transition-colors p-1"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => supprimer(charge.id)}
          className="text-gray-300 hover:text-red-500 dark:text-gray-700 dark:hover:text-red-400 transition-colors p-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  )
}
