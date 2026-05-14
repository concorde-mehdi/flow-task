'use client'

import { ThemeToggle } from './theme-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { CommandPalette } from '@/components/ui/command-palette'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, User, CheckSquare, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface HeaderProps {
  titre: string
}

export function Header({ titre }: HeaderProps) {
  const router = useRouter()
  const [utilisateur, setUtilisateur] = useState<SupabaseUser | null>(null)
  const [logoError, setLogoError] = useState(false)
  const [paletteOuverte, setPaletteOuverte] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUtilisateur(data.user))
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOuverte(true)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  async function seDeconnecter() {
    await supabase.auth.signOut()
    router.push('/connexion')
    router.refresh()
  }

  const initiales = utilisateur?.user_metadata?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?'

  return (
    <>
    <header className="h-16 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-6">
      {/* Mobile : logo clinique */}
      <div className="flex items-center md:hidden">
        {!logoError ? (
          <img
            src="/logo-clinique.png"
            alt="Logo"
            className="h-8 w-auto max-w-[130px] object-contain"
            onError={() => setLogoError(true)}
          />
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
              <CheckSquare className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">FlowTask</span>
          </div>
        )}
      </div>
      {/* Desktop : titre de la page */}
      <h1 className="hidden md:block text-lg font-semibold text-gray-900 dark:text-white">{titre}</h1>

      <div className="flex items-center gap-3">
        {/* Bouton recherche */}
        <button
          onClick={() => setPaletteOuverte(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 hover:text-gray-600 dark:hover:text-gray-300 transition-all"
        >
          <Search className="w-3.5 h-3.5" />
          Rechercher…
          <kbd className="ml-1 text-gray-300 dark:text-gray-600 font-mono">Ctrl K</kbd>
        </button>
        <button
          onClick={() => setPaletteOuverte(true)}
          className="sm:hidden flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full ring-2 ring-transparent hover:ring-blue-200 dark:hover:ring-blue-800 transition-all outline-none">
            <Avatar className="w-8 h-8">
              <AvatarImage src={utilisateur?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-blue-500 text-white text-xs font-semibold">
                {initiales}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {utilisateur?.user_metadata?.full_name ?? 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-500 truncate">{utilisateur?.email}</p>
            </div>
            <DropdownMenuItem onClick={() => router.push('/parametres')} className="gap-2 cursor-pointer">
              <User className="w-4 h-4" />
              Paramètres
            </DropdownMenuItem>
            <DropdownMenuItem onClick={seDeconnecter} className="gap-2 cursor-pointer text-red-600 dark:text-red-400">
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>

    <CommandPalette ouvert={paletteOuverte} onFermer={() => setPaletteOuverte(false)} />
  </>
  )
}
