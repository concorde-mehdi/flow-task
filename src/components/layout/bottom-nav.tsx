'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ListTodo, Calendar, User, Menu, X,
  Wallet, Mail, Link2, Users, FileText, Package,
  CalendarDays, FolderOpen, Monitor, FolderKanban, Settings,
  Plus, ShieldCheck, Boxes, Activity, Smartphone,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FormulairesTache } from '@/components/taches/formulaire-tache'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCreerTache } from '@/hooks/use-taches'
import { motion, AnimatePresence } from 'framer-motion'

const tabsPrincipaux = [
  { nom: 'Home',   href: '/dashboard', icone: LayoutDashboard },
  { nom: 'Tâches', href: '/taches',    icone: ListTodo },
  { nom: 'Agenda', href: '/calendrier',icone: Calendar },
  { nom: 'Profil', href: '/parametres',icone: User },
]

const itemsMenu = [
  { nom: 'Mes charges',    href: '/charges',    icone: Wallet },
  { nom: 'Emails',         href: '/emails',     icone: Mail },
  { nom: 'Réunions',       href: '/reunions',   icone: CalendarDays },
  { nom: 'Projets',        href: '/projets',    icone: FolderKanban },
  { nom: 'Liens',          href: '/liens',      icone: Link2 },
  { nom: 'Documents',      href: '/documents',  icone: FolderOpen },
  { nom: 'Connexions PC',  href: '/connexions', icone: Monitor },
  { nom: 'Devis',          href: '/devis',      icone: FileText },
  { nom: 'Matériel',       href: '/materiel',   icone: Package },
  { nom: 'Annuaire',       href: '/contacts',       icone: Users },
  { nom: 'Flotte mobile',  href: '/lignes-mobiles', icone: Smartphone },
  { nom: 'Licences',       href: '/licences',       icone: ShieldCheck },
  { nom: 'Consommables',   href: '/consommables', icone: Boxes },
  { nom: 'Monitoring',     href: '/monitoring',   icone: Activity },
  { nom: 'Paramètres',     href: '/parametres',   icone: Settings },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOuvert, setMenuOuvert] = useState(false)
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

  function allerVers(href: string) {
    setMenuOuvert(false)
    router.push(href)
  }

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setRapideOuvert(true)}
        className="md:hidden fixed bottom-[72px] right-4 w-14 h-14 bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white rounded-full shadow-xl shadow-indigo-500/40 flex items-center justify-center z-50 transition-all duration-150"
        aria-label="Ajouter une tâche"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* Bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pb-safe z-40">
        <div className="flex items-stretch h-16">
          {tabsPrincipaux.map((item) => {
            const estActif = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
              >
                <div className={cn(
                  'w-10 h-7 rounded-full flex items-center justify-center transition-all',
                  estActif ? 'bg-indigo-100 dark:bg-indigo-950/50' : ''
                )}>
                  <item.icone
                    size={20}
                    className={cn(
                      'transition-colors',
                      estActif ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-600'
                    )}
                  />
                </div>
                <span className={cn(
                  'text-[10px] font-medium',
                  estActif ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-600'
                )}>
                  {item.nom}
                </span>
              </Link>
            )
          })}

          {/* Menu tab */}
          <button
            onClick={() => setMenuOuvert(true)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
          >
            <div className="w-10 h-7 rounded-full flex items-center justify-center">
              <Menu size={20} className="text-gray-400 dark:text-gray-600" />
            </div>
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-600">Menu</span>
          </button>
        </div>
      </nav>

      {/* Menu sheet (slide up) */}
      <AnimatePresence>
        {menuOuvert && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/40 z-50"
              onClick={() => setMenuOuvert(false)}
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl z-50 pb-safe max-h-[80vh] overflow-y-auto"
            >
              {/* Handle */}
              <div className="flex items-center justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </div>

              <div className="flex items-center justify-between px-5 pb-4 pt-1">
                <p className="text-base font-bold text-gray-900 dark:text-white">Navigation</p>
                <button
                  onClick={() => setMenuOuvert(false)}
                  className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 px-5 pb-8">
                {itemsMenu.map(item => {
                  const estActif = pathname.startsWith(item.href)
                  return (
                    <button
                      key={item.href}
                      onClick={() => allerVers(item.href)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-2xl transition-all',
                        estActif
                          ? 'bg-indigo-50 dark:bg-indigo-950/30'
                          : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        estActif ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-white dark:bg-gray-800'
                      )}>
                        <item.icone
                          size={20}
                          className={estActif ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}
                        />
                      </div>
                      <span className={cn(
                        'text-xs font-medium text-center leading-tight',
                        estActif ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'
                      )}>
                        {item.nom}
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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

      <FormulairesTache
        ouvert={completOuvert}
        onFermer={() => setCompletOuvert(false)}
        tacheAModifier={null}
      />
    </>
  )
}
