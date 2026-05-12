'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRequireAuth } from '@/hooks/use-auth'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { CarteDevis } from '@/components/devis/carte-devis'
import { FormulaireDevis } from '@/components/devis/formulaire-devis'
import { useDevis } from '@/hooks/use-devis'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, FileText, Clock, CheckCircle2, Send, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Devis, StatutDevis } from '@/types'

type Filtre = 'tout' | StatutDevis

export default function PageDevis() {
  useRequireAuth()
  const { data: devis = [], isLoading } = useDevis()
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [devisAModifier, setDevisAModifier] = useState<Devis | null>(null)
  const [filtre, setFiltre] = useState<Filtre>('tout')

  const envoyes = devis.filter(d => d.statut === 'envoye').length
  const enAttente = devis.filter(d => d.statut === 'en_attente_signature').length
  const payes = devis.filter(d => d.statut === 'paye').length
  const totalPaye = devis.filter(d => d.statut === 'paye').reduce((s, d) => s + (d.montant ?? 0), 0)

  const devisFiltres = devis.filter(d => filtre === 'tout' || d.statut === filtre)

  const filtres: { label: string; valeur: Filtre; icone?: React.ReactNode }[] = [
    { label: 'Tout', valeur: 'tout' },
    { label: 'Envoyés', valeur: 'envoye' },
    { label: 'En attente', valeur: 'en_attente_signature' },
    { label: 'Payés', valeur: 'paye' },
    { label: 'Refusés', valeur: 'refuse' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header titre="Devis" />
        <main className="flex-1 p-6 pb-24 md:pb-6">
          <div className="max-w-3xl mx-auto space-y-6">

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Envoyés', val: envoyes, couleur: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/50', icone: <Send className="w-4 h-4 text-blue-500" /> },
                { label: 'En attente', val: enAttente, couleur: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/50', icone: <Clock className="w-4 h-4 text-amber-500" /> },
                { label: 'Signés/Payés', val: payes, couleur: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/50', icone: <CheckCircle2 className="w-4 h-4 text-green-500" /> },
                { label: 'Montant payé', val: totalPaye.toLocaleString('fr-TN', { minimumFractionDigits: 3 }) + ' DT', couleur: 'text-gray-900 dark:text-white', bg: 'bg-white dark:bg-gray-900', icone: <FileText className="w-4 h-4 text-gray-400" /> },
              ].map(s => (
                <div key={s.label} className={`${s.bg} border border-gray-100 dark:border-gray-800 rounded-2xl p-4`}>
                  <div className="flex items-center gap-2 mb-1">{s.icone}<p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p></div>
                  <p className={`text-xl font-bold ${s.couleur}`}>{s.val}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {filtres.map(f => (
                  <button key={f.valeur} onClick={() => setFiltre(f.valeur)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${filtre === f.valeur ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
              <Button onClick={() => setFormulaireOuvert(true)} size="sm" className="gap-1.5 shrink-0">
                <Plus className="w-4 h-4" />Nouveau devis
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl animate-pulse" />)}</div>
            ) : devisFiltres.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="w-12 h-12 text-gray-200 dark:text-gray-800 mb-4" />
                <p className="text-gray-400 dark:text-gray-600 text-sm">Aucun devis</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <motion.div className="space-y-3">
                  {devisFiltres.map(d => (
                    <CarteDevis key={d.id} devis={d} onModifier={dv => { setDevisAModifier(dv); setFormulaireOuvert(true) }} />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>
      <BottomNav />
      <FormulaireDevis ouvert={formulaireOuvert} onFermer={() => { setFormulaireOuvert(false); setDevisAModifier(null) }} devisAModifier={devisAModifier} />
    </div>
  )
}
