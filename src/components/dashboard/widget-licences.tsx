'use client'

import Link from 'next/link'
import { ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react'
import { useLicences, joursAvantExpiration } from '@/hooks/use-licences'
import { cn } from '@/lib/utils'

const TYPE_EMOJI: Record<string, string> = {
  'Logiciel': '💿', 'Antivirus': '🛡️', 'OS': '🖥️', 'Matériel': '🔧',
  'Cloud': '☁️', 'Garantie': '📋', 'Abonnement': '🔄', 'Autre': '📄',
}

export function WidgetLicences() {
  const { data: licences = [], isLoading } = useLicences()

  const bientot = licences
    .filter(l => {
      const j = joursAvantExpiration(l.date_expiration)
      return j !== null && j <= 90
    })
    .sort((a, b) => {
      const ja = joursAvantExpiration(a.date_expiration) ?? 999
      const jb = joursAvantExpiration(b.date_expiration) ?? 999
      return ja - jb
    })
    .slice(0, 5)

  const nbExpires = licences.filter(l => { const j = joursAvantExpiration(l.date_expiration); return j !== null && j < 0 }).length
  const nbBientot = licences.filter(l => { const j = joursAvantExpiration(l.date_expiration); return j !== null && j >= 0 && j <= 90 }).length

  function couleurJours(jours: number | null) {
    if (jours === null) return 'text-gray-400'
    if (jours < 0) return 'text-red-500'
    if (jours <= 30) return 'text-red-500'
    if (jours <= 60) return 'text-orange-500'
    return 'text-yellow-500'
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">Licences</p>
          {(nbExpires + nbBientot) > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <AlertTriangle className="w-2.5 h-2.5" />{nbExpires + nbBientot}
            </span>
          )}
        </div>
        <Link href="/licences" className="flex items-center gap-1 text-xs text-blue-500 font-medium">
          Voir tout <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2 flex-1">
          {[1, 2, 3].map(i => <div key={i} className="h-7 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}
        </div>
      ) : bientot.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-3 text-center gap-1">
          <span className="text-2xl">✅</span>
          <p className="text-xs text-gray-400 dark:text-gray-600">
            {licences.length === 0 ? 'Aucune licence' : 'Toutes les licences sont valides'}
          </p>
        </div>
      ) : (
        <div className="space-y-1.5 flex-1">
          {bientot.map(l => {
            const jours = joursAvantExpiration(l.date_expiration)
            return (
              <div key={l.id} className="flex items-center gap-2">
                <span className="text-sm shrink-0">{TYPE_EMOJI[l.type] ?? '📄'}</span>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 flex-1 truncate">{l.titre}</p>
                <span className={cn('text-xs font-bold shrink-0', couleurJours(jours))}>
                  {jours !== null && jours < 0 ? 'Expiré' : `${jours}j`}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
