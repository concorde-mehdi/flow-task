'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { EmailResume } from '@/hooks/use-gmail'

interface Props {
  email: EmailResume
  onClick: () => void
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffH = diffMs / (1000 * 60 * 60)
    if (diffH < 24) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    if (diffH < 24 * 7) return d.toLocaleDateString('fr-FR', { weekday: 'short' })
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  } catch {
    return ''
  }
}

function initiales(nom: string): string {
  return nom.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase()
}

const COULEURS = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500']
function couleurAvatar(nom: string): string {
  let hash = 0
  for (let i = 0; i < nom.length; i++) hash = nom.charCodeAt(i) + ((hash << 5) - hash)
  return COULEURS[Math.abs(hash) % COULEURS.length]
}

export function CarteEmail({ email, onClick }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0',
        email.lu
          ? 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          : 'bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/70 dark:hover:bg-blue-950/30'
      )}
    >
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full ${couleurAvatar(email.expediteur)} flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5`}>
        {initiales(email.expediteur)}
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className={cn('text-sm truncate', email.lu ? 'text-gray-700 dark:text-gray-300' : 'font-semibold text-gray-900 dark:text-white')}>
            {email.expediteur}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{formatDate(email.date)}</span>
        </div>
        <p className={cn('text-sm truncate', email.lu ? 'text-gray-500 dark:text-gray-400' : 'font-medium text-gray-800 dark:text-gray-200')}>
          {email.sujet}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{email.extrait}</p>
      </div>

      {/* Point non-lu */}
      {!email.lu && (
        <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
      )}
    </motion.div>
  )
}
