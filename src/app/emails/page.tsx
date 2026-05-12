'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRequireAuth } from '@/hooks/use-auth'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { CarteEmail } from '@/components/emails/carte-email'
import { VueEmail } from '@/components/emails/vue-email'
import { useGmail } from '@/hooks/use-gmail'
import type { EmailDetail } from '@/hooks/use-gmail'
import { RefreshCw, Mail, AlertCircle, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function PageEmails() {
  useRequireAuth()
  const router = useRouter()
  const { emails, isLoading, error, refetch, fetchDetail, envoyerReponse } = useGmail()
  const [emailOuvert, setEmailOuvert] = useState<EmailDetail | null>(null)
  const [chargementDetail, setChargementDetail] = useState(false)

  async function ouvrirEmail(id: string) {
    setChargementDetail(true)
    const detail = await fetchDetail(id)
    setChargementDetail(false)
    if (detail) setEmailOuvert(detail)
  }

  const nonLus = emails.filter(e => !e.lu).length

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header titre="Emails" />

        <main className="flex-1 pb-24 md:pb-6 max-w-3xl mx-auto w-full">

          {/* Barre d'outils */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Boîte de réception</h2>
              {nonLus > 0 && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                  {nonLus} non lu{nonLus > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>

          {/* Erreurs */}
          {error === 'no_token' || error === 'token_expired' ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <LogIn className="w-12 h-12 text-blue-300 dark:text-blue-700 mb-4" />
              <p className="font-semibold text-gray-900 dark:text-white mb-1">Connexion Gmail requise</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Tu dois te reconnecter avec Google pour autoriser l'accès à Gmail.
              </p>
              <Button onClick={() => router.push('/connexion')} className="gap-2">
                <LogIn className="w-4 h-4" />
                Se reconnecter
              </Button>
            </div>
          ) : error === 'no_scope' ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <AlertCircle className="w-12 h-12 text-orange-400 mb-4" />
              <p className="font-semibold text-gray-900 dark:text-white mb-1">Permission Gmail manquante</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Reconnecte-toi pour accorder l'accès à ta boîte Gmail.
              </p>
              <Button onClick={() => router.push('/connexion')}>Se reconnecter</Button>
            </div>
          ) : error === 'api_error' ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">Erreur de connexion à Gmail.</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>Réessayer</Button>
            </div>
          ) : isLoading || chargementDetail ? (
            <div className="space-y-0 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden mx-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-1/3" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : emails.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Mail className="w-12 h-12 text-gray-200 dark:text-gray-800 mb-4" />
              <p className="text-gray-400 dark:text-gray-600 text-sm">Aucun email</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden mx-6"
            >
              {emails.map(email => (
                <CarteEmail
                  key={email.id}
                  email={email}
                  onClick={() => ouvrirEmail(email.id)}
                />
              ))}
            </motion.div>
          )}
        </main>
      </div>

      <BottomNav />

      <VueEmail
        email={emailOuvert}
        onFermer={() => setEmailOuvert(null)}
        onRepondre={envoyerReponse}
      />
    </div>
  )
}
