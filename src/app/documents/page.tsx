'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRequireAuth } from '@/hooks/use-auth'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { CarteDocument } from '@/components/documents/carte-document'
import { FormulaireDocument } from '@/components/documents/formulaire-document'
import { useDocuments } from '@/hooks/use-documents'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, FileText, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TYPES_DOCUMENTS } from '@/types'
import type { Document } from '@/types'

export default function PageDocuments() {
  useRequireAuth()
  const { data: documents = [], isLoading } = useDocuments()
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [documentAModifier, setDocumentAModifier] = useState<Document | null>(null)
  const [recherche, setRecherche] = useState('')
  const [filtreType, setFiltreType] = useState<string>('Tous')

  const documentsFiltres = documents.filter(d => {
    const matchType = filtreType === 'Tous' || d.type === filtreType
    const matchRecherche = recherche === '' || d.titre.toLowerCase().includes(recherche.toLowerCase())
    return matchType && matchRecherche
  })

  function ouvrirModification(document: Document) {
    setDocumentAModifier(document)
    setFormulaireOuvert(true)
  }

  function fermerFormulaire() {
    setFormulaireOuvert(false)
    setDocumentAModifier(null)
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header titre="Documents" />
        <main className="flex-1 p-6 pb-24 md:pb-6">
          <div className="max-w-3xl mx-auto space-y-5">

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un document…"
                  value={recherche}
                  onChange={e => setRecherche(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={() => setFormulaireOuvert(true)} size="sm" className="gap-1.5 shrink-0">
                <Plus className="w-4 h-4" />Nouveau
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {['Tous', ...TYPES_DOCUMENTS].map(t => (
                <button
                  key={t}
                  onClick={() => setFiltreType(t)}
                  className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${
                    filtreType === t
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-14 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : documentsFiltres.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="w-12 h-12 text-gray-200 dark:text-gray-800 mb-4" />
                <p className="text-gray-400 dark:text-gray-600 text-sm">
                  {recherche || filtreType !== 'Tous' ? 'Aucun document trouvé' : 'Aucun document enregistré'}
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <motion.div className="space-y-2">
                  {documentsFiltres.map(doc => (
                    <CarteDocument key={doc.id} document={doc} onModifier={ouvrirModification} />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>
      <BottomNav />
      <FormulaireDocument ouvert={formulaireOuvert} onFermer={fermerFormulaire} documentAModifier={documentAModifier} />
    </div>
  )
}
