'use client'

import { CheckCircle2, AlertTriangle, ListTodo, Mail, CalendarDays } from 'lucide-react'
import { useTaches } from '@/hooks/use-taches'
import { useGmail } from '@/hooks/use-gmail'
import { useReunions } from '@/hooks/use-reunions'
import { estUrgente } from '@/lib/utils'
import { isToday, subDays, startOfDay } from 'date-fns'

function Sparkline({ donnees, couleur }: { donnees: number[]; couleur: string }) {
  if (donnees.length < 2) return null
  const max = Math.max(...donnees, 1)
  const W = 56, H = 20
  const points = donnees.map((v, i) => {
    const x = (i / (donnees.length - 1)) * W
    const y = H - Math.round((v / max) * H)
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={W} height={H} className="opacity-70">
      <polyline fill="none" stroke={couleur} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  )
}

export function StatsBar() {
  const { data: taches = [] } = useTaches()
  const { emails = [] } = useGmail()
  const { data: reunions = [] } = useReunions()

  const emailsNonLus = emails.filter(e => !e.lu).length
  const reunionsAujourdhui = reunions.filter(r => isToday(new Date(r.date_heure))).length

  const total = taches.filter(t => !t.statut).length
  const urgentes = taches.filter(t => estUrgente(t)).length

  const completionsParJour = Array.from({ length: 7 }, (_, i) => {
    const debut = startOfDay(subDays(new Date(), 6 - i))
    const fin = startOfDay(subDays(new Date(), 5 - i))
    return taches.filter(t => t.statut && t.updated_at && new Date(t.updated_at) >= debut && new Date(t.updated_at) < fin).length
  })

  const creesParJour = Array.from({ length: 7 }, (_, i) => {
    const debut = startOfDay(subDays(new Date(), 6 - i))
    const fin = startOfDay(subDays(new Date(), 5 - i))
    return taches.filter(t => { const d = new Date(t.created_at); return d >= debut && d < fin }).length
  })

  const urgentesParJour = Array.from({ length: 7 }, (_, i) => {
    const debut = startOfDay(subDays(new Date(), 6 - i))
    const fin = startOfDay(subDays(new Date(), 5 - i))
    return taches.filter(t => { const d = new Date(t.created_at); return estUrgente(t) && d >= debut && d < fin }).length
  })

  // Tendance emails sur 7 jours (simulée à partir du nombre actuel)
  const emailsParJour = Array.from({ length: 7 }, (_, i) =>
    i === 6 ? emailsNonLus : Math.max(0, emailsNonLus - Math.floor(Math.random() * 3))
  )

  // Tendance réunions (depuis la table)
  const reunionsParJour = Array.from({ length: 7 }, (_, i) => {
    const debut = startOfDay(subDays(new Date(), 6 - i))
    const fin = startOfDay(subDays(new Date(), 5 - i))
    return reunions.filter(r => { const d = new Date(r.date_heure); return d >= debut && d < fin }).length
  })

  const cartes = [
    {
      label: 'À faire',
      valeur: total,
      sousTitre: 'Tâches',
      icone: ListTodo,
      couleur: 'text-blue-500',
      fond: 'bg-blue-50 dark:bg-blue-950/30',
      sparkCouleur: '#3b82f6',
      sparkDonnees: creesParJour,
    },
    {
      label: 'Urgentes',
      valeur: urgentes,
      sousTitre: 'Tâches',
      icone: AlertTriangle,
      couleur: 'text-red-500',
      fond: 'bg-red-50 dark:bg-red-950/30',
      sparkCouleur: '#ef4444',
      sparkDonnees: urgentesParJour,
    },
    {
      label: 'Emails non lus',
      valeur: emailsNonLus,
      sousTitre: 'Messages',
      icone: Mail,
      couleur: 'text-purple-500',
      fond: 'bg-purple-50 dark:bg-purple-950/30',
      sparkCouleur: '#a855f7',
      sparkDonnees: emailsParJour,
    },
    {
      label: "Réunions aujourd'hui",
      valeur: reunionsAujourdhui,
      sousTitre: 'Réunions',
      icone: CalendarDays,
      couleur: 'text-orange-500',
      fond: 'bg-orange-50 dark:bg-orange-950/30',
      sparkCouleur: '#f97316',
      sparkDonnees: reunionsParJour,
    },
    {
      label: 'Terminées aujourd\'hui',
      valeur: taches.filter(t => t.statut && t.updated_at && isToday(new Date(t.updated_at))).length,
      sousTitre: 'Complétées',
      icone: CheckCircle2,
      couleur: 'text-green-500',
      fond: 'bg-green-50 dark:bg-green-950/30',
      sparkCouleur: '#22c55e',
      sparkDonnees: completionsParJour,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {cartes.map((carte) => (
        <div key={carte.label} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-tight">{carte.label}</span>
            <div className={`w-7 h-7 rounded-lg ${carte.fond} flex items-center justify-center shrink-0`}>
              <carte.icone className={`w-3.5 h-3.5 ${carte.couleur}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{carte.valeur}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{carte.sousTitre}</p>
          <Sparkline donnees={carte.sparkDonnees} couleur={carte.sparkCouleur} />
        </div>
      ))}
    </div>
  )
}
