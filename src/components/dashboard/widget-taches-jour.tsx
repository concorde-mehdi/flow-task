'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2, Circle, Target } from 'lucide-react'
import { useTaches } from '@/hooks/use-taches'
import { estUrgente } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { isToday } from 'date-fns'

const BADGE: Record<string, string> = {
  Haute: 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400',
  Moyenne: 'bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400',
  Basse: 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
}

export function WidgetTachesJour() {
  const { data: taches = [], isLoading } = useTaches({ statut: 'a_faire' })

  const tachesJour = [
    ...taches.filter(t => estUrgente(t)),
    ...taches.filter(t => !estUrgente(t) && t.priorite === 'Haute'),
    ...taches.filter(t => t.deadline && isToday(new Date(t.deadline)) && !estUrgente(t) && t.priorite !== 'Haute'),
    ...taches.filter(t => t.is_quotidienne && !estUrgente(t) && t.priorite !== 'Haute'),
  ].filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i).slice(0, 6)

  const restantes = taches.length - tachesJour.length

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center">
            <Target className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tâches du jour</p>
        </div>
        <Link href="/taches" className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors">
          Voir tout <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2.5 flex-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : tachesJour.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-4 text-center gap-2">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
          <p className="text-xs text-gray-400 dark:text-gray-600">Tout est à jour !</p>
        </div>
      ) : (
        <div className="space-y-2 flex-1">
          {tachesJour.map(t => (
            <div key={t.id} className="flex items-center gap-2.5 group">
              <Circle className="w-3.5 h-3.5 shrink-0 text-gray-300 dark:text-gray-600" />
              <p className={cn(
                'text-xs flex-1 truncate font-medium',
                estUrgente(t) ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
              )}>
                {t.titre}
              </p>
              <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0', BADGE[t.priorite])}>
                {t.priorite === 'Haute' ? 'Urgent' : t.priorite}
              </span>
              {t.deadline && (
                <span className="text-xs text-gray-400 dark:text-gray-600 shrink-0 tabular-nums">
                  {format(new Date(t.deadline), 'HH:mm', { locale: fr })}
                </span>
              )}
            </div>
          ))}
          {restantes > 0 && (
            <p className="text-xs text-blue-500 dark:text-blue-400 font-medium pt-1">
              + {restantes} tâche{restantes > 1 ? 's' : ''} restante{restantes > 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
