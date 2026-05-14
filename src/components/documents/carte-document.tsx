'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { useSupprimerDocument } from '@/hooks/use-documents'
import type { Document } from '@/types'

const COULEURS_TYPE: Record<string, string> = {
  PDF: 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400',
  Word: 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
  Excel: 'bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400',
  PowerPoint: 'bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400',
  Image: 'bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400',
  Vidéo: 'bg-pink-100 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400',
  Lien: 'bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400',
  Autre: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

interface Props {
  document: Document
  onModifier?: (document: Document) => void
}

export function CarteDocument({ document, onModifier }: Props) {
  const { mutate: supprimer } = useSupprimerDocument()
  const couleur = COULEURS_TYPE[document.type] ?? COULEURS_TYPE['Autre']

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group flex items-center gap-3 p-4 rounded-xl border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800/50 transition-all"
    >
      <span className={`text-xs font-semibold px-2 py-1 rounded-lg shrink-0 ${couleur}`}>
        {document.type}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{document.titre}</p>
        {document.notes && <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{document.notes}</p>}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <a
          href={document.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-blue-500 dark:text-gray-600 dark:hover:text-blue-400 transition-colors p-1"
          title="Ouvrir"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={() => onModifier?.(document)} className="text-gray-300 hover:text-blue-500 dark:text-gray-700 dark:hover:text-blue-400 transition-colors p-1">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => supprimer(document.id)} className="text-gray-300 hover:text-red-500 dark:text-gray-700 dark:hover:text-red-400 transition-colors p-1">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
