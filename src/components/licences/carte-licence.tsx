'use client'

import { motion } from 'framer-motion'
import { Pencil, Trash2, Key } from 'lucide-react'
import { useSupprimerLicence, joursAvantExpiration } from '@/hooks/use-licences'
import { toast } from 'sonner'
import type { Licence } from '@/types'
import { cn } from '@/lib/utils'

const TYPE_EMOJI: Record<string, string> = {
  'Logiciel': '💿', 'Antivirus': '🛡️', 'OS': '🖥️', 'Matériel': '🔧',
  'Cloud': '☁️', 'Garantie': '📋', 'Abonnement': '🔄', 'Autre': '📄',
}

function badgeExpiration(jours: number | null) {
  if (jours === null) return null
  if (jours < 0) return { label: `Expiré (${Math.abs(jours)}j)`, cls: 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400' }
  if (jours <= 30) return { label: `${jours}j`, cls: 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400' }
  if (jours <= 60) return { label: `${jours}j`, cls: 'bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400' }
  if (jours <= 90) return { label: `${jours}j`, cls: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-950/40 dark:text-yellow-400' }
  return { label: `${jours}j`, cls: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' }
}

interface Props {
  licence: Licence
  onModifier: (l: Licence) => void
}

export function CarteLicence({ licence, onModifier }: Props) {
  const { mutate: supprimer } = useSupprimerLicence()
  const jours = joursAvantExpiration(licence.date_expiration)
  const badge = badgeExpiration(jours)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-4 group"
    >
      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-xl shrink-0">
        {TYPE_EMOJI[licence.type] ?? '📄'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{licence.titre}</p>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">{licence.type}</span>
          {badge && (
            <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', badge.cls)}>
              {jours !== null && jours < 0 ? badge.label : `Expire dans ${badge.label}`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          {licence.fournisseur && <p className="text-xs text-gray-400">{licence.fournisseur}</p>}
          {licence.date_expiration && (
            <p className="text-xs text-gray-400">
              Expire le {new Date(licence.date_expiration).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
        {licence.cle_licence && (
          <button
            onClick={() => { navigator.clipboard.writeText(licence.cle_licence!); toast.success('Clé copiée !') }}
            className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 hover:text-indigo-500 transition-colors"
          >
            <Key className="w-2.5 h-2.5" />
            <span className="font-mono truncate max-w-[200px]">{licence.cle_licence}</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onModifier(licence)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => supprimer(licence.id)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  )
}
