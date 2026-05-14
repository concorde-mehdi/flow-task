'use client'

import Link from 'next/link'
import { FolderKanban, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useProjets } from '@/hooks/use-projets'

export function WidgetProjets() {
  const { data: projets = [], isLoading } = useProjets()

  const enCours = projets.filter(p => p.statut === 'en_cours')
  const avancementMoyen = enCours.length > 0
    ? Math.round(enCours.reduce((s, p) => s + p.avancement, 0) / enCours.length)
    : 0

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-green-50 dark:bg-green-950/50 flex items-center justify-center">
            <FolderKanban className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Projets actifs</p>
          {enCours.length > 0 && (
            <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400">
              {enCours.length}
            </span>
          )}
        </div>
        <Link href="/projets" className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors">
          Voir tout <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-1/2" />
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      ) : enCours.length === 0 ? (
        <div className="flex items-center gap-2 py-1">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <p className="text-xs text-gray-400 dark:text-gray-600">Aucun projet en cours</p>
        </div>
      ) : (
        <>
          {enCours.length > 1 && (
            <div className="flex items-center gap-2 py-1 border-b border-gray-50 dark:border-gray-800 pb-2">
              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-400 rounded-full transition-all duration-500"
                  style={{ width: `${avancementMoyen}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-green-500 shrink-0">{avancementMoyen}% moyen</span>
            </div>
          )}
          <div className="space-y-2.5">
            {enCours.slice(0, 4).map(p => {
              const couleur = p.avancement >= 75 ? 'bg-green-500' : p.avancement >= 40 ? 'bg-blue-500' : 'bg-amber-400'
              return (
                <Link key={p.id} href="/projets" className="block hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg px-1 py-1 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate flex-1 mr-2">{p.titre}</p>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 shrink-0">{p.avancement}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${couleur}`}
                      style={{ width: `${p.avancement}%` }}
                    />
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
