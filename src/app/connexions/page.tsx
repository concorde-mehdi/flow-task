'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRequireAuth } from '@/hooks/use-auth'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { CarteConnexion } from '@/components/connexions/carte-connexion'
import { FormulaireConnexion } from '@/components/connexions/formulaire-connexion'
import { useConnexions } from '@/hooks/use-connexions'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ConnexionPC } from '@/types'

export default function PageConnexions() {
  useRequireAuth()
  const { data: connexions = [], isLoading } = useConnexions()
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [connexionAModifier, setConnexionAModifier] = useState<ConnexionPC | null>(null)

  function ouvrirModification(connexion: ConnexionPC) {
    setConnexionAModifier(connexion)
    setFormulaireOuvert(true)
  }

  function fermerFormulaire() {
    setFormulaireOuvert(false)
    setConnexionAModifier(null)
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header titre="Connexions PC" />
        <main className="flex-1 p-6 pb-24 md:pb-6">
          <div className="max-w-3xl mx-auto space-y-5">

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cliquez sur <strong>Connecter</strong> pour télécharger le fichier RDP et ouvrir la session.
              </p>
              <Button onClick={() => setFormulaireOuvert(true)} size="sm" className="gap-1.5 shrink-0">
                <Plus className="w-4 h-4" />Nouveau
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : connexions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Monitor className="w-12 h-12 text-gray-200 dark:text-gray-800 mb-4" />
                <p className="text-gray-400 dark:text-gray-600 text-sm">Aucune connexion enregistrée</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <motion.div className="space-y-2">
                  {connexions.map(c => (
                    <CarteConnexion key={c.id} connexion={c} onModifier={ouvrirModification} />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>
      <BottomNav />
      <FormulaireConnexion ouvert={formulaireOuvert} onFermer={fermerFormulaire} connexionAModifier={connexionAModifier} />
    </div>
  )
}
