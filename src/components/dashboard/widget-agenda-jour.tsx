'use client'

import Link from 'next/link'
import { ArrowRight, CalendarDays, Plus } from 'lucide-react'
import { useReunions } from '@/hooks/use-reunions'
import { isToday, format } from 'date-fns'
import { fr } from 'date-fns/locale'

const COULEURS_DOT = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']

export function WidgetAgendaJour() {
  const { data: reunions = [], isLoading } = useReunions()

  const aujourd = new Date()
  const reunionsAujourdhui = reunions
    .filter(r => isToday(new Date(r.date_heure)))
    .sort((a, b) => new Date(a.date_heure).getTime() - new Date(b.date_heure).getTime())

  const moisLabel = format(aujourd, 'MMMM yyyy', { locale: fr })

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Agenda</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-600 capitalize">{moisLabel}</span>
        </div>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 pl-10">Aujourd&apos;hui</p>

      {isLoading ? (
        <div className="space-y-3 flex-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : reunionsAujourdhui.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-4 text-center gap-2">
          <CalendarDays className="w-8 h-8 text-gray-200 dark:text-gray-700" />
          <p className="text-xs text-gray-400 dark:text-gray-600">Aucune réunion aujourd&apos;hui</p>
        </div>
      ) : (
        <div className="space-y-3 flex-1">
          {reunionsAujourdhui.slice(0, 4).map((r, i) => (
            <div key={r.id} className="flex items-start gap-3">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tabular-nums w-10 shrink-0 pt-0.5">
                {format(new Date(r.date_heure), 'HH:mm')}
              </span>
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${COULEURS_DOT[i % COULEURS_DOT.length]}`} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{r.titre}</p>
                  {r.lieu && <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{r.lieu}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/reunions"
        className="mt-4 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-950/50 text-xs font-semibold text-purple-600 dark:text-purple-400 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Planifier une réunion
      </Link>
    </div>
  )
}
