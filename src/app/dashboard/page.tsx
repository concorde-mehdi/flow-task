'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRequireAuth } from '@/hooks/use-auth'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { StatsBar } from '@/components/dashboard/stats-bar'
import { AjoutRapide } from '@/components/dashboard/ajout-rapide'
import { WidgetCharges } from '@/components/dashboard/widget-charges'
import { WidgetLiensRaccourcis } from '@/components/dashboard/widget-liens-raccourcis'
import { WidgetMeteo } from '@/components/dashboard/widget-meteo'
import { WidgetEmailsRecents } from '@/components/dashboard/widget-emails-recents'
import { WidgetNotes } from '@/components/dashboard/widget-notes'
import { WidgetRaccourcis } from '@/components/dashboard/widget-raccourcis'
import { WidgetActivite } from '@/components/dashboard/widget-activite'
import { WidgetProjets } from '@/components/dashboard/widget-projets'
import { WidgetTachesJour } from '@/components/dashboard/widget-taches-jour'
import { WidgetAgendaJour } from '@/components/dashboard/widget-agenda-jour'
import { WidgetDocumentsRecents } from '@/components/dashboard/widget-documents-recents'
import { WidgetConnexionsDashboard } from '@/components/dashboard/widget-connexions-dashboard'
import { WidgetStockMateriel } from '@/components/dashboard/widget-stock-materiel'
import { WidgetCoffre } from '@/components/dashboard/widget-coffre'
import { WidgetChecklist } from '@/components/dashboard/widget-checklist'
import { WidgetReseau } from '@/components/dashboard/widget-reseau'
import { WidgetLicences } from '@/components/dashboard/widget-licences'
import { WidgetConsommables } from '@/components/dashboard/widget-consommables'
import { WidgetMonitoring } from '@/components/dashboard/widget-monitoring'
import { WidgetLignesMobiles } from '@/components/dashboard/widget-lignes-mobiles'
import { MobileDashboard } from '@/components/dashboard/mobile-dashboard'
import { CarteTache } from '@/components/taches/carte-tache'
import { FormulairesTache } from '@/components/taches/formulaire-tache'
import { SqueletteListe } from '@/components/taches/squelette-tache'
import { useTaches, useTachesUrgentes, useTachesQuotidiennes } from '@/hooks/use-taches'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, RefreshCcw, CalendarClock, CheckCircle2 } from 'lucide-react'
import type { Tache } from '@/types'
import { trierParPriorite } from '@/lib/utils'

export default function PageDashboard() {
  useRequireAuth()
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

      <div className="flex-1 flex flex-col min-w-0 relative isolate">

        {/* ── Mesh gradient background ── */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
          <div className="absolute -top-32 -right-16 h-[580px] w-[580px] rounded-full bg-indigo-300/25 dark:bg-indigo-500/10 blur-3xl" />
          <div className="absolute top-[38%] -left-24 h-[480px] w-[480px] rounded-full bg-sky-300/20 dark:bg-sky-500/8 blur-3xl" />
          <div className="absolute bottom-10 right-[28%] h-[420px] w-[420px] rounded-full bg-violet-300/18 dark:bg-violet-500/8 blur-3xl" />
        </div>

        <Header titre="Tableau de bord" estDashboard />

        {/* ══ MOBILE LAYOUT ══ */}
        <div className="md:hidden flex-1 p-4 pb-32 space-y-4 overflow-y-auto">
          <MobileDashboard onOuvrirPalette={() => {}} />
        </div>

        {/* ══ DESKTOP LAYOUT ══ */}
        <main className="hidden md:block flex-1 p-5 pb-6 space-y-5 max-w-[1400px] mx-auto w-full">

          {/* Stats bar */}
          <StatsBar />

          {/* Ligne 1 : Météo | Emails | Tâches du jour | Agenda */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <WidgetMeteo />
            <WidgetEmailsRecents />
            <WidgetTachesJour />
            <WidgetAgendaJour />
          </div>

          {/* Ligne 2 : Projets | Connexions PC | Raccourcis/Liens | Documents récents */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <WidgetProjets />
            <WidgetConnexionsDashboard />
            <WidgetLiensRaccourcis />
            <WidgetDocumentsRecents />
          </div>

          {/* Ligne 3 : Charges | Activité | Stock matériel | Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <WidgetCharges />
            <WidgetActivite />
            <WidgetStockMateriel />
            <WidgetNotes />
          </div>

          {/* Checklist | Réseau | Coffre | Raccourcis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <WidgetChecklist />
            <WidgetReseau />
            <WidgetCoffre />
            <WidgetRaccourcis />
          </div>

          {/* Licences | Consommables | Monitoring | Flotte mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <WidgetLicences />
            <WidgetConsommables />
            <WidgetMonitoring />
            <WidgetLignesMobiles />
          </div>

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
  icone, titre, compte, couleurBadge, isLoading, children
}: {
  icone: React.ReactNode
  titre: string
  compte: number
  couleurBadge: string
  isLoading: boolean
  children: React.ReactNode
}) {
  return (
    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
      <div className="flex items-center gap-2">
        {icone}
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{titre}</h2>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${couleurBadge}`}>{compte}</span>
      </div>
      {isLoading ? <SqueletteListe count={2} /> : <div className="space-y-2">{children}</div>}
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
