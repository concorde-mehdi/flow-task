'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ListTodo, Calendar, Settings, CheckSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const navigation = [
  { nom: 'Tableau de bord', href: '/dashboard', icone: LayoutDashboard },
  { nom: 'Mes tâches', href: '/taches', icone: ListTodo },
  { nom: 'Calendrier', href: '/calendrier', icone: Calendar },
  { nom: 'Paramètres', href: '/parametres', icone: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 px-3 py-6">
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 mb-8">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
          <CheckSquare className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-gray-900 dark:text-white text-lg">FlowTask</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {navigation.map((item) => {
          const estActif = pathname.startsWith(item.href)
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
                <item.icone className={cn('w-4.5 h-4.5', estActif ? 'text-blue-500' : '')} size={18} />
                {item.nom}
                {estActif && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pt-4 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs text-gray-400 dark:text-gray-600 text-center">FlowTask v1.0</p>
      </div>
    </aside>
  )
}
