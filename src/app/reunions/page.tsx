'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRequireAuth } from '@/hooks/use-auth'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { CarteReunion } from '@/components/reunions/carte-reunion'
import { FormulaireReunion } from '@/components/reunions/formulaire-reunion'
import { useReunions } from '@/hooks/use-reunions'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Reunion } from '@/types'

export default function PageReunions() {
  useRequireAuth()
  const { data: reunions = [], isLoading } = useReunions()
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [reunionAModifier, setReunionAModifier] = useState<Reunion | null>(null)

  const maintenant = new Date()
  const aVenir = reunions.filter(r => new Date(r.date_heure) >= maintenant)
  const passees = reunions.filter(r => new Date(r.date_heure) < maintenant)

  function ouvrirModification(reunion: Reunion) {
    setReunionAModifier(reunion)
    setFormulaireOuvert(true)
  }

  function fermerFormulaire() {
    setFormulaireOuvert(false)
    setReunionAModifier(null)
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header titre="Réunions" />
        <main className="flex-1 p-6 pb-24 md:pb-6">
          <div className="max-w-3xl mx-auto space-y-6">

            <div className="flex justify-end">
              <Button onClick={() => setFormulaireOuvert(true)} size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" />Nouvelle réunion
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {aVenir.length > 0 && (
                  <section className="space-y-3">
                    <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-blue-500" />
                      À venir
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">{aVenir.length}</span>
                    </h2>
                    <AnimatePresence mode="popLayout">
                      <motion.div className="space-y-2">
                        {aVenir.map(r => <CarteReunion key={r.id} reunion={r} onModifier={ouvrirModification} />)}
                      </motion.div>
                    </AnimatePresence>
                  </section>
                )}

                {passees.length > 0 && (
                  <section className="space-y-3">
                    <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-600">Passées</h2>
                    <AnimatePresence mode="popLayout">
                      <motion.div className="space-y-2">
                        {passees.map(r => <CarteReunion key={r.id} reunion={r} onModifier={ouvrirModification} />)}
                      </motion.div>
                    </AnimatePresence>
                  </section>
                )}

                {reunions.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <CalendarDays className="w-12 h-12 text-gray-200 dark:text-gray-800 mb-4" />
                    <p className="text-gray-400 dark:text-gray-600 text-sm">Aucune réunion planifiée</p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      <BottomNav />
      <FormulaireReunion ouvert={formulaireOuvert} onFermer={fermerFormulaire} reunionAModifier={reunionAModifier} />
    </div>
  )
}
