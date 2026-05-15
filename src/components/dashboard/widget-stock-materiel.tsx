'use client'

import Link from 'next/link'
import { ArrowRight, Package } from 'lucide-react'
import { useMateriel } from '@/hooks/use-materiel'

const CAT_EMOJI: Record<string, string> = {
  'PC': '🖥️', 'Serveur': '🖧', 'Switch': '🔀', 'Routeur': '📡',
  'Imprimante': '🖨️', 'Écran': '🖵', 'Téléphone': '📞', 'NAS': '💾', 'Autre': '📦',
}

export function WidgetStockMateriel() {
  const { data: materiel = [], isLoading } = useMateriel()

  const totalActif  = materiel.reduce((s, m) => s + m.quantite_active, 0)
  const totalPanne  = materiel.reduce((s, m) => s + m.quantite_panne, 0)
  const totalReserve = materiel.reduce((s, m) => s + m.quantite_reserve, 0)

  // Grouper par catégorie
  const parCat = materiel.reduce<Record<string, { actif: number; reserve: number; panne: number }>>((acc, m) => {
    const cat = m.categorie || 'Autre'
    if (!acc[cat]) acc[cat] = { actif: 0, reserve: 0, panne: 0 }
    acc[cat].actif   += m.quantite_active
    acc[cat].reserve += m.quantite_reserve
    acc[cat].panne   += m.quantite_panne
    return acc
  }, {})

  const lignes = Object.entries(parCat)
    .sort((a, b) => (b[1].actif + b[1].reserve + b[1].panne) - (a[1].actif + a[1].reserve + a[1].panne))
    .slice(0, 5)

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center">
            <Package className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">Parc IT</p>
        </div>
        <Link href="/materiel" className="flex items-center gap-1 text-xs text-blue-500 font-medium">
          Voir tout <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Totaux */}
      {materiel.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          <div className="text-center bg-emerald-50 dark:bg-emerald-950/20 rounded-xl py-1.5">
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{totalActif}</p>
            <p className="text-[9px] text-emerald-500 font-medium">Actifs</p>
          </div>
          <div className="text-center bg-blue-50 dark:bg-blue-950/20 rounded-xl py-1.5">
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{totalReserve}</p>
            <p className="text-[9px] text-blue-500 font-medium">Réserve</p>
          </div>
          <div className="text-center bg-red-50 dark:bg-red-950/20 rounded-xl py-1.5">
            <p className="text-sm font-bold text-red-600 dark:text-red-400">{totalPanne}</p>
            <p className="text-[9px] text-red-500 font-medium">En panne</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2 flex-1">
          {[1, 2, 3].map(i => <div key={i} className="h-7 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}
        </div>
      ) : lignes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-3 text-center gap-1">
          <Package className="w-7 h-7 text-gray-200 dark:text-gray-700" />
          <p className="text-xs text-gray-400 dark:text-gray-600">Aucun équipement</p>
        </div>
      ) : (
        <div className="space-y-1.5 flex-1">
          {lignes.map(([cat, { actif, reserve, panne }]) => {
            const total = actif + reserve + panne
            return (
              <div key={cat} className="flex items-center gap-2">
                <span className="text-sm shrink-0">{CAT_EMOJI[cat] ?? '📦'}</span>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 flex-1 truncate">{cat}</p>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{actif}</span>
                  {reserve > 0 && <span className="text-xs font-bold text-blue-500">+{reserve}</span>}
                  {panne > 0   && <span className="text-xs font-bold text-red-500">⚠{panne}</span>}
                  <span className="text-[10px] text-gray-300 dark:text-gray-700">/{total}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
