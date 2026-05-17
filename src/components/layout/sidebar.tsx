'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ListTodo, Calendar, Settings, CheckSquare, Wallet, Mail,
  Link2, Users, FileText, Package, CalendarDays, FolderOpen, Monitor, FolderKanban,
  Crown, Sparkles, ShieldCheck, Boxes, Activity, Smartphone,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { ThemeToggle } from './theme-toggle'
import { useTaches } from '@/hooks/use-taches'
import { useGmail } from '@/hooks/use-gmail'

const navigation = [
  { nom: 'Tableau de bord', href: '/dashboard',    icone: LayoutDashboard },
  { nom: 'Mes tâches',      href: '/taches',       icone: ListTodo,     badge: 'taches' },
  { nom: 'Mes charges',     href: '/charges',      icone: Wallet },
  { nom: 'Emails',          href: '/emails',       icone: Mail,         badge: 'emails' },
  { nom: 'Réunions',        href: '/reunions',     icone: CalendarDays },
  { nom: 'Projets',         href: '/projets',      icone: FolderKanban },
  { nom: 'Documents',       href: '/documents',    icone: FolderOpen },
  { nom: 'Raccourcis / Liens', href: '/liens',     icone: Link2 },
  { nom: 'Connexions (PC)', href: '/connexions',   icone: Monitor },
  { nom: 'Calendrier',      href: '/calendrier',   icone: Calendar },
  { nom: 'Devis',           href: '/devis',        icone: FileText },
  { nom: 'Matériel',        href: '/materiel',     icone: Package },
  { nom: 'Annuaire',        href: '/contacts',     icone: Users },
  { nom: 'Flotte mobile',    href: '/lignes-mobiles', icone: Smartphone },
  { nom: 'Licences',        href: '/licences',       icone: ShieldCheck },
  { nom: 'Consommables',    href: '/consommables',   icone: Boxes },
  { nom: 'Monitoring',      href: '/monitoring',     icone: Activity },
  { nom: 'Paramètres',      href: '/parametres',   icone: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [logoError, setLogoError] = useState(false)
  const { data: taches = [] } = useTaches({ statut: 'a_faire' })
  const { emails = [] } = useGmail()

  const badgesMap: Record<string, number> = {
    taches: taches.length,
    emails: emails.filter(e => !e.lu).length,
  }

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 px-3 py-5">
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 mb-6">
        {!logoError ? (
          <img
            src="/logo-clinique.png"
            alt="Logo Clinique"
            className="h-9 w-auto max-w-[140px] object-contain"
            onError={() => setLogoError(true)}
          />
        ) : (
          <>
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm shrink-0">
              <CheckSquare className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">FlowTask</span>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
        {navigation.map((item) => {
          const estActif = pathname.startsWith(item.href)
          const badgeVal = item.badge ? badgesMap[item.badge] : 0
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  estActif
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                )}
              >
                <item.icone className={cn('shrink-0', estActif ? 'text-blue-500' : '')} size={18} />
                <span className="flex-1 truncate">{item.nom}</span>
                {badgeVal > 0 && (
                  <span className={cn(
                    'text-xs font-semibold px-1.5 py-0.5 rounded-full shrink-0',
                    estActif
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  )}>
                    {badgeVal}
                  </span>
                )}
                {estActif && badgeVal === 0 && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Section Premium */}
      <div className="mt-3 mx-1 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-100 dark:border-amber-900/30 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Crown className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Passez en Premium</span>
        </div>
        <p className="text-xs text-amber-600/80 dark:text-amber-500/80 mb-3 leading-relaxed">
          Débloquez toutes les fonctionnalités avancées.
        </p>
        <button className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold transition-all shadow-sm shadow-amber-500/30 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Découvrir
        </button>
      </div>

      {/* Mode + version */}
      <div className="mt-3 px-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">Mode {typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? 'sombre' : 'clair'}</span>
        <ThemeToggle />
      </div>
    </aside>
  )
}
