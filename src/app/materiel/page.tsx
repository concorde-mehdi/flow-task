'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRequireAuth } from '@/hooks/use-auth'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { CarteMateriel } from '@/components/materiel/carte-materiel'
import { FormulaireMateriel } from '@/components/materiel/formulaire-materiel'
import { useMateriel } from '@/hooks/use-materiel'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Package, Monitor, AlertTriangle, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Materiel } from '@/types'
import { CATEGORIES_MATERIEL } from '@/types'
import { cn } from '@/lib/utils'

type Filtre = 'tout' | 'actif' | 'reserve' | 'panne'

const CAT_EMOJI: Record<string, string> = {
  'PC': '🖥️', 'Serveur': '🖧', 'Switch': '🔀', 'Routeur': '📡',
  'Imprimante': '🖨️', 'Écran': '🖵', 'Téléphone': '📞', 'NAS': '💾', 'Autre': '📦',
}

export default function PageMateriel() {
  useRequireAuth()
  const { data: materiel = [], isLoading } = useMateriel()
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [materielAModifier, setMaterielAModifier] = useState<Materiel | null>(null)
  const [filtre, setFiltre] = useState<Filtre>('tout')
  const [vue, setVue] = useState<'liste' | 'categorie'>('categorie')

  const totalActif   = materiel.reduce((s, m) => s + m.quantite_active, 0)
  const totalReserve = materiel.reduce((s, m) => s + m.quantite_reserve, 0)
  const totalPanne   = materiel.reduce((s, m) => s + m.quantite_panne, 0)
  const totalUnites  = totalActif + totalReserve + totalPanne

  const materielFiltre = materiel.filter(m => {
    if (filtre === 'tout')    return true
    if (filtre === 'actif')   return m.quantite_active > 0
    if (filtre === 'reserve') return m.quantite_reserve > 0
    if (filtre === 'panne')   return m.quantite_panne > 0
    return true
  })

  const parCategorie = CATEGORIES_MATERIEL.reduce((acc, cat) => {
    const items = materielFiltre.filter(m => m.categorie === cat)
    if (items.length > 0) acc[cat] = items
    return acc
  }, {} as Record<string, Materiel[]>)
  const autresCategories = materielFiltre.filter(m => !CATEGORIES_MATERIEL.includes(m.categorie as never))

  const filtres: { label: string; valeur: Filtre; count: number; color: string }[] = [
    { label: 'Tout', valeur: 'tout', count: materiel.length, color: '' },
    { label: 'Actifs', valeur: 'actif', count: materiel.filter(m => m.quantite_active > 0).length, color: 'text-emerald-600' },
    { label: 'Réserve', valeur: 'reserve', count: materiel.filter(m => m.quantite_reserve > 0).length, color: 'text-blue-600' },
    { label: 'En panne', valeur: 'panne', count: materiel.filter(m => m.quantite_panne > 0).length, color: 'text-red-600' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header titre="Parc informatique" />
        <main className="flex-1 p-6 pb-24 md:pb-6">
          <div className="max-w-3xl mx-auto space-y-5">

            {/* Stats globales */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total unités', val: totalUnites, icone: <Package className="w-4 h-4 text-gray-500" />, bg: 'bg-white dark:bg-gray-900', txt: 'text-gray-900 dark:text-white' },
                { label: 'Actifs', val: totalActif, icone: <Monitor className="w-4 h-4 text-emerald-500" />, bg: 'bg-emerald-50 dark:bg-emerald-950/30', txt: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Réserve', val: totalReserve, icone: <Archive className="w-4 h-4 text-blue-500" />, bg: 'bg-blue-50 dark:bg-blue-950/30', txt: 'text-blue-600 dark:text-blue-400' },
                { label: 'En panne', val: totalPanne, icone: <AlertTriangle className="w-4 h-4 text-red-500" />, bg: 'bg-red-50 dark:bg-red-950/30', txt: 'text-red-600 dark:text-red-400' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} border border-gray-100 dark:border-gray-800 rounded-2xl p-4`}>
                  <div className="flex items-center gap-2 mb-1">{s.icone}<p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p></div>
                  <p className={`text-2xl font-bold ${s.txt}`}>{s.val}</p>
                </div>
              ))}
            </div>

            {/* Barre globale actif/réserve/panne */}
            {totalUnites > 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Répartition globale</p>
                  <p className="text-xs text-gray-400">{totalUnites} unités</p>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                  {totalActif > 0   && <div className="bg-emerald-400 rounded-full transition-all" style={{ width: `${(totalActif / totalUnites) * 100}%` }} title={`Actifs: ${totalActif}`} />}
                  {totalReserve > 0 && <div className="bg-blue-300 rounded-full transition-all" style={{ width: `${(totalReserve / totalUnites) * 100}%` }} title={`Réserve: ${totalReserve}`} />}
                  {totalPanne > 0   && <div className="bg-red-400 rounded-full transition-all" style={{ width: `${(totalPanne / totalUnites) * 100}%` }} title={`En panne: ${totalPanne}`} />}
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1.5 text-[11px] text-gray-500"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Actifs {Math.round((totalActif / totalUnites) * 100)}%</span>
                  <span className="flex items-center gap-1.5 text-[11px] text-gray-500"><span className="w-2 h-2 rounded-full bg-blue-300 inline-block" />Réserve {Math.round((totalReserve / totalUnites) * 100)}%</span>
                  <span className="flex items-center gap-1.5 text-[11px] text-gray-500"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Panne {Math.round((totalPanne / totalUnites) * 100)}%</span>
                </div>
              </div>
            )}

            {/* Filtres + vues + bouton ajouter */}
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
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {(['liste', 'categorie'] as const).map(v => (
                    <button key={v} onClick={() => setVue(v)}
                      className={cn('text-xs px-2.5 py-1.5 font-medium transition-all capitalize',
                        vue === v ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      )}>
                      {v === 'liste' ? 'Liste' : 'Catégorie'}
                    </button>
                  ))}
                </div>
                <Button onClick={() => { setMaterielAModifier(null); setFormulaireOuvert(true) }} size="sm" className="gap-1.5">
                  <Plus className="w-4 h-4" /> Ajouter
                </Button>
              </div>
            </div>

            {/* Contenu */}
            {isLoading ? (
              <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl animate-pulse" />)}</div>
            ) : materielFiltre.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <span className="text-5xl">📦</span>
                <p className="text-gray-400 dark:text-gray-600 text-sm">Aucun équipement{filtre !== 'tout' ? ' dans ce filtre' : ''}</p>
                {filtre === 'tout' && (
                  <Button onClick={() => setFormulaireOuvert(true)} variant="outline" size="sm" className="gap-1.5">
                    <Plus className="w-4 h-4" /> Ajouter le premier équipement
                  </Button>
                )}
              </div>
            ) : vue === 'liste' ? (
              <AnimatePresence mode="popLayout">
                <div className="space-y-3">
                  {materielFiltre.map(m => (
                    <CarteMateriel key={m.id} item={m} onModifier={item => { setMaterielAModifier(item); setFormulaireOuvert(true) }} />
                  ))}
                </div>
              </AnimatePresence>
            ) : (
              <div className="space-y-6">
                {Object.entries(parCategorie).map(([cat, items]) => (
                  <section key={cat} className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                      <span>{CAT_EMOJI[cat] ?? '📦'}</span> {cat}
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 normal-case tracking-normal">{items.length}</span>
                    </h3>
                    <AnimatePresence mode="popLayout">
                      <div className="space-y-2">
                        {items.map(m => (
                          <CarteMateriel key={m.id} item={m} onModifier={item => { setMaterielAModifier(item); setFormulaireOuvert(true) }} />
                        ))}
                      </div>
                    </AnimatePresence>
                  </section>
                ))}
                {autresCategories.length > 0 && (
                  <section className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Non classé</h3>
                    <div className="space-y-2">
                      {autresCategories.map(m => (
                        <CarteMateriel key={m.id} item={m} onModifier={item => { setMaterielAModifier(item); setFormulaireOuvert(true) }} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      <BottomNav />
      <FormulaireMateriel
        ouvert={formulaireOuvert}
        onFermer={() => { setFormulaireOuvert(false); setMaterielAModifier(null) }}
        materielAModifier={materielAModifier}
      />
    </div>
  )
}
