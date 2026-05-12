'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRequireAuth } from '@/hooks/use-auth'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { CarteContact } from '@/components/contacts/carte-contact'
import { FormulaireContact } from '@/components/contacts/formulaire-contact'
import { useContacts } from '@/hooks/use-contacts'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Users, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Contact } from '@/types'

export default function PageContacts() {
  useRequireAuth()
  const { data: contacts = [], isLoading } = useContacts()
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [contactAModifier, setContactAModifier] = useState<Contact | null>(null)
  const [recherche, setRecherche] = useState('')

  const contactsFiltres = contacts.filter(c =>
    recherche === '' ||
    c.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    c.poste?.toLowerCase().includes(recherche.toLowerCase()) ||
    c.telephone?.includes(recherche) ||
    c.email?.toLowerCase().includes(recherche.toLowerCase())
  )

  function ouvrirModification(contact: Contact) {
    setContactAModifier(contact)
    setFormulaireOuvert(true)
  }

  function fermerFormulaire() {
    setFormulaireOuvert(false)
    setContactAModifier(null)
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header titre="Annuaire" />
        <main className="flex-1 p-6 pb-24 md:pb-6">
          <div className="max-w-3xl mx-auto space-y-5">

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un contact…"
                  value={recherche}
                  onChange={e => setRecherche(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={() => setFormulaireOuvert(true)} size="sm" className="gap-1.5 shrink-0">
                <Plus className="w-4 h-4" />
                Nouveau
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : contactsFiltres.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="w-12 h-12 text-gray-200 dark:text-gray-800 mb-4" />
                <p className="text-gray-400 dark:text-gray-600 text-sm">
                  {recherche ? 'Aucun contact trouvé' : 'Aucun contact enregistré'}
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <motion.div className="space-y-2">
                  {contactsFiltres.map(contact => (
                    <CarteContact key={contact.id} contact={contact} onModifier={ouvrirModification} />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>
      <BottomNav />
      <FormulaireContact ouvert={formulaireOuvert} onFermer={fermerFormulaire} contactAModifier={contactAModifier} />
    </div>
  )
}
