'use client'

import { motion } from 'framer-motion'
import { Pencil, Trash2, Plus, Minus } from 'lucide-react'
import { useSupprimerConsommable, useAjusterStock } from '@/hooks/use-consommables'
import type { Consommable } from '@/types'
import { cn } from '@/lib/utils'

const CAT_EMOJI: Record<string, string> = {
  'Cartouches': '🖨️', 'Câbles': '🔌', 'Papier': '📄', 'Batteries': '🔋',
  'Adaptateurs': '🔁', 'Disques': '💿', 'RAM': '🧠', 'Autre': '📦',
}

interface Props {
  item: Consommable
  onModifier: (item: Consommable) => void
}

function badgeStatut(stock: number, seuil: number) {
  if (stock <= 0) return { label: 'Rupture', cls: 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400' }
  if (stock <= seuil) return { label: 'Stock bas', cls: 'bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400' }
  return { label: 'OK', cls: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' }
}

export function CarteConsommable({ item, onModifier }: Props) {
  const { mutate: supprimer } = useSupprimerConsommable()
  const { mutate: ajuster } = useAjusterStock()
  const badge = badgeStatut(item.stock_actuel, item.seuil_alerte)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-4 group"
    >
      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-xl shrink-0">
        {CAT_EMOJI[item.categorie] ?? '📦'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.titre}</p>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">{item.categorie}</span>
          <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', badge.cls)}>{badge.label}</span>
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Stock : <span className={cn('font-bold', item.stock_actuel <= item.seuil_alerte ? 'text-orange-500' : 'text-gray-900 dark:text-white')}>{item.stock_actuel}</span>
            <span className="text-gray-300 dark:text-gray-700"> / seuil {item.seuil_alerte}</span>
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => ajuster({ id: item.id, delta: -1 })} disabled={item.stock_actuel <= 0}
              className="w-5 h-5 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-red-100 hover:text-red-500 disabled:opacity-30 transition-colors">
              <Minus className="w-2.5 h-2.5" />
            </button>
            <button onClick={() => ajuster({ id: item.id, delta: 1 })}
              className="w-5 h-5 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-emerald-100 hover:text-emerald-500 transition-colors">
              <Plus className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
        {item.notes && <p className="text-[10px] text-gray-400 mt-1 truncate">{item.notes}</p>}
      </div>

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
