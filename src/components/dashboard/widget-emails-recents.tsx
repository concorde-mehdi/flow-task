'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, ArrowRight, LogIn } from 'lucide-react'
import { useGmail } from '@/hooks/use-gmail'
import { Button } from '@/components/ui/button'

const COULEURS = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500']
function couleur(nom: string) {
  let h = 0
  for (let i = 0; i < nom.length; i++) h = nom.charCodeAt(i) + ((h << 5) - h)
  return COULEURS[Math.abs(h) % COULEURS.length]
}
function initiales(nom: string) {
  return nom.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase()
}
function formatHeure(dateStr: string) {
  try {
    const d = new Date(dateStr)
    const diff = (Date.now() - d.getTime()) / 3600000
    if (diff < 24) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  } catch { return '' }
}

export function WidgetEmailsRecents() {
  const { emails, isLoading, error } = useGmail()
  const router = useRouter()

  const nonLus = emails.filter(e => !e.lu).slice(0, 5)

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center">
            <Mail className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Emails non lus</p>
          {nonLus.length > 0 && (
            <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              {nonLus.length}
            </span>
          )}
        </div>
        <Link href="/emails" className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors">
          Voir tout <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {error === 'no_token' || error === 'token_expired' ? (
        <div className="flex flex-col items-center py-3 gap-2">
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">Gmail non connecté</p>
          <Button size="sm" variant="outline" onClick={() => router.push('/connexion')} className="gap-1.5 text-xs">
            <LogIn className="w-3.5 h-3.5" />Connecter
          </Button>
        </div>
      ) : isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-1/3" />
                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : nonLus.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-gray-600 py-2">Pas de nouveaux emails ✓</p>
      ) : (
        <div className="space-y-2">
          {nonLus.map(email => (
            <Link key={email.id} href="/emails" className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg px-1 py-0.5 transition-colors">
              <div className={`w-7 h-7 rounded-full ${couleur(email.expediteur)} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                {initiales(email.expediteur)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{email.expediteur}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{email.sujet}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0">{formatHeure(email.date)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
