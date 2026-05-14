'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, ArrowRight, Link2 } from 'lucide-react'
import { useLiens, useMarquerConsulte } from '@/hooks/use-liens'

const COULEURS = [
  'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500',
  'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-red-500',
  'bg-amber-500', 'bg-cyan-500', 'bg-violet-500', 'bg-emerald-500',
]

function couleurFallback(titre: string): string {
  let h = 0
  for (let i = 0; i < titre.length; i++) h = titre.charCodeAt(i) + ((h << 5) - h)
  return COULEURS[Math.abs(h) % COULEURS.length]
}

function initiales(titre: string): string {
  return titre.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase()
}

function getDomain(url: string): string {
  try { return new URL(url).hostname } catch { return url }
}

function faviconUrl(url: string): string {
  const domain = getDomain(url)
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
}

function IconeLien({ titre, url }: { titre: string; url: string }) {
  const [erreur, setErreur] = useState(false)

  if (erreur) {
    return (
      <div className={`w-14 h-14 rounded-2xl ${couleurFallback(titre)} flex items-center justify-center shadow-sm`}>
        <span className="text-white text-sm font-bold">{initiales(titre)}</span>
      </div>
    )
  }

  return (
    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center shadow-sm overflow-hidden">
      <img
        src={faviconUrl(url)}
        alt={titre}
        className="w-8 h-8 object-contain"
        onError={() => setErreur(true)}
      />
    </div>
  )
}

export function WidgetLiensRaccourcis() {
  const { data: liens = [], isLoading } = useLiens()
  const { mutate: marquerConsulte } = useMarquerConsulte()

  function ouvrir(id: string, url: string) {
    window.open(url, '_blank', 'noopener,noreferrer')
    marquerConsulte(id)
  }

  const raccourcis = liens.slice(0, 9)

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center">
            <Link2 className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Raccourcis / Liens</p>
        </div>
        <Link href="/liens" className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors">
          Gérer <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
              <div className="h-2.5 w-10 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : liens.length === 0 ? (
        <div className="flex flex-col items-center py-4 gap-3">
          <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
            Aucun lien enregistré. Ajoute tes sites fréquents.
          </p>
          <Link href="/liens" className="flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors">
            <Plus className="w-3.5 h-3.5" />Ajouter un lien
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-3">
          {raccourcis.map(lien => (
            <button
              key={lien.id}
              onClick={() => ouvrir(lien.id, lien.url)}
              className="group flex flex-col items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform"
              title={lien.url}
            >
              <div className="group-hover:shadow-md transition-shadow rounded-2xl">
                <IconeLien titre={lien.titre} url={lien.url} />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 text-center leading-tight line-clamp-1 w-full">
                {lien.titre}
              </span>
            </button>
          ))}

          <Link
            href="/liens"
            className="group flex flex-col items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform"
          >
            <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center group-hover:border-blue-400 dark:group-hover:border-blue-600 transition-colors">
              <Plus className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-blue-400 dark:group-hover:text-blue-500 transition-colors" />
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-600">Ajouter</span>
          </Link>
        </div>
      )}
    </div>
  )
}
