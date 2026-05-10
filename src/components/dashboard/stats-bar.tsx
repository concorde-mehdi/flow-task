'use client'

import { CheckCircle2, AlertTriangle, ListTodo, TrendingUp } from 'lucide-react'
import { useTaches } from '@/hooks/use-taches'
import { estUrgente } from '@/lib/utils'
import { isToday } from 'date-fns'

export function StatsBar() {
  const { data: taches = [] } = useTaches()

  const stats = {
    total: taches.filter(t => !t.statut).length,
    urgentes: taches.filter(t => estUrgente(t)).length,
    faitesAujourdhui: taches.filter(t => t.statut && t.updated_at && isToday(new Date(t.updated_at))).length,
    taux: taches.length ? Math.round((taches.filter(t => t.statut).length / taches.length) * 100) : 0,
  }

  const cartes = [
    {
      label: 'À faire',
      valeur: stats.total,
      icone: ListTodo,
      couleur: 'text-blue-500',
      fond: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      label: 'Urgentes',
      valeur: stats.urgentes,
      icone: AlertTriangle,
      couleur: 'text-red-500',
      fond: 'bg-red-50 dark:bg-red-950/30',
    },
    {
      label: "Terminées aujourd'hui",
      valeur: stats.faitesAujourdhui,
      icone: CheckCircle2,
      couleur: 'text-green-500',
      fond: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      label: 'Progression globale',
      valeur: `${stats.taux}%`,
      icone: TrendingUp,
      couleur: 'text-purple-500',
      fond: 'bg-purple-50 dark:bg-purple-950/30',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cartes.map((carte) => (
        <div
          key={carte.label}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{carte.label}</span>
            <div className={`w-7 h-7 rounded-lg ${carte.fond} flex items-center justify-center`}>
              <carte.icone className={`w-3.5 h-3.5 ${carte.couleur}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{carte.valeur}</p>
        </div>
      ))}
    </div>
  )
}
