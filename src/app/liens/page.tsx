'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRequireAuth } from '@/hooks/use-auth'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { CarteLien } from '@/components/liens/carte-lien'
import { FormulaireLien } from '@/components/liens/formulaire-lien'
import { useLiens } from '@/hooks/use-liens'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Link2, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CATEGORIES_LIENS } from '@/types'
import type { Lien } from '@/types'

type FiltreCategorie = 'Tout' | typeof CATEGORIES_LIENS[number]

export default function PageLiens() {
  useRequireAuth()
  const { data: liens = [], isLoading } = useLiens()
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [lienAModifier, setLienAModifier] = useState<Lien | null>(null)
  const [filtre, setFiltre] = useState<FiltreCategorie>('Tout')

  const total = liens.length
  const nonConsultes = liens.filter(l => !l.consulte).length

  const liensFiltres = liens.filter(l => filtre === 'Tout' || l.categorie === filtre)

  function ouvrirModification(lien: Lien) {
    setLienAModifier(lien)
    setFormulaireOuvert(true)
  }

  function fermerFormulaire() {
    setFormulaireOuvert(false)
    setLienAModifier(null)
  }

  const filtres: { label: string; valeur: FiltreCategorie }[] = [
    { label: 'Tout', valeur: 'Tout' },
    ...CATEGORIES_LIENS.map(c => ({ label: c, valeur: c as FiltreCategorie })),
  ]

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header titre="Liens utiles" />

        <main className="flex-1 p-6 pb-24 md:pb-6">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center shrink-0">
                  <Link2 className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total liens</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{nonConsultes}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Non consultés</p>
                </div>
              </div>
            </div>

            {/* Actions + filtres */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {filtres.map(f => (
                  <button
                    key={f.valeur}
                    onClick={() => setFiltre(f.valeur)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                      filtre === f.valeur
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <Button onClick={() => setFormulaireOuvert(true)} size="sm" className="gap-1.5 shrink-0">
                <Plus className="w-4 h-4" />
                Nouveau lien
              </Button>
            </div>

            {/* Liste */}
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : liensFiltres.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Link2 className="w-12 h-12 text-gray-200 dark:text-gray-800 mb-4" />
                <p className="text-gray-400 dark:text-gray-600 text-sm">
                  {filtre === 'Tout' ? 'Aucun lien enregistré' : `Aucun lien dans "${filtre}"`}
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <motion.div className="space-y-3">
                  {liensFiltres.map(lien => (
                    <CarteLien
                      key={lien.id}
                      lien={lien}
                      onModifier={ouvrirModification}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>

      <BottomNav />

      <FormulaireLien
        ouvert={formulaireOuvert}
        onFermer={fermerFormulaire}
        lienAModifier={lienAModifier}
      />
    </div>
  )
}
