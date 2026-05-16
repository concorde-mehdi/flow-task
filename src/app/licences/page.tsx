'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRequireAuth } from '@/hooks/use-auth'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { CarteLicence } from '@/components/licences/carte-licence'
import { FormulaireLicence } from '@/components/licences/formulaire-licence'
import { useLicences, joursAvantExpiration } from '@/hooks/use-licences'
import { AnimatePresence } from 'framer-motion'
import { Plus, ShieldCheck, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Licence } from '@/types'
import { cn } from '@/lib/utils'

type Filtre = 'tout' | 'expire' | 'bientot' | 'ok'

export default function PageLicences() {
  useRequireAuth()
  const { data: licences = [], isLoading } = useLicences()
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [licenceAModifier, setLicenceAModifier] = useState<Licence | null>(null)
  const [filtre, setFiltre] = useState<Filtre>('tout')

  const expirees = licences.filter(l => { const j = joursAvantExpiration(l.date_expiration); return j !== null && j < 0 })
  const bientot = licences.filter(l => { const j = joursAvantExpiration(l.date_expiration); return j !== null && j >= 0 && j <= 90 })
  const ok = licences.filter(l => { const j = joursAvantExpiration(l.date_expiration); return j === null || j > 90 })

  const filtres: { label: string; valeur: Filtre; count: number }[] = [
    { label: 'Tout', valeur: 'tout', count: licences.length },
    { label: 'Expirées', valeur: 'expire', count: expirees.length },
    { label: '≤ 90 jours', valeur: 'bientot', count: bientot.length },
    { label: 'OK', valeur: 'ok', count: ok.length },
  ]

  const licencesFiltrees = licences.filter(l => {
    const j = joursAvantExpiration(l.date_expiration)
    if (filtre === 'expire') return j !== null && j < 0
    if (filtre === 'bientot') return j !== null && j >= 0 && j <= 90
    if (filtre === 'ok') return j === null || j > 90
    return true
  })

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header titre="Licences & garanties" />
        <main className="flex-1 p-6 pb-24 md:pb-6">
          <div className="max-w-3xl mx-auto space-y-5">

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Expirées', val: expirees.length, bg: 'bg-red-50 dark:bg-red-950/20', txt: 'text-red-600 dark:text-red-400' },
                { label: '≤ 90 jours', val: bientot.length, bg: 'bg-orange-50 dark:bg-orange-950/20', txt: 'text-orange-600 dark:text-orange-400' },
                { label: 'Actives', val: ok.length, bg: 'bg-emerald-50 dark:bg-emerald-950/20', txt: 'text-emerald-600 dark:text-emerald-400' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} border border-gray-100 dark:border-gray-800 rounded-2xl p-4`}>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.txt}`}>{s.val}</p>
                </div>
              ))}
            </div>

            {/* Filtres + bouton */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {filtres.map(f => (
                  <button key={f.valeur} onClick={() => setFiltre(f.valeur)}
                    className={cn('text-xs px-3 py-1.5 rounded-full font-medium transition-all border',
                      filtre === f.valeur
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    )}>
                    {f.label} {f.count > 0 && <span className="opacity-60">({f.count})</span>}
                  </button>
                ))}
              </div>
              <Button onClick={() => { setLicenceAModifier(null); setFormulaireOuvert(true) }} size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" /> Ajouter
              </Button>
            </div>

            {/* Liste */}
            {isLoading ? (
              <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl animate-pulse" />)}</div>
            ) : licencesFiltrees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                {filtre !== 'tout' ? (
                  <>
                    <AlertTriangle className="w-12 h-12 text-gray-200 dark:text-gray-800" />
                    <p className="text-gray-400 dark:text-gray-600 text-sm">Aucune licence dans ce filtre</p>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-12 h-12 text-gray-200 dark:text-gray-800" />
                    <p className="text-gray-400 dark:text-gray-600 text-sm">Aucune licence enregistrée</p>
                    <Button onClick={() => setFormulaireOuvert(true)} variant="outline" size="sm" className="gap-1.5">
                      <Plus className="w-4 h-4" /> Ajouter la première
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="space-y-3">
                  {licencesFiltrees.map(l => (
                    <CarteLicence key={l.id} licence={l} onModifier={item => { setLicenceAModifier(item); setFormulaireOuvert(true) }} />
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>
      <BottomNav />
      <FormulaireLicence
        ouvert={formulaireOuvert}
        onFermer={() => { setFormulaireOuvert(false); setLicenceAModifier(null) }}
        licenceAModifier={licenceAModifier}
      />
    </div>
  )
}
