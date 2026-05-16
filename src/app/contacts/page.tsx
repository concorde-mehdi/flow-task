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
import { Plus, Users, Search, LayoutList, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Contact } from '@/types'
import { cn } from '@/lib/utils'

const SERVICE_EMOJI: Record<string, string> = {
  'Médecins': '👨‍⚕️', 'Infirmiers': '👩‍⚕️', 'Secrétaires': '📋', 'Direction': '🏛️',
  'IT': '💻', 'Fournisseurs IT': '🖥️', 'Maintenance': '🔧', 'RH': '👥',
  'Comptabilité': '📊', 'Pharmacie': '💊', 'Laboratoire': '🔬', 'Urgences': '🚨',
}

export default function PageContacts() {
  useRequireAuth()
  const { data: contacts = [], isLoading } = useContacts()
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [contactAModifier, setContactAModifier] = useState<Contact | null>(null)
  const [recherche, setRecherche] = useState('')
  const [vue, setVue] = useState<'liste' | 'service'>('service')

  const contactsFiltres = contacts.filter(c =>
    recherche === '' ||
    c.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    c.poste?.toLowerCase().includes(recherche.toLowerCase()) ||
    c.service?.toLowerCase().includes(recherche.toLowerCase()) ||
    c.telephone?.includes(recherche) ||
    c.email?.toLowerCase().includes(recherche.toLowerCase())
  )

  // Grouper par service
  const parService = contactsFiltres.reduce<Record<string, Contact[]>>((acc, c) => {
    const svc = c.service || 'Sans service'
    if (!acc[svc]) acc[svc] = []
    acc[svc].push(c)
    return acc
  }, {})

  const services = Object.keys(parService).sort((a, b) => {
    if (a === 'Sans service') return 1
    if (b === 'Sans service') return -1
    return a.localeCompare(b)
  })

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
                <Input placeholder="Rechercher un contact…" value={recherche} onChange={e => setRecherche(e.target.value)} className="pl-9" />
              </div>
              <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0">
                <button onClick={() => setVue('service')}
                  className={cn('px-2.5 py-1.5 text-xs font-medium transition-all', vue === 'service' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-500')}>
                  <Layers className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setVue('liste')}
                  className={cn('px-2.5 py-1.5 text-xs font-medium transition-all', vue === 'liste' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-500')}>
                  <LayoutList className="w-3.5 h-3.5" />
                </button>
              </div>
              <Button onClick={() => setFormulaireOuvert(true)} size="sm" className="gap-1.5 shrink-0">
                <Plus className="w-4 h-4" /> Nouveau
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl animate-pulse" />)}
              </div>
            ) : contactsFiltres.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="w-12 h-12 text-gray-200 dark:text-gray-800 mb-4" />
                <p className="text-gray-400 dark:text-gray-600 text-sm">
                  {recherche ? 'Aucun contact trouvé' : 'Aucun contact enregistré'}
                </p>
              </div>
            ) : vue === 'liste' ? (
              <AnimatePresence mode="popLayout">
                <motion.div className="space-y-2">
                  {contactsFiltres.map(contact => (
                    <CarteContact key={contact.id} contact={contact} onModifier={ouvrirModification} />
                  ))}
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="space-y-6">
                {services.map(svc => (
                  <section key={svc} className="space-y-2">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                      <span>{SERVICE_EMOJI[svc] ?? '👤'}</span>
                      {svc}
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 normal-case tracking-normal">
                        {parService[svc].length}
                      </span>
                    </h3>
                    <AnimatePresence mode="popLayout">
                      <div className="space-y-2">
                        {parService[svc].map(contact => (
                          <CarteContact key={contact.id} contact={contact} onModifier={ouvrirModification} />
                        ))}
                      </div>
                    </AnimatePresence>
                  </section>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <BottomNav />
      <FormulaireContact ouvert={formulaireOuvert} onFermer={fermerFormulaire} contactAModifier={contactAModifier} />
    </div>
  )
}
