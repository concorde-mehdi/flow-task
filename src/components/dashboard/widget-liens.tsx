'use client'

import Link from 'next/link'
import { Link2, ExternalLink, ArrowRight } from 'lucide-react'
import { useLiens, useMarquerConsulte } from '@/hooks/use-liens'

export function WidgetLiens() {
  const { data: liens = [], isLoading } = useLiens()
  const { mutate: marquerConsulte } = useMarquerConsulte()

  const nonConsultes = liens.filter(l => !l.consulte)
  const apercu = nonConsultes.slice(0, 3)

  function ouvrir(id: string, url: string) {
    window.open(url, '_blank', 'noopener,noreferrer')
    marquerConsulte(id)
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center">
            <Link2 className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Liens à consulter</p>
        </div>
        <Link href="/liens" className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors">
          Voir tout <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          ))}
        </div>
      ) : nonConsultes.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-gray-600">
          {liens.length === 0 ? 'Aucun lien enregistré' : 'Tous les liens ont été consultés ✓'}
        </p>
      ) : (
        <div className="space-y-1">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{nonConsultes.length}</p>
          <div className="space-y-2 mt-2">
            {apercu.map(lien => (
              <div key={lien.id} className="flex items-center justify-between gap-2">
                <p className="text-xs text-gray-700 dark:text-gray-300 truncate flex-1">{lien.titre}</p>
                <button
                  onClick={() => ouvrir(lien.id, lien.url)}
                  className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 shrink-0 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Ouvrir
                </button>
              </div>
            ))}
            {nonConsultes.length > 3 && (
              <p className="text-xs text-gray-400 dark:text-gray-600">+{nonConsultes.length - 3} autres</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
