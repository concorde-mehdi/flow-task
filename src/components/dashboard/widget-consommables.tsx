'use client'

import Link from 'next/link'
import { ArrowRight, Boxes, AlertTriangle } from 'lucide-react'
import { useConsommables } from '@/hooks/use-consommables'

const CAT_EMOJI: Record<string, string> = {
  'Cartouches': '🖨️', 'Câbles': '🔌', 'Papier': '📄', 'Batteries': '🔋',
  'Adaptateurs': '🔁', 'Disques': '💿', 'RAM': '🧠', 'Autre': '📦',
}

export function WidgetConsommables() {
  const { data: items = [], isLoading } = useConsommables()

  const alertes = items
    .filter(i => i.stock_actuel <= i.seuil_alerte)
    .sort((a, b) => a.stock_actuel - b.stock_actuel)
    .slice(0, 5)

  const nbRupture = items.filter(i => i.stock_actuel <= 0).length
  const nbAlerte = items.filter(i => i.stock_actuel > 0 && i.stock_actuel <= i.seuil_alerte).length

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center">
            <Boxes className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">Consommables</p>
          {(nbRupture + nbAlerte) > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <AlertTriangle className="w-2.5 h-2.5" />{nbRupture + nbAlerte}
            </span>
          )}
        </div>
        <Link href="/consommables" className="flex items-center gap-1 text-xs text-blue-500 font-medium">
          Voir tout <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2 flex-1">
          {[1, 2, 3].map(i => <div key={i} className="h-7 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}
        </div>
      ) : alertes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-3 text-center gap-1">
          <span className="text-2xl">✅</span>
          <p className="text-xs text-gray-400 dark:text-gray-600">
            {items.length === 0 ? 'Aucun consommable' : 'Tous les stocks sont OK'}
          </p>
        </div>
      ) : (
        <div className="space-y-1.5 flex-1">
          {alertes.map(item => (
            <div key={item.id} className="flex items-center gap-2">
              <span className="text-sm shrink-0">{CAT_EMOJI[item.categorie] ?? '📦'}</span>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 flex-1 truncate">{item.titre}</p>
              <div className="flex items-center gap-1 shrink-0">
                {item.stock_actuel <= 0 ? (
                  <span className="text-xs font-bold text-red-500">Rupture</span>
                ) : (
                  <span className="text-xs font-bold text-orange-500">{item.stock_actuel}</span>
                )}
                <span className="text-[10px] text-gray-300 dark:text-gray-700">/{item.seuil_alerte}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
