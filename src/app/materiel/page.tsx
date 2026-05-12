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
import { Plus, Package, Truck, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Materiel, StatutMateriel } from '@/types'

type Filtre = 'tout' | StatutMateriel

export default function PageMateriel() {
  useRequireAuth()
  const { data: materiel = [], isLoading } = useMateriel()
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [materielAModifier, setMaterielAModifier] = useState<Materiel | null>(null)
  const [filtre, setFiltre] = useState<Filtre>('tout')

  const commandes = materiel.filter(m => m.statut === 'commande').length
  const enLivraison = materiel.filter(m => m.statut === 'en_livraison').length
  const livres = materiel.filter(m => m.statut === 'livre').length
  const enPanne = materiel.filter(m => m.statut === 'en_panne').length

  const materielFiltre = materiel.filter(m => filtre === 'tout' || m.statut === filtre)

  const filtres: { label: string; valeur: Filtre }[] = [
    { label: 'Tout', valeur: 'tout' },
    { label: 'Commandés', valeur: 'commande' },
    { label: 'En livraison', valeur: 'en_livraison' },
    { label: 'Livrés', valeur: 'livre' },
    { label: 'En panne', valeur: 'en_panne' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header titre="Matériel" />
        <main className="flex-1 p-6 pb-24 md:pb-6">
          <div className="max-w-3xl mx-auto space-y-6">

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Commandés', val: commandes, icone: <Package className="w-4 h-4 text-blue-500" />, bg: 'bg-blue-50 dark:bg-blue-950/50' },
                { label: 'En livraison', val: enLivraison, icone: <Truck className="w-4 h-4 text-amber-500" />, bg: 'bg-amber-50 dark:bg-amber-950/50' },
                { label: 'Livrés', val: livres, icone: <CheckCircle2 className="w-4 h-4 text-green-500" />, bg: 'bg-green-50 dark:bg-green-950/50' },
                { label: 'En panne', val: enPanne, icone: <AlertTriangle className="w-4 h-4 text-red-500" />, bg: 'bg-red-50 dark:bg-red-950/50' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} border border-gray-100 dark:border-gray-800 rounded-2xl p-4`}>
                  <div className="flex items-center gap-2 mb-1">{s.icone}<p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p></div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.val}</p>
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
                <Plus className="w-4 h-4" />Ajouter
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl animate-pulse" />)}</div>
            ) : materielFiltre.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Package className="w-12 h-12 text-gray-200 dark:text-gray-800 mb-4" />
                <p className="text-gray-400 dark:text-gray-600 text-sm">Aucun équipement</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <motion.div className="space-y-3">
                  {materielFiltre.map(m => (
                    <CarteMateriel key={m.id} item={m} onModifier={item => { setMaterielAModifier(item); setFormulaireOuvert(true) }} />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>
      <BottomNav />
      <FormulaireMateriel ouvert={formulaireOuvert} onFermer={() => { setFormulaireOuvert(false); setMaterielAModifier(null) }} materielAModifier={materielAModifier} />
    </div>
  )
}
