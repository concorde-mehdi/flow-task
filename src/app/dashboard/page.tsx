'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { StatsBar } from '@/components/dashboard/stats-bar'
import { AjoutRapide } from '@/components/dashboard/ajout-rapide'
import { CarteTache } from '@/components/taches/carte-tache'
import { FormulairesTache } from '@/components/taches/formulaire-tache'
import { SqueletteListe } from '@/components/taches/squelette-tache'
import { useTaches, useTachesUrgentes, useTachesQuotidiennes } from '@/hooks/use-taches'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, RefreshCcw, CalendarClock, CheckCircle2 } from 'lucide-react'
import type { Tache } from '@/types'
import { trierParPriorite } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function PageDashboard() {
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [tacheAModifier, setTacheAModifier] = useState<Tache | null>(null)

  const { data: tachesUrgentes = [], isLoading: loadUrgent } = useTachesUrgentes()
  const { data: tachesQuotidiennes = [], isLoading: loadQuot } = useTachesQuotidiennes()
  const { data: toutesLesTaches = [], isLoading: loadAll } = useTaches({ statut: 'a_faire' })

  const tachesAVenir = trierParPriorite(
    toutesLesTaches.filter(t =>
      !tachesUrgentes.some(u => u.id === t.id) &&
      !tachesQuotidiennes.some(q => q.id === t.id)
    )
  ).slice(0, 5)

  function ouvrirModification(tache: Tache) {
    setTacheAModifier(tache)
    setFormulaireOuvert(true)
  }

  function fermerFormulaire() {
    setFormulaireOuvert(false)
    setTacheAModifier(null)
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header titre="Tableau de bord" />

        <main className="flex-1 p-6 pb-24 md:pb-6 space-y-6 max-w-5xl mx-auto w-full">
          {/* Date du jour */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
            </p>
          </div>

          {/* Statistiques */}
          <StatsBar />

          {/* Ajout rapide */}
          <AjoutRapide onOuvrir={() => setFormulaireOuvert(true)} />

          {/* Section Urgentes */}
          <Section
            icone={<AlertTriangle className="w-4 h-4 text-red-500" />}
            titre="Urgentes"
            compte={tachesUrgentes.length}
            couleurBadge="bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400"
            isLoading={loadUrgent}
          >
            {tachesUrgentes.length === 0 ? (
              <Vide texte="Aucune tâche urgente — bien joué !" />
            ) : (
              <AnimatePresence>
                {tachesUrgentes.map(t => (
                  <CarteTache key={t.id} tache={t} onModifier={ouvrirModification} />
                ))}
              </AnimatePresence>
            )}
          </Section>

          {/* Section Quotidiennes */}
          <Section
            icone={<RefreshCcw className="w-4 h-4 text-blue-500" />}
            titre="Tâches quotidiennes"
            compte={tachesQuotidiennes.length}
            couleurBadge="bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
            isLoading={loadQuot}
          >
            {tachesQuotidiennes.length === 0 ? (
              <Vide texte="Aucune tâche quotidienne configurée" />
            ) : (
              <AnimatePresence>
                {tachesQuotidiennes.map(t => (
                  <CarteTache key={t.id} tache={t} onModifier={ouvrirModification} />
                ))}
              </AnimatePresence>
            )}
          </Section>

          {/* Section À venir */}
          <Section
            icone={<CalendarClock className="w-4 h-4 text-purple-500" />}
            titre="À venir"
            compte={tachesAVenir.length}
            couleurBadge="bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400"
            isLoading={loadAll}
          >
            {tachesAVenir.length === 0 ? (
              <Vide texte="Tout est à jour !" />
            ) : (
              <AnimatePresence>
                {tachesAVenir.map(t => (
                  <CarteTache key={t.id} tache={t} onModifier={ouvrirModification} />
                ))}
              </AnimatePresence>
            )}
          </Section>
        </main>
      </div>

      <BottomNav />

      <FormulairesTache
        ouvert={formulaireOuvert}
        onFermer={fermerFormulaire}
        tacheAModifier={tacheAModifier}
      />
    </div>
  )
}

function Section({
  icone,
  titre,
  compte,
  couleurBadge,
  isLoading,
  children
}: {
  icone: React.ReactNode
  titre: string
  compte: number
  couleurBadge: string
  isLoading: boolean
  children: React.ReactNode
}) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        {icone}
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{titre}</h2>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${couleurBadge}`}>
          {compte}
        </span>
      </div>
      {isLoading ? (
        <SqueletteListe count={2} />
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </motion.section>
  )
}

function Vide({ texte }: { texte: string }) {
  return (
    <div className="flex items-center gap-2 py-3 px-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
      <CheckCircle2 className="w-4 h-4 text-gray-300 dark:text-gray-700" />
      <p className="text-sm text-gray-400 dark:text-gray-600">{texte}</p>
    </div>
  )
}
