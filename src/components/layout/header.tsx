'use client'

import { ThemeToggle } from './theme-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { CommandPalette } from '@/components/ui/command-palette'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, User, CheckSquare, Search, Bell, MessageSquare, ClipboardList } from 'lucide-react'
import { VoiceButton } from '@/components/ui/voice-button'
import { useEffect, useState } from 'react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { useTachesUrgentes } from '@/hooks/use-taches'
import { useGmail } from '@/hooks/use-gmail'
import { useChecklistItems, useChecklistCoches } from '@/hooks/use-checklist'

interface HeaderProps {
  titre: string
  estDashboard?: boolean
}

function salutation(prenom: string): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return `Bonjour, ${prenom} 👋`
  if (h >= 12 && h < 18) return `Bon après-midi, ${prenom} ☀️`
  if (h >= 18 && h < 22) return `Bonsoir, ${prenom} 🌆`
  return `Bonne nuit, ${prenom} 🌙`
}

export function Header({ titre, estDashboard }: HeaderProps) {
  const router = useRouter()
  const [utilisateur, setUtilisateur] = useState<SupabaseUser | null>(null)
  const [titrePoste, setTitrePoste] = useState<string | null>(null)
  const [logoError, setLogoError] = useState(false)
  const [paletteOuverte, setPaletteOuverte] = useState(false)
  const supabase = createClient()

  const { data: urgentes = [] } = useTachesUrgentes()
  const { emails = [] } = useGmail()
  const emailsNonLus = emails.filter(e => !e.lu).length
  const { data: checkItems = [] } = useChecklistItems()
  const { data: checkCoches = [] } = useChecklistCoches()
  const checkTotal = checkItems.length
  const checkFait  = checkCoches.length
  const checkRestant = checkTotal - checkFait

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUtilisateur(data.user)
      if (data.user && estDashboard) {
        const { data: profil } = await supabase
          .from('profils').select('titre_poste').eq('user_id', data.user.id).single()
        if (profil) setTitrePoste(profil.titre_poste)
      }
    })
  }, [estDashboard])

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

  const nomComplet = utilisateur?.user_metadata?.full_name ?? ''
  const prenom = nomComplet.split(' ')[0] || 'Mahdi'

  const initiales = nomComplet
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  return (
    <>
      <header className={`border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-6 ${estDashboard ? 'py-4' : 'h-16'}`}>

        {/* Mobile : logo (centré) */}
        <div className="flex items-center md:hidden">
          {!logoError ? (
            <img
              src="/logo-clinique.png"
              alt="Logo"
              className="h-8 w-auto max-w-[140px] object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
                <CheckSquare className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white text-sm">Clinique Concorde</span>
            </div>
          )}
        </div>

        {/* Desktop : greeting dashboard ou titre simple */}
        {estDashboard ? (
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {salutation(prenom)}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Voici un aperçu complet de ton activité aujourd&apos;hui.
            </p>
          </div>
        ) : (
          <h1 className="hidden md:block text-lg font-semibold text-gray-900 dark:text-white">{titre}</h1>
        )}

        {/* Actions droite */}
        <div className="flex items-center gap-1.5">

          {/* Recherche */}
          <button
            onClick={() => setPaletteOuverte(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 hover:text-gray-600 dark:hover:text-gray-300 transition-all mr-1"
          >
            <Search className="w-3.5 h-3.5" />
            Rechercher…
            <kbd className="ml-1 text-gray-300 dark:text-gray-600 font-mono">Ctrl K</kbd>
          </button>
          <button
            onClick={() => setPaletteOuverte(true)}
            className="sm:hidden flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Agent vocal */}
          <VoiceButton variant="icon" />

          {/* Checklist du jour */}
          {checkTotal > 0 && (
            <button
              onClick={() => router.push('/dashboard')}
              className="relative flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={`Checklist : ${checkFait}/${checkTotal}`}
            >
              <ClipboardList size={18} />
              {checkRestant > 0 ? (
                <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                  {checkRestant > 9 ? '9+' : checkRestant}
                </span>
              ) : checkTotal > 0 && (
                <span className="absolute top-1 right-1 w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-[8px]">✓</span>
                </span>
              )}
            </button>
          )}

          {/* Notif tâches urgentes */}
          <button
            onClick={() => router.push('/taches')}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Tâches urgentes"
          >
            <Bell size={18} />
            {urgentes.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                {urgentes.length > 9 ? '9+' : urgentes.length}
              </span>
            )}
          </button>

          {/* Notif emails */}
          <button
            onClick={() => router.push('/emails')}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Emails non lus"
          >
            <MessageSquare size={18} />
            {emailsNonLus > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                {emailsNonLus > 9 ? '9+' : emailsNonLus}
              </span>
            )}
          </button>

          <ThemeToggle />

          {/* Nom + poste (dashboard desktop) */}
          {estDashboard && (
            <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-gray-100 dark:border-gray-800 ml-1">
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-900 dark:text-white leading-none">{nomComplet || prenom}</p>
                {titrePoste && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{titrePoste}</p>}
              </div>
            </div>
          )}

          {/* Avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full ring-2 ring-transparent hover:ring-blue-200 dark:hover:ring-blue-800 transition-all outline-none ml-1">
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
                  {nomComplet || 'Utilisateur'}
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
