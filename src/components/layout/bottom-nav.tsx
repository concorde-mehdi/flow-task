'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ListTodo, Calendar, Settings, Plus, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FormulairesTache } from '@/components/taches/formulaire-tache'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCreerTache } from '@/hooks/use-taches'

const navigation = [
  { nom: 'Accueil', href: '/dashboard', icone: LayoutDashboard },
  { nom: 'Tâches', href: '/taches', icone: ListTodo },
  { nom: 'Charges', href: '/charges', icone: Wallet },
  { nom: 'Calendrier', href: '/calendrier', icone: Calendar },
  { nom: 'Paramètres', href: '/parametres', icone: Settings },
]

export function BottomNav() {
  const pathname = usePathname()
  const [rapideOuvert, setRapideOuvert] = useState(false)
  const [completOuvert, setCompletOuvert] = useState(false)
  const [titre, setTitre] = useState('')
  const { mutate: creer, isPending } = useCreerTache()

  function ajouterVite(e: React.FormEvent) {
    e.preventDefault()
    if (!titre.trim()) return
    creer(
      { titre: titre.trim(), description: null, deadline: null, priorite: 'Moyenne', tags: [], statut: false, is_quotidienne: false },
      { onSuccess: () => { setTitre(''); setRapideOuvert(false) } }
    )
  }

  function ouvrirComplet() {
    setRapideOuvert(false)
    setTitre('')
    setCompletOuvert(true)
  }

  return (
    <>
      {/* Bouton FAB */}
      <button
        onClick={() => setRapideOuvert(true)}
        className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-blue-500 hover:bg-blue-600 active:scale-95 text-white rounded-full shadow-lg shadow-blue-500/40 flex items-center justify-center z-50 transition-all duration-150"
        aria-label="Ajouter une tâche"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* Barre de navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-2 pb-safe z-50">
        <div className="flex items-center justify-around">
          {navigation.map((item) => {
            const estActif = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-3 text-xs font-medium transition-colors',
                  estActif
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                <item.icone size={20} />
                <span>{item.nom}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Modal ajout rapide */}
      <Dialog open={rapideOuvert} onOpenChange={(o) => { if (!o) { setRapideOuvert(false); setTitre('') } }}>
        <DialogContent className="sm:max-w-sm">
          <p className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Nouvelle tâche</p>
          <form onSubmit={ajouterVite} className="space-y-3">
            <Input
              placeholder="Titre de la tâche..."
              value={titre}
              onChange={e => setTitre(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={!titre.trim() || isPending}>
                {isPending ? 'Ajout…' : 'Ajouter'}
              </Button>
              <Button type="button" variant="outline" onClick={ouvrirComplet} className="text-xs">
                + Détails
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal formulaire complet */}
      <FormulairesTache
        ouvert={completOuvert}
        onFermer={() => setCompletOuvert(false)}
        tacheAModifier={null}
      />
    </>
  )
}
