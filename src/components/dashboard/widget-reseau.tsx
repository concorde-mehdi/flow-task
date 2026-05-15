'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, HelpCircle, Network, RefreshCw } from 'lucide-react'
import { useConnexions, useChangerStatutConnexion } from '@/hooks/use-connexions'
import type { StatutReseau } from '@/types'
import { cn } from '@/lib/utils'

const CYCLE: StatutReseau[] = ['inconnu', 'en_ligne', 'hors_ligne']

function prochainStatut(actuel: StatutReseau): StatutReseau {
  const idx = CYCLE.indexOf(actuel)
  return CYCLE[(idx + 1) % CYCLE.length]
}

const STATUT_CONFIG: Record<StatutReseau, { label: string; dot: string; badge: string; icone: React.FC<{ className?: string }> }> = {
  en_ligne: {
    label: 'En ligne',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    icone: Wifi,
  },
  hors_ligne: {
    label: 'Hors ligne',
    dot: 'bg-red-500',
    badge: 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400',
    icone: WifiOff,
  },
  inconnu: {
    label: 'Inconnu',
    dot: 'bg-gray-400',
    badge: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
    icone: HelpCircle,
  },
}

export function WidgetReseau() {
  const { data: connexions = [], isLoading, refetch } = useConnexions()
  const { mutate: changerStatut } = useChangerStatutConnexion()
  const [rafraichissement, setRafraichissement] = useState(false)

  const enLigne = connexions.filter(c => (c.statut ?? 'inconnu') === 'en_ligne').length
  const horsLigne = connexions.filter(c => (c.statut ?? 'inconnu') === 'hors_ligne').length
  const inconnu = connexions.filter(c => !c.statut || c.statut === 'inconnu').length

  async function rafraichir() {
    setRafraichissement(true)
    await refetch()
    setTimeout(() => setRafraichissement(false), 800)
  }

  function toggleStatut(id: string, actuel: StatutReseau) {
    changerStatut({ id, statut: prochainStatut(actuel) })
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center">
            <Network className="w-3.5 h-3.5 text-sky-500" />
          </div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">État réseau</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Compteurs */}
          {connexions.length > 0 && (
            <div className="flex items-center gap-1.5">
              {enLigne > 0 && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                  {enLigne} ↑
                </span>
              )}
              {horsLigne > 0 && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
                  {horsLigne} ↓
                </span>
              )}
              {inconnu > 0 && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  {inconnu} ?
                </span>
              )}
            </div>
          )}
          <button
            onClick={rafraichir}
            className="w-7 h-7 rounded-xl text-gray-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/30 flex items-center justify-center transition-colors"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', rafraichissement && 'animate-spin')} />
          </button>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : connexions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Network className="w-8 h-8 text-gray-200 dark:text-gray-700" />
            <p className="text-xs text-gray-400 dark:text-gray-600">Aucun équipement réseau configuré</p>
            <a href="/connexions" className="text-xs text-sky-500 font-medium hover:underline">
              Ajouter des équipements →
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {connexions.map(c => {
                const cfg = STATUT_CONFIG[(c.statut ?? 'inconnu') as StatutReseau]
                const Icone = cfg.icone
                return (
                  <motion.div
                    key={c.id}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"
                  >
                    {/* Dot pulse */}
                    <div className="relative shrink-0">
                      <div className={cn('w-2.5 h-2.5 rounded-full', cfg.dot)} />
                      {(c.statut ?? 'inconnu') === 'en_ligne' && (
                        <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-40" />
                      )}
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{c.nom}</p>
                      <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500">{c.ip}</p>
                    </div>

                    {/* Badge statut cliquable */}
                    <button
                      onClick={() => toggleStatut(c.id, (c.statut ?? 'inconnu') as StatutReseau)}
                      className={cn(
                        'flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors hover:opacity-80',
                        cfg.badge
                      )}
                      title="Cliquer pour changer le statut"
                    >
                      <Icone className="w-3 h-3" />
                      {cfg.label}
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center pt-1">
              Cliquez sur un statut pour le mettre à jour manuellement
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
