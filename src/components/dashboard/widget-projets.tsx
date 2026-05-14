'use client'

import Link from 'next/link'
import { ArrowRight, FolderKanban } from 'lucide-react'
import { useProjets } from '@/hooks/use-projets'

function Donut({
  valeur,
  total,
  couleur,
  fond,
  label,
}: {
  valeur: number
  total: number
  couleur: string
  fond: string
  label: string
}) {
  const r = 32
  const circonf = 2 * Math.PI * r
  const pct = total > 0 ? valeur / total : 0
  const dash = pct * circonf
  const offset = circonf * 0.25

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke={fond} strokeWidth="10" />
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke={couleur}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circonf}`}
            strokeDashoffset={-offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-gray-900 dark:text-white leading-none">{valeur}</span>
        </div>
      </div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center leading-tight">{label}</p>
    </div>
  )
}

export function WidgetProjets() {
  const { data: projets = [], isLoading } = useProjets()

  const enCours = projets.filter(p => p.statut === 'en_cours')
  const acheves = projets.filter(p => p.statut === 'acheve')
  const total = projets.length

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-green-50 dark:bg-green-950/50 flex items-center justify-center">
            <FolderKanban className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Projets</p>
        </div>
        <Link href="/projets" className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors">
          Voir tout <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center gap-8 py-4">
          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </div>
      ) : (
        <>
          <div className="flex justify-around mb-4">
            <Donut
              valeur={enCours.length}
              total={total || 1}
              couleur="#3b82f6"
              fond="#dbeafe"
              label={`En cours\n${enCours.length} projet${enCours.length !== 1 ? 's' : ''}`}
            />
            <Donut
              valeur={acheves.length}
              total={total || 1}
              couleur="#22c55e"
              fond="#dcfce7"
              label={`Achevés\n${acheves.length} projet${acheves.length !== 1 ? 's' : ''}`}
            />
          </div>

          {enCours.length > 0 && (
            <div className="space-y-1 border-t border-gray-50 dark:border-gray-800 pt-3">
              {enCours.slice(0, 3).map(p => (
                <div key={p.id} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{p.titre}</p>
                  <span className="text-xs text-gray-400 dark:text-gray-600 ml-auto shrink-0">{p.avancement}%</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
