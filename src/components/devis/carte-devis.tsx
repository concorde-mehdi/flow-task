'use client'

import { motion } from 'framer-motion'
import { Trash2, Pencil, Building2, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSupprimerDevis, useChangerStatutDevis } from '@/hooks/use-devis'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Devis, StatutDevis } from '@/types'

const STATUTS: Record<StatutDevis, { label: string; classe: string }> = {
  envoye: { label: 'Envoyé', classe: 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400' },
  en_attente_signature: { label: 'En attente', classe: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' },
  paye: { label: 'Payé', classe: 'bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400' },
  refuse: { label: 'Refusé', classe: 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400' },
}

const STATUTS_SUIVANTS: Record<StatutDevis, StatutDevis> = {
  envoye: 'en_attente_signature',
  en_attente_signature: 'paye',
  paye: 'paye',
  refuse: 'refuse',
}

interface Props {
  devis: Devis
  onModifier?: (devis: Devis) => void
}

export function CarteDevis({ devis, onModifier }: Props) {
  const { mutate: supprimer } = useSupprimerDevis()
  const { mutate: changerStatut } = useChangerStatutDevis()
  const info = STATUTS[devis.statut]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group flex items-start gap-3 p-4 rounded-xl border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800/50 transition-all"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{devis.titre}</p>
          <div className="flex items-center gap-2 shrink-0">
            {devis.montant != null && (
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {Number(devis.montant).toLocaleString('fr-TN', { minimumFractionDigits: 3 })} DT
              </span>
            )}
            <button
              onClick={() => {
                const suivant = STATUTS_SUIVANTS[devis.statut]
                if (suivant !== devis.statut) changerStatut({ id: devis.id, statut: suivant })
              }}
              title="Avancer le statut"
              className={cn('text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer hover:opacity-80 transition-opacity', info.classe)}
            >
              {info.label}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 flex-wrap">
          {devis.entreprise && (
            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{devis.entreprise}</span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(parseISO(devis.date_devis), 'd MMM yyyy', { locale: fr })}
          </span>
        </div>
        {devis.notes && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 line-clamp-1">{devis.notes}</p>}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0 mt-0.5">
        <button onClick={() => onModifier?.(devis)} className="text-gray-300 hover:text-blue-500 dark:text-gray-700 dark:hover:text-blue-400 transition-colors p-1">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => supprimer(devis.id)} className="text-gray-300 hover:text-red-500 dark:text-gray-700 dark:hover:text-red-400 transition-colors p-1">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  )
}
