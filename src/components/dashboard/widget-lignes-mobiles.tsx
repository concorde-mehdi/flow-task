'use client'

import Link from 'next/link'
import { ArrowRight, Smartphone } from 'lucide-react'
import { useLignesMobiles } from '@/hooks/use-lignes-mobiles'
import { cn } from '@/lib/utils'

export function WidgetLignesMobiles() {
  const { data: lignes = [], isLoading } = useLignesMobiles()

  const actives   = lignes.filter(l => l.statut === 'active').length
  const suspendues = lignes.filter(l => l.statut === 'suspendue').length
  const enAttente = lignes.filter(l => l.statut === 'en_attente').length

  // Top forfaits
  const parForfait = lignes.reduce<Record<string, number>>((acc, l) => {
    const f = l.type_forfait || 'Non défini'
    acc[f] = (acc[f] ?? 0) + 1
    return acc
  }, {})
  const topForfaits = Object.entries(parForfait)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
            <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">Flotte mobile</p>
          {suspendues > 0 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
              {suspendues} susp.
            </span>
          )}
        </div>
        <Link href="/lignes-mobiles" className="flex items-center gap-1 text-xs text-blue-500 font-medium">
          Gérer <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {lignes.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          <div className="text-center bg-emerald-50 dark:bg-emerald-950/20 rounded-xl py-1.5">
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{actives}</p>
            <p className="text-[9px] text-emerald-500 font-medium">Actives</p>
          </div>
          <div className="text-center bg-orange-50 dark:bg-orange-950/20 rounded-xl py-1.5">
            <p className="text-sm font-bold text-orange-600 dark:text-orange-400">{suspendues}</p>
            <p className="text-[9px] text-orange-500 font-medium">Suspendues</p>
          </div>
          <div className="text-center bg-blue-50 dark:bg-blue-950/20 rounded-xl py-1.5">
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{enAttente}</p>
            <p className="text-[9px] text-blue-500 font-medium">En attente</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2 flex-1">
          {[1, 2, 3].map(i => <div key={i} className="h-6 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}
        </div>
      ) : lignes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-3 text-center gap-2">
          <Smartphone className="w-7 h-7 text-gray-200 dark:text-gray-700" />
          <p className="text-xs text-gray-400 dark:text-gray-600">Aucune ligne enregistrée</p>
          <Link href="/lignes-mobiles" className="text-xs text-blue-500 font-medium hover:underline">
            Importer depuis Excel →
          </Link>
        </div>
      ) : (
        <div className="space-y-1.5 flex-1">
          {topForfaits.map(([forfait, count]) => (
            <div key={forfait} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 flex-1 truncate">{forfait}</p>
              <span className="text-xs font-bold text-indigo-500 shrink-0">{count}</span>
            </div>
          ))}
          <p className="text-[10px] text-gray-400 dark:text-gray-600 pt-1">
            {lignes.length} ligne{lignes.length > 1 ? 's' : ''} au total
          </p>
        </div>
      )}
    </div>
  )
}
