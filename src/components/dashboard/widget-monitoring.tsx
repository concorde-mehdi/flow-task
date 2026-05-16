'use client'

import Link from 'next/link'
import { ArrowRight, Activity, RefreshCw, Loader2 } from 'lucide-react'
import { useSitesMonitores, useModifierSite, useVerifierTousSites } from '@/hooks/use-sites-monitores'
import { cn } from '@/lib/utils'

export function WidgetMonitoring() {
  const { data: sites = [], isLoading } = useSitesMonitores()
  const { mutate: verifierTous, isPending } = useVerifierTousSites()

  const enLigne = sites.filter(s => s.statut === 'en_ligne').length
  const horsLigne = sites.filter(s => s.statut === 'hors_ligne').length

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5 text-sky-500" />
          </div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">Sites web</p>
          {horsLigne > 0 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {horsLigne} HS
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {sites.length > 0 && (
            <button onClick={() => verifierTous(sites)} disabled={isPending}
              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-sky-500 transition-colors">
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            </button>
          )}
          <Link href="/monitoring" className="flex items-center gap-1 text-xs text-blue-500 font-medium">
            Voir tout <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {sites.length > 0 && (
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          <div className="text-center bg-emerald-50 dark:bg-emerald-950/20 rounded-xl py-1.5">
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{enLigne}</p>
            <p className="text-[9px] text-emerald-500 font-medium">En ligne</p>
          </div>
          <div className="text-center bg-red-50 dark:bg-red-950/20 rounded-xl py-1.5">
            <p className="text-sm font-bold text-red-600 dark:text-red-400">{horsLigne}</p>
            <p className="text-[9px] text-red-500 font-medium">Hors ligne</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2 flex-1">
          {[1, 2, 3].map(i => <div key={i} className="h-6 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}
        </div>
      ) : sites.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-3 text-center gap-1">
          <Activity className="w-7 h-7 text-gray-200 dark:text-gray-700" />
          <p className="text-xs text-gray-400 dark:text-gray-600">Aucun site surveillé</p>
        </div>
      ) : (
        <div className="space-y-1.5 flex-1">
          {sites.slice(0, 5).map(site => (
            <div key={site.id} className="flex items-center gap-2">
              <div className={cn('w-2 h-2 rounded-full shrink-0',
                site.statut === 'en_ligne' ? 'bg-emerald-400' :
                site.statut === 'hors_ligne' ? 'bg-red-400' : 'bg-gray-300 dark:bg-gray-600'
              )} />
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 flex-1 truncate">{site.titre}</p>
              <span className={cn('text-[10px] font-semibold shrink-0',
                site.statut === 'en_ligne' ? 'text-emerald-500' :
                site.statut === 'hors_ligne' ? 'text-red-500' : 'text-gray-400'
              )}>
                {site.statut === 'en_ligne' ? '✓' : site.statut === 'hors_ligne' ? '✗' : '?'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
