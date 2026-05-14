'use client'

import { Target, AlertTriangle, Clock } from 'lucide-react'
import { useTaches } from '@/hooks/use-taches'
import { estUrgente } from '@/lib/utils'

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const maintenant = new Date()
  const diff = Math.floor((d.getTime() - maintenant.getTime()) / 86400000)
  if (diff < 0) return { label: `${Math.abs(diff)}j de retard`, rouge: true }
  if (diff === 0) return { label: "Aujourd'hui", rouge: false }
  if (diff === 1) return { label: 'Demain', rouge: false }
  return { label: `Dans ${diff}j`, rouge: false }
}

export function WidgetPrioriteJour() {
  const { data: taches = [], isLoading } = useTaches({ statut: 'a_faire' })

  const urgentes = taches.filter(t => estUrgente(t))
  const hautePriorite = taches
    .filter(t => !estUrgente(t) && t.priorite === 'Haute')
    .slice(0, 3)

  const rien = urgentes.length === 0 && hautePriorite.length === 0

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center">
          <Target className="w-4 h-4 text-orange-500" />
        </div>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Priorité du jour</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-9 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}
        </div>
      ) : rien ? (
        <div className="flex items-center gap-2 py-3">
          <Target className="w-4 h-4 text-green-400" />
          <p className="text-xs text-gray-400 dark:text-gray-600">Aucune tâche urgente — super journée !</p>
        </div>
      ) : (
        <div className="space-y-2">
          {urgentes.slice(0, 3).map(t => (
            <div key={t.id} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/40">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <p className="flex-1 text-xs font-medium text-red-800 dark:text-red-200 truncate">{t.titre}</p>
              {t.deadline && (() => {
                const { label, rouge } = formatDate(t.deadline)
                return (
                  <span className={`text-xs font-medium shrink-0 flex items-center gap-1 ${rouge ? 'text-red-500' : 'text-red-400'}`}>
                    <Clock className="w-3 h-3" />{label}
                  </span>
                )
              })()}
            </div>
          ))}
          {hautePriorite.map(t => (
            <div key={t.id} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/40">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
              <p className="flex-1 text-xs font-medium text-orange-800 dark:text-orange-200 truncate">{t.titre}</p>
              {t.deadline && (() => {
                const { label, rouge } = formatDate(t.deadline)
                return (
                  <span className={`text-xs shrink-0 ${rouge ? 'text-red-500' : 'text-orange-400'}`}>{label}</span>
                )
              })()}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
