'use client'

import Link from 'next/link'
import { ArrowRight, Monitor, Plus } from 'lucide-react'
import { useConnexions } from '@/hooks/use-connexions'
import { toast } from 'sonner'

function telechargerRdp(nom: string, ip: string) {
  const contenu = [
    `full address:s:${ip}`,
    `username:s:`,
    `authentication level:i:2`,
    `enablecredsspsupport:i:1`,
    `prompt for credentials:i:1`,
    `use multimon:i:0`,
  ].join('\r\n')
  const blob = new Blob([contenu], { type: 'application/x-rdp' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${nom.replace(/\s+/g, '-')}.rdp`
  a.click()
  URL.revokeObjectURL(url)
  toast.success(`Connexion RDP lancée : ${nom}`)
}

export function WidgetConnexionsDashboard() {
  const { data: connexions = [], isLoading } = useConnexions()

  const liste = connexions.slice(0, 4)

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 flex items-center justify-center">
            <Monitor className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Connexions (PC)</p>
        </div>
        <Link href="/connexions" className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors">
          Voir tout <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2.5 flex-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : liste.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-4 text-center gap-2">
          <Monitor className="w-8 h-8 text-gray-200 dark:text-gray-700" />
          <p className="text-xs text-gray-400 dark:text-gray-600">Aucune connexion configurée</p>
        </div>
      ) : (
        <div className="space-y-2 flex-1">
          {liste.map(c => (
            <div key={c.id} className="flex items-center gap-3 py-1.5 px-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
              <Monitor className="w-4 h-4 text-gray-400 dark:text-gray-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{c.nom}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{c.ip}</p>
              </div>
              <button
                onClick={() => telechargerRdp(c.nom, c.ip)}
                className="shrink-0 text-xs font-semibold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-all bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 px-2.5 py-1 rounded-lg"
              >
                Se connecter
              </button>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/connexions"
        className="mt-4 flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Ajouter un PC
      </Link>
    </div>
  )
}
