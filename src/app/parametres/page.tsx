'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { createClient } from '@/lib/supabase/client'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Bell, BellOff, Moon, LogOut, User, Palette } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function PageParametres() {
  const [utilisateur, setUtilisateur] = useState<SupabaseUser | null>(null)
  const [notificationsActives, setNotificationsActives] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { theme } = useTheme()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUtilisateur(data.user))
    setNotificationsActives(Notification.permission === 'granted')
  }, [])

  async function demanderNotifications() {
    if (!('Notification' in window)) {
      toast.error("Votre navigateur ne supporte pas les notifications")
      return
    }
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      setNotificationsActives(true)
      toast.success("Notifications activées !")
    } else {
      setNotificationsActives(false)
      toast.error("Permission refusée pour les notifications")
    }
  }

  async function seDeconnecter() {
    await supabase.auth.signOut()
    router.push('/connexion')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header titre="Paramètres" />

        <main className="flex-1 p-6 pb-24 md:pb-6">
          <div className="max-w-2xl mx-auto space-y-6">

            {/* Profil */}
            <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-blue-500" />
                <h2 className="font-semibold text-gray-900 dark:text-white">Profil</h2>
              </div>

              <div className="flex items-center gap-4">
                {utilisateur?.user_metadata?.avatar_url && (
                  <img
                    src={utilisateur.user_metadata.avatar_url}
                    alt="Avatar"
                    className="w-14 h-14 rounded-full border-2 border-gray-100 dark:border-gray-800"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {utilisateur?.user_metadata?.full_name ?? 'Utilisateur'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{utilisateur?.email}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Connecté via Google</p>
                </div>
              </div>
            </section>

            {/* Apparence */}
            <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Palette className="w-5 h-5 text-purple-500" />
                <h2 className="font-semibold text-gray-900 dark:text-white">Apparence</h2>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Mode sombre</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {theme === 'dark' ? 'Actuellement : mode sombre' : 'Actuellement : mode clair'}
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </section>

            {/* Notifications */}
            <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 mb-4">
                {notificationsActives ? (
                  <Bell className="w-5 h-5 text-green-500" />
                ) : (
                  <BellOff className="w-5 h-5 text-gray-400" />
                )}
                <h2 className="font-semibold text-gray-900 dark:text-white">Notifications</h2>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Rappels navigateur</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {notificationsActives
                      ? 'Vous recevez des notifications pour vos tâches urgentes'
                      : 'Activez pour recevoir des rappels avant les deadlines'}
                  </p>
                </div>
                <Switch
                  checked={notificationsActives}
                  onCheckedChange={demanderNotifications}
                />
              </div>

              {notificationsActives && (
                <p className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-3 py-2 rounded-lg">
                  FlowTask vous alertera 30 minutes avant chaque deadline.
                </p>
              )}
            </section>

            {/* Danger zone */}
            <section className="bg-white dark:bg-gray-900 border border-red-100 dark:border-red-900/30 rounded-2xl p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Compte</h2>

              <Button
                variant="outline"
                onClick={seDeconnecter}
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30 gap-2"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </Button>
            </section>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
