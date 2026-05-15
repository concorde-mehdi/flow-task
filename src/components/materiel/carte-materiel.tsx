'use client'

import { motion } from 'framer-motion'
import { Trash2, Pencil, MapPin } from 'lucide-react'
import { useSupprimerMateriel } from '@/hooks/use-materiel'
import type { Materiel } from '@/types'
import { cn } from '@/lib/utils'

const CAT_EMOJI: Record<string, string> = {
  'PC': '🖥️', 'Serveur': '🖧', 'Switch': '🔀', 'Routeur': '📡',
  'Imprimante': '🖨️', 'Écran': '🖵', 'Téléphone': '📞', 'NAS': '💾', 'Autre': '📦',
}

interface Props {
  item: Materiel
  onModifier: (item: Materiel) => void
}

export function CarteMateriel({ item, onModifier }: Props) {
  const { mutate: supprimer } = useSupprimerMateriel()
  const total = item.quantite_active + item.quantite_reserve + item.quantite_panne

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-4 group"
    >
      {/* Emoji catégorie */}
      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-xl shrink-0">
        {CAT_EMOJI[item.categorie] ?? '📦'}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.titre}</p>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            {item.categorie}
          </span>
          {item.localisation && (
            <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
              <MapPin className="w-2.5 h-2.5" />{item.localisation}
            </span>
          )}
        </div>

        {/* Barres quantités */}
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{item.quantite_active}</span>
            <span className="text-[10px] text-gray-400">actifs</span>
          </div>
          {item.quantite_reserve > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{item.quantite_reserve}</span>
              <span className="text-[10px] text-gray-400">réserve</span>
            </div>
          )}
          {item.quantite_panne > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <span className="text-xs font-bold text-red-600 dark:text-red-400">{item.quantite_panne}</span>
              <span className="text-[10px] text-gray-400">en panne</span>
            </div>
          )}
          <span className="text-[10px] text-gray-300 dark:text-gray-700 ml-1">/ {total} total</span>
        </div>

        {/* Barre visuelle */}
        {total > 0 && (
          <div className="flex gap-0.5 mt-1.5 h-1 rounded-full overflow-hidden w-40">
            <div className="bg-emerald-400 rounded-full" style={{ width: `${(item.quantite_active / total) * 100}%` }} />
            <div className="bg-blue-300 rounded-full" style={{ width: `${(item.quantite_reserve / total) * 100}%` }} />
            <div className="bg-red-400 rounded-full" style={{ width: `${(item.quantite_panne / total) * 100}%` }} />
          </div>
        )}

        {item.notes && <p className="text-[10px] text-gray-400 mt-1 truncate">{item.notes}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onModifier(item)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => supprimer(item.id)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  )
}
