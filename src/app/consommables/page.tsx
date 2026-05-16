'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRequireAuth } from '@/hooks/use-auth'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { CarteConsommable } from '@/components/consommables/carte-consommable'
import { FormulaireConsommable } from '@/components/consommables/formulaire-consommable'
import { useConsommables } from '@/hooks/use-consommables'
import { AnimatePresence } from 'framer-motion'
import { Plus, Boxes, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Consommable } from '@/types'
import { cn } from '@/lib/utils'

type Filtre = 'tout' | 'alerte' | 'rupture' | 'ok'

export default function PageConsommables() {
  useRequireAuth()
  const { data: items = [], isLoading } = useConsommables()
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [itemAModifier, setItemAModifier] = useState<Consommable | null>(null)
  const [filtre, setFiltre] = useState<Filtre>('tout')

  const enRupture = items.filter(i => i.stock_actuel <= 0)
  const enAlerte = items.filter(i => i.stock_actuel > 0 && i.stock_actuel <= i.seuil_alerte)
  const ok = items.filter(i => i.stock_actuel > i.seuil_alerte)

  const filtres: { label: string; valeur: Filtre; count: number; color: string }[] = [
    { label: 'Tout', valeur: 'tout', count: items.length, color: '' },
    { label: 'Rupture', valeur: 'rupture', count: enRupture.length, color: 'text-red-600' },
    { label: 'Stock bas', valeur: 'alerte', count: enAlerte.length, color: 'text-orange-600' },
    { label: 'OK', valeur: 'ok', count: ok.length, color: 'text-emerald-600' },
  ]

  const itemsFiltres = items.filter(i => {
    if (filtre === 'rupture') return i.stock_actuel <= 0
    if (filtre === 'alerte') return i.stock_actuel > 0 && i.stock_actuel <= i.seuil_alerte
    if (filtre === 'ok') return i.stock_actuel > i.seuil_alerte
    return true
  })

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header titre="Consommables" />
        <main className="flex-1 p-6 pb-24 md:pb-6">
          <div className="max-w-3xl mx-auto space-y-5">

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Rupture', val: enRupture.length, bg: 'bg-red-50 dark:bg-red-950/20', txt: 'text-red-600 dark:text-red-400', icone: <AlertTriangle className="w-4 h-4 text-red-500" /> },
                { label: 'Stock bas', val: enAlerte.length, bg: 'bg-orange-50 dark:bg-orange-950/20', txt: 'text-orange-600 dark:text-orange-400', icone: <AlertTriangle className="w-4 h-4 text-orange-500" /> },
                { label: 'OK', val: ok.length, bg: 'bg-emerald-50 dark:bg-emerald-950/20', txt: 'text-emerald-600 dark:text-emerald-400', icone: <CheckCircle className="w-4 h-4 text-emerald-500" /> },
              ].map(s => (
                <div key={s.label} className={`${s.bg} border border-gray-100 dark:border-gray-800 rounded-2xl p-4`}>
                  <div className="flex items-center gap-2 mb-1">{s.icone}<p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p></div>
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
              <Button onClick={() => { setItemAModifier(null); setFormulaireOuvert(true) }} size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" /> Ajouter
              </Button>
            </div>

            {/* Liste */}
            {isLoading ? (
              <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl animate-pulse" />)}</div>
            ) : itemsFiltres.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Boxes className="w-12 h-12 text-gray-200 dark:text-gray-800" />
                <p className="text-gray-400 dark:text-gray-600 text-sm">
                  {filtre !== 'tout' ? 'Aucun consommable dans ce filtre' : 'Aucun consommable enregistré'}
                </p>
                {filtre === 'tout' && (
                  <Button onClick={() => setFormulaireOuvert(true)} variant="outline" size="sm" className="gap-1.5">
                    <Plus className="w-4 h-4" /> Ajouter le premier
                  </Button>
                )}
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="space-y-3">
                  {itemsFiltres.map(i => (
                    <CarteConsommable key={i.id} item={i} onModifier={item => { setItemAModifier(item); setFormulaireOuvert(true) }} />
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>
      <BottomNav />
      <FormulaireConsommable
        ouvert={formulaireOuvert}
        onFermer={() => { setFormulaireOuvert(false); setItemAModifier(null) }}
        itemAModifier={itemAModifier}
      />
    </div>
  )
}
