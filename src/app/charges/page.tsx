'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRequireAuth } from '@/hooks/use-auth'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { CarteCharge } from '@/components/charges/carte-charge'
import { FormulaireCharge } from '@/components/charges/formulaire-charge'
import { useCharges } from '@/hooks/use-charges'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Wallet, TrendingDown, Clock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isThisMonth, parseISO } from 'date-fns'
import type { Charge } from '@/types'

type Filtre = 'tout' | 'depense' | 'facture' | 'en_attente' | 'paye'

export default function PageCharges() {
  useRequireAuth()
  const { data: charges = [], isLoading } = useCharges()
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [chargeAModifier, setChargeAModifier] = useState<Charge | null>(null)
  const [filtre, setFiltre] = useState<Filtre>('tout')

  const chargesDuMois = charges.filter(c => isThisMonth(parseISO(c.date_charge)))
  const totalMois = chargesDuMois.reduce((s, c) => s + c.montant, 0)
  const totalDepenses = charges.filter(c => c.type === 'depense').reduce((s, c) => s + c.montant, 0)
  const montantEnAttente = charges.filter(c => c.statut === 'en_attente').reduce((s, c) => s + c.montant, 0)
  const nombrePayees = charges.filter(c => c.statut === 'paye').length

  const chargesFiltrees = charges.filter(c => {
    if (filtre === 'tout') return true
    if (filtre === 'depense') return c.type === 'depense'
    if (filtre === 'facture') return c.type === 'facture'
    if (filtre === 'en_attente') return c.statut === 'en_attente'
    if (filtre === 'paye') return c.statut === 'paye'
    return true
  })

  function ouvrirModification(charge: Charge) {
    setChargeAModifier(charge)
    setFormulaireOuvert(true)
  }

  function fermerFormulaire() {
    setFormulaireOuvert(false)
    setChargeAModifier(null)
  }

  const filtres: { label: string; valeur: Filtre }[] = [
    { label: 'Tout', valeur: 'tout' },
    { label: 'Dépenses', valeur: 'depense' },
    { label: 'Factures', valeur: 'facture' },
    { label: 'En attente', valeur: 'en_attente' },
    { label: 'Payées', valeur: 'paye' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header titre="Mes charges" />

        <main className="flex-1 p-6 pb-24 md:pb-6 space-y-6 max-w-5xl mx-auto w-full">

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icone={<Wallet className="w-3.5 h-3.5 text-blue-500" />}
              fond="bg-blue-50 dark:bg-blue-950/30"
              label="Ce mois-ci"
              valeur={totalMois.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            />
            <StatCard
              icone={<TrendingDown className="w-3.5 h-3.5 text-purple-500" />}
              fond="bg-purple-50 dark:bg-purple-950/30"
              label="Total dépenses"
              valeur={totalDepenses.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            />
            <StatCard
              icone={<Clock className="w-3.5 h-3.5 text-orange-500" />}
              fond="bg-orange-50 dark:bg-orange-950/30"
              label="En attente"
              valeur={montantEnAttente.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            />
            <StatCard
              icone={<CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
              fond="bg-green-50 dark:bg-green-950/30"
              label="Réglées"
              valeur={`${nombrePayees} charge${nombrePayees > 1 ? 's' : ''}`}
            />
          </div>

          {/* Barre d'actions */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              {filtres.map(f => (
                <button
                  key={f.valeur}
                  onClick={() => setFiltre(f.valeur)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
                    filtre === f.valeur
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <Button onClick={() => setFormulaireOuvert(true)} size="sm" className="shrink-0 gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouvelle charge</span>
              <span className="sm:hidden">Ajouter</span>
            </Button>
          </div>

          {/* Liste */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : chargesFiltrees.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <Wallet className="w-12 h-12 text-gray-200 dark:text-gray-800 mb-4" />
              <p className="text-gray-400 dark:text-gray-600 text-sm">Aucune charge pour ce filtre</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setFormulaireOuvert(true)}>
                Ajouter une charge
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {chargesFiltrees.map(c => (
                  <CarteCharge key={c.id} charge={c} onModifier={ouvrirModification} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      <BottomNav />

      <FormulaireCharge
        ouvert={formulaireOuvert}
        onFermer={fermerFormulaire}
        chargeAModifier={chargeAModifier}
      />
    </div>
  )
}

function StatCard({ icone, fond, label, valeur }: {
  icone: React.ReactNode
  fond: string
  label: string
  valeur: string
}) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
        <div className={`w-7 h-7 rounded-lg ${fond} flex items-center justify-center`}>
          {icone}
        </div>
      </div>
      <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{valeur}</p>
    </div>
  )
}
