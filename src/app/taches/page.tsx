'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { CarteTache } from '@/components/taches/carte-tache'
import { FormulairesTache } from '@/components/taches/formulaire-tache'
import { SqueletteListe } from '@/components/taches/squelette-tache'
import { useTaches } from '@/hooks/use-taches'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Search, SlidersHorizontal, CheckCircle2 } from 'lucide-react'
import type { Tache, FiltresTaches, Priorite } from '@/types'
import { trierParPriorite } from '@/lib/utils'
import { cn } from '@/lib/utils'

const PRIORITES: Array<Priorite | 'Toutes'> = ['Toutes', 'Haute', 'Moyenne', 'Basse']
const STATUTS = [
  { valeur: 'toutes', label: 'Toutes' },
  { valeur: 'a_faire', label: 'À faire' },
  { valeur: 'faites', label: 'Terminées' },
] as const

export default function PageTaches() {
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [tacheAModifier, setTacheAModifier] = useState<Tache | null>(null)
  const [filtres, setFiltres] = useState<FiltresTaches>({ statut: 'toutes', priorite: 'Toutes' })
  const [recherche, setRecherche] = useState('')
  const [filtresVisibles, setFiltresVisibles] = useState(false)

  const { data: taches = [], isLoading } = useTaches({
    ...filtres,
    recherche: recherche || undefined,
  })

  const tachesTriees = trierParPriorite(taches)

  function ouvrirModification(tache: Tache) {
    setTacheAModifier(tache)
    setFormulaireOuvert(true)
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header titre="Mes tâches" />

        <main className="flex-1 p-6 pb-24 md:pb-6 max-w-4xl mx-auto w-full space-y-5">
          {/* Barre de recherche + actions */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher une tâche..."
                value={recherche}
                onChange={e => setRecherche(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setFiltresVisibles(!filtresVisibles)}
              className={cn(filtresVisibles && 'border-blue-500 text-blue-500')}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setFormulaireOuvert(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouvelle tâche</span>
            </Button>
          </div>

          {/* Filtres */}
          <AnimatePresence>
            {filtresVisibles && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4 space-y-4">
                  {/* Filtre statut */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Statut</p>
                    <div className="flex gap-2 flex-wrap">
                      {STATUTS.map(s => (
                        <button
                          key={s.valeur}
                          onClick={() => setFiltres(f => ({ ...f, statut: s.valeur }))}
                          className={cn(
                            'text-xs px-3 py-1.5 rounded-lg font-medium transition-all',
                            filtres.statut === s.valeur
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                          )}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filtre priorité */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Priorité</p>
                    <div className="flex gap-2 flex-wrap">
                      {PRIORITES.map(p => (
                        <button
                          key={p}
                          onClick={() => setFiltres(f => ({ ...f, priorite: p }))}
                          className={cn(
                            'text-xs px-3 py-1.5 rounded-lg font-medium transition-all',
                            filtres.priorite === p
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                          )}
                        >
                          {p === 'Haute' ? '🔴 ' : p === 'Moyenne' ? '🟠 ' : p === 'Basse' ? '🔵 ' : ''}
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Compteur */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {tachesTriees.length} tâche{tachesTriees.length !== 1 ? 's' : ''}
            </p>
            {(filtres.priorite !== 'Toutes' || filtres.statut !== 'toutes' || recherche) && (
              <button
                onClick={() => { setFiltres({ statut: 'toutes', priorite: 'Toutes' }); setRecherche('') }}
                className="text-xs text-blue-500 hover:text-blue-600 font-medium"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>

          {/* Liste des tâches */}
          {isLoading ? (
            <SqueletteListe count={5} />
          ) : tachesTriees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CheckCircle2 className="w-12 h-12 text-gray-200 dark:text-gray-800 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Aucune tâche trouvée</p>
              <p className="text-sm text-gray-400 dark:text-gray-600 mt-1">
                {recherche ? 'Essayez un autre mot-clé' : 'Commencez par créer une tâche !'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {tachesTriees.map(t => (
                  <CarteTache key={t.id} tache={t} onModifier={ouvrirModification} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      <BottomNav />

      <FormulairesTache
        ouvert={formulaireOuvert}
        onFermer={() => { setFormulaireOuvert(false); setTacheAModifier(null) }}
        tacheAModifier={tacheAModifier}
      />
    </div>
  )
}
