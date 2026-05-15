'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, HelpCircle, Network, RefreshCw } from 'lucide-react'
import { useConnexions, useChangerStatutConnexion } from '@/hooks/use-connexions'
import type { StatutReseau } from '@/types'
import { cn } from '@/lib/utils'

const CYCLE: StatutReseau[] = ['inconnu', 'en_ligne', 'hors_ligne']
const PING_TIMEOUT_MS = 3000
const PING_INTERVAL_MS = 6 * 60 * 60 * 1000 // 6h
const LS_KEY = 'flowtask_last_ping'

function prochainStatut(actuel: StatutReseau): StatutReseau {
  const idx = CYCLE.indexOf(actuel)
  return CYCLE[(idx + 1) % CYCLE.length]
}

const STATUT_CONFIG: Record<StatutReseau, {
  label: string
  dot: string
  badge: string
  icone: React.FC<{ className?: string }>
}> = {
  en_ligne: { label: 'En ligne', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400', icone: Wifi },
  hors_ligne: { label: 'Hors ligne', dot: 'bg-red-500', badge: 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400', icone: WifiOff },
  inconnu: { label: 'Inconnu', dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400', icone: HelpCircle },
}

/* Ping via fetch no-cors depuis le navigateur (sur le réseau local) */
async function pingIP(ip: string): Promise<StatutReseau> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS)
  try {
    await fetch(`http://${ip}`, {
      mode: 'no-cors',
      signal: controller.signal,
      cache: 'no-store',
    })
    clearTimeout(timer)
    return 'en_ligne'
  } catch {
    clearTimeout(timer)
    return 'hors_ligne'
  }
}

export function WidgetReseau() {
  const { data: connexions = [], isLoading, refetch } = useConnexions()
  const { mutate: changerStatut } = useChangerStatutConnexion()
  const [scan, setScan] = useState(false)
  const [dernierScan, setDernierScan] = useState<Date | null>(null)

  /* Lancer le scan de toutes les IPs */
  const lancerScan = useCallback(async (liste: typeof connexions) => {
    if (liste.length === 0 || scan) return
    setScan(true)
    await Promise.all(
      liste.map(async c => {
        const statut = await pingIP(c.ip)
        changerStatut({ id: c.id, statut })
      })
    )
    const now = new Date()
    setDernierScan(now)
    localStorage.setItem(LS_KEY, now.toISOString())
    await refetch()
    setScan(false)
  }, [changerStatut, refetch, scan])

  /* Au chargement : vérifier si le dernier scan > 6h */
  useEffect(() => {
    if (connexions.length === 0) return
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) {
      lancerScan(connexions)
      return
    }
    const last = new Date(raw)
    setDernierScan(last)
    if (Date.now() - last.getTime() > PING_INTERVAL_MS) {
      lancerScan(connexions)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connexions.length])

  /* Interval 6h */
  useEffect(() => {
    const id = setInterval(() => {
      if (connexions.length > 0) lancerScan(connexions)
    }, PING_INTERVAL_MS)
    return () => clearInterval(id)
  }, [connexions, lancerScan])

  function toggleStatut(id: string, actuel: StatutReseau) {
    changerStatut({ id, statut: prochainStatut(actuel) })
  }

  const enLigne = connexions.filter(c => (c.statut ?? 'inconnu') === 'en_ligne').length
  const horsLigne = connexions.filter(c => (c.statut ?? 'inconnu') === 'hors_ligne').length
  const inconnu = connexions.filter(c => !c.statut || c.statut === 'inconnu').length

  function labelDernierScan() {
    if (!dernierScan) return null
    const diff = Math.round((Date.now() - dernierScan.getTime()) / 60000)
    if (diff < 1) return 'à l\'instant'
    if (diff < 60) return `il y a ${diff} min`
    return `il y a ${Math.round(diff / 60)}h`
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
          {dernierScan && !scan && (
            <span className="text-[10px] text-gray-400 dark:text-gray-600 font-medium">
              Scan {labelDernierScan()}
            </span>
          )}
          {scan && (
            <span className="text-[10px] text-sky-500 font-medium animate-pulse">Scan en cours…</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {connexions.length > 0 && (
            <div className="flex items-center gap-1">
              {enLigne > 0 && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">{enLigne}↑</span>}
              {horsLigne > 0 && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">{horsLigne}↓</span>}
              {inconnu > 0 && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">{inconnu}?</span>}
            </div>
          )}
          <button
            onClick={() => lancerScan(connexions)}
            disabled={scan || connexions.length === 0}
            className="w-7 h-7 rounded-xl text-gray-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/30 flex items-center justify-center transition-colors disabled:opacity-40"
            title="Scanner maintenant"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', scan && 'animate-spin')} />
          </button>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-10 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
          </div>
        ) : connexions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-5 text-center">
            <Network className="w-7 h-7 text-gray-200 dark:text-gray-700" />
            <p className="text-xs text-gray-400 dark:text-gray-600">Aucun équipement configuré</p>
            <a href="/connexions" className="text-xs text-sky-500 font-medium hover:underline">Ajouter des équipements →</a>
          </div>
        ) : (
          <div className="space-y-1.5">
            <AnimatePresence>
              {connexions.map(c => {
                const statut = (c.statut ?? 'inconnu') as StatutReseau
                const cfg = STATUT_CONFIG[statut]
                const Icone = cfg.icone
                return (
                  <motion.div
                    key={c.id}
                    layout
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"
                  >
                    <div className="relative shrink-0">
                      <div className={cn('w-2 h-2 rounded-full', cfg.dot)} />
                      {statut === 'en_ligne' && (
                        <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{c.nom}</p>
                      <p className="text-[10px] font-mono text-gray-400 dark:text-gray-500">{c.ip}</p>
                    </div>
                    <button
                      onClick={() => toggleStatut(c.id, statut)}
                      className={cn('flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg transition-colors hover:opacity-80', cfg.badge)}
                      title="Cliquer pour forcer le statut"
                    >
                      <Icone className="w-2.5 h-2.5" />
                      {cfg.label}
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center pt-1">
              Scan auto toutes les 6h · prochain dans {Math.max(0, Math.round((PING_INTERVAL_MS - (dernierScan ? Date.now() - dernierScan.getTime() : 0)) / 3600000))}h
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
