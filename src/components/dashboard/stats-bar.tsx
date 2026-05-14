'use client'

import { CheckCircle2, AlertTriangle, ListTodo, TrendingUp } from 'lucide-react'
import { useTaches } from '@/hooks/use-taches'
import { estUrgente } from '@/lib/utils'
import { isToday, subDays, startOfDay } from 'date-fns'

function Sparkline({ donnees, couleur }: { donnees: number[]; couleur: string }) {
  if (donnees.length < 2) return null
  const max = Math.max(...donnees, 1)
  const W = 56
  const H = 20
  const points = donnees
    .map((v, i) => {
      const x = (i / (donnees.length - 1)) * W
      const y = H - Math.round((v / max) * H)
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg width={W} height={H} className="opacity-70">
      <polyline
        fill="none"
        stroke={couleur}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

export function StatsBar() {
  const { data: taches = [] } = useTaches()

  const stats = {
    total: taches.filter(t => !t.statut).length,
    urgentes: taches.filter(t => estUrgente(t)).length,
    faitesAujourdhui: taches.filter(t => t.statut && t.updated_at && isToday(new Date(t.updated_at))).length,
    taux: taches.length ? Math.round((taches.filter(t => t.statut).length / taches.length) * 100) : 0,
  }

  // Tâches complétées par jour sur les 7 derniers jours
  const completionsParJour = Array.from({ length: 7 }, (_, i) => {
    const debut = startOfDay(subDays(new Date(), 6 - i))
    const fin = startOfDay(subDays(new Date(), 5 - i))
    return taches.filter(t => {
      if (!t.statut || !t.updated_at) return false
      const d = new Date(t.updated_at)
      return d >= debut && d < fin
    }).length
  })

  // Tâches créées par jour sur les 7 derniers jours
  const creesParJour = Array.from({ length: 7 }, (_, i) => {
    const debut = startOfDay(subDays(new Date(), 6 - i))
    const fin = startOfDay(subDays(new Date(), 5 - i))
    return taches.filter(t => {
      const d = new Date(t.created_at)
      return d >= debut && d < fin
    }).length
  })

  // Urgentes par jour (créées)
  const urgentesParJour = Array.from({ length: 7 }, (_, i) => {
    const debut = startOfDay(subDays(new Date(), 6 - i))
    const fin = startOfDay(subDays(new Date(), 5 - i))
    return taches.filter(t => {
      const d = new Date(t.created_at)
      return estUrgente(t) && d >= debut && d < fin
    }).length
  })

  // Taux de complétion par jour
  const tauxParJour = Array.from({ length: 7 }, (_, i) => {
    const debut = startOfDay(subDays(new Date(), 6 - i))
    const fin = startOfDay(subDays(new Date(), 5 - i))
    const faites = taches.filter(t => t.statut && t.updated_at && new Date(t.updated_at) >= debut && new Date(t.updated_at) < fin).length
    const total = taches.filter(t => new Date(t.created_at) <= fin).length
    return total ? Math.round((faites / total) * 100) : 0
  })

  const cartes = [
    {
      label: 'À faire',
      valeur: stats.total,
      icone: ListTodo,
      couleur: 'text-blue-500',
      fond: 'bg-blue-50 dark:bg-blue-950/30',
      sparkCouleur: '#3b82f6',
      sparkDonnees: creesParJour,
    },
    {
      label: 'Urgentes',
      valeur: stats.urgentes,
      icone: AlertTriangle,
      couleur: 'text-red-500',
      fond: 'bg-red-50 dark:bg-red-950/30',
      sparkCouleur: '#ef4444',
      sparkDonnees: urgentesParJour,
    },
    {
      label: "Terminées aujourd'hui",
      valeur: stats.faitesAujourdhui,
      icone: CheckCircle2,
      couleur: 'text-green-500',
      fond: 'bg-green-50 dark:bg-green-950/30',
      sparkCouleur: '#22c55e',
      sparkDonnees: completionsParJour,
    },
    {
      label: 'Progression globale',
      valeur: `${stats.taux}%`,
      icone: TrendingUp,
      couleur: 'text-purple-500',
      fond: 'bg-purple-50 dark:bg-purple-950/30',
      sparkCouleur: '#a855f7',
      sparkDonnees: tauxParJour,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cartes.map((carte) => (
        <div
          key={carte.label}
          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{carte.label}</span>
            <div className={`w-7 h-7 rounded-lg ${carte.fond} flex items-center justify-center`}>
              <carte.icone className={`w-3.5 h-3.5 ${carte.couleur}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{carte.valeur}</p>
          <Sparkline donnees={carte.sparkDonnees} couleur={carte.sparkCouleur} />
        </div>
      ))}
    </div>
  )
}
