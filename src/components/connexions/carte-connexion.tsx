'use client'

import { motion } from 'framer-motion'
import { Monitor, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { useSupprimerConnexion } from '@/hooks/use-connexions'
import type { ConnexionPC } from '@/types'
import { toast } from 'sonner'

interface Props {
  connexion: ConnexionPC
  onModifier?: (connexion: ConnexionPC) => void
}

function telechargerRDP(nom: string, ip: string) {
  const contenu = [
    `full address:s:${ip}`,
    `prompt for credentials:i:1`,
    `administrative session:i:1`,
    `screen mode id:i:2`,
    `use multimon:i:0`,
    `session bpp:i:32`,
    `compression:i:1`,
    `keyboardhook:i:2`,
    `audiocapturemode:i:0`,
    `videoplaybackmode:i:1`,
    `connection type:i:7`,
    `networkautodetect:i:1`,
    `bandwidthautodetect:i:1`,
    `displayconnectionbar:i:1`,
    `disable wallpaper:i:0`,
    `allow font smoothing:i:1`,
    `allow desktop composition:i:1`,
    `disable full window drag:i:1`,
    `disable menu anims:i:1`,
    `disable themes:i:0`,
    `disable cursor setting:i:0`,
    `bitmapcachepersistenable:i:1`,
    `redirectprinters:i:1`,
    `redirectcomports:i:0`,
    `redirectsmartcards:i:1`,
    `redirectclipboard:i:1`,
    `redirectposdevices:i:0`,
    `autoreconnection enabled:i:1`,
    `authentication level:i:2`,
    `negotiate security layer:i:1`,
    `remoteapplicationmode:i:0`,
    `alternate shell:s:`,
    `shell working directory:s:`,
    `gatewayhostname:s:`,
    `gatewayusagemethod:i:4`,
    `gatewaycredentialssource:i:4`,
    `gatewayprofileusagemethod:i:0`,
    `promptcredentialonce:i:0`,
    `use redirection server name:i:0`,
    `rdgiskdcproxy:i:0`,
    `kdcproxyname:s:`,
  ].join('\r\n')

  const blob = new Blob([contenu], { type: 'application/x-rdp' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${nom.replace(/[^a-zA-Z0-9]/g, '_')}.rdp`
  a.click()
  URL.revokeObjectURL(url)
  toast.success(`Fichier RDP téléchargé pour ${nom}`)
}

export function CarteConnexion({ connexion, onModifier }: Props) {
  const { mutate: supprimer } = useSupprimerConnexion()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group flex items-center gap-3 p-4 rounded-xl border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800/50 transition-all"
    >
      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center shrink-0">
        <Monitor className="w-5 h-5 text-blue-500" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{connexion.nom}</p>
        <p className="text-xs font-mono text-blue-500 dark:text-blue-400">{connexion.ip}</p>
        {connexion.description && (
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{connexion.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => telechargerRDP(connexion.nom, connexion.ip)}
          className="flex items-center gap-1.5 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-lg transition-colors"
          title="Télécharger le fichier RDP"
        >
          <ExternalLink className="w-3 h-3" />
          Connecter
        </button>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={() => onModifier?.(connexion)} className="text-gray-300 hover:text-blue-500 dark:text-gray-700 dark:hover:text-blue-400 transition-colors p-1">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => supprimer(connexion.id)} className="text-gray-300 hover:text-red-500 dark:text-gray-700 dark:hover:text-red-400 transition-colors p-1">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
