'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRequireAuth } from '@/hooks/use-auth'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { CarteProjet } from '@/components/projets/carte-projet'
import { FormulaireProjet } from '@/components/projets/formulaire-projet'
import { useProjets } from '@/hooks/use-projets'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, FolderKanban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Projet } from '@/types'

export default function PageProjets() {
  useRequireAuth()
  const { data: projets = [], isLoading } = useProjets()
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [projetAModifier, setProjetAModifier] = useState<Projet | null>(null)
  const [filtre, setFiltre] = useState<'tous' | 'en_cours' | 'acheve'>('tous')

  const enCours = projets.filter(p => p.statut === 'en_cours')
  const acheves = projets.filter(p => p.statut === 'acheve')
  const avancementMoyen = enCours.length > 0
    ? Math.round(enCours.reduce((s, p) => s + p.avancement, 0) / enCours.length)
    : 0

  const projetsFiltres = filtre === 'tous' ? projets : projets.filter(p => p.statut === filtre)

  function ouvrirModification(projet: Projet) {
    setProjetAModifier(projet)
    setFormulaireOuvert(true)
  }

  function fermerFormulaire() {
    setFormulaireOuvert(false)
    setProjetAModifier(null)
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header titre="Projets" />
        <main className="flex-1 p-6 pb-24 md:pb-6">
          <div className="max-w-3xl mx-auto space-y-5">

            {!isLoading && projets.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{projets.length}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-blue-500">{enCours.length}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">En cours</p>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-green-500">{avancementMoyen}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Avancement moyen</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {(['tous', 'en_cours', 'acheve'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFiltre(f)}
                    className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${
                      filtre === f
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300'
                    }`}
                  >
                    {f === 'tous' ? 'Tous' : f === 'en_cours' ? 'En cours' : 'Achevés'}
                  </button>
                ))}
              </div>
              <Button onClick={() => setFormulaireOuvert(true)} size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" />Nouveau
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : projetsFiltres.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FolderKanban className="w-12 h-12 text-gray-200 dark:text-gray-800 mb-4" />
                <p className="text-gray-400 dark:text-gray-600 text-sm">
                  {projets.length === 0 ? 'Aucun projet créé' : 'Aucun projet dans cette catégorie'}
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <motion.div className="space-y-2">
                  {projetsFiltres.map(p => (
                    <CarteProjet key={p.id} projet={p} onModifier={ouvrirModification} />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>
      <BottomNav />
      <FormulaireProjet ouvert={formulaireOuvert} onFermer={fermerFormulaire} projetAModifier={projetAModifier} />
    </div>
  )
}
