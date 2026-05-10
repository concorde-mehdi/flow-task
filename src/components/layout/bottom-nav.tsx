'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ListTodo, Calendar, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { nom: 'Accueil', href: '/dashboard', icone: LayoutDashboard },
  { nom: 'Tâches', href: '/taches', icone: ListTodo },
  { nom: 'Calendrier', href: '/calendrier', icone: Calendar },
  { nom: 'Paramètres', href: '/parametres', icone: Settings },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-2 pb-safe z-50">
      <div className="flex items-center justify-around">
        {navigation.map((item) => {
          const estActif = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-3 text-xs font-medium transition-colors',
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
  )
}
