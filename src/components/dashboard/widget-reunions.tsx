'use client'

import Link from 'next/link'
import { CalendarDays, MapPin, Clock, ArrowRight } from 'lucide-react'
import { useReunions } from '@/hooks/use-reunions'

function formatDateHeure(iso: string) {
  const d = new Date(iso)
  const maintenant = new Date()
  const diffJours = Math.floor((d.getTime() - maintenant.getTime()) / 86400000)

  let labelJour: string
  if (diffJours === 0) labelJour = "Aujourd'hui"
  else if (diffJours === 1) labelJour = 'Demain'
  else labelJour = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })

  const heure = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return { labelJour, heure, diffJours }
}

function formatDuree(min: number) {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

export function WidgetReunions() {
  const { data: reunions = [], isLoading } = useReunions()

  const maintenant = new Date()
  const aVenir = reunions
    .filter(r => new Date(r.date_heure) >= maintenant)
    .slice(0, 3)

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Réunions à venir</p>
          {aVenir.length > 0 && (
            <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              {aVenir.length}
            </span>
          )}
        </div>
        <Link href="/reunions" className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors">
          Voir tout <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-2/3" />
                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : aVenir.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-gray-600 py-1">Aucune réunion planifiée ✓</p>
      ) : (
        <div className="space-y-2">
          {aVenir.map(r => {
            const { labelJour, heure, diffJours } = formatDateHeure(r.date_heure)
            const estAujourdhui = diffJours === 0
            return (
              <Link key={r.id} href="/reunions" className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg px-1 py-1 transition-colors">
                <div className={`flex flex-col items-center justify-center w-10 h-10 rounded-xl shrink-0 text-center ${estAujourdhui ? 'bg-purple-100 dark:bg-purple-950/50' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  <span className={`text-xs font-bold leading-none ${estAujourdhui ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}>{heure}</span>
                  <span className={`text-[10px] mt-0.5 leading-none ${estAujourdhui ? 'text-purple-500' : 'text-gray-400'}`}>{labelJour}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{r.titre}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-2.5 h-2.5" />{formatDuree(r.duree_minutes)}
                    </span>
                    {r.lieu && (
                      <span className="flex items-center gap-1 text-xs text-gray-400 truncate">
                        <MapPin className="w-2.5 h-2.5 shrink-0" />{r.lieu}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
