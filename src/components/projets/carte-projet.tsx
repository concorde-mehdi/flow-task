'use client'

import { motion } from 'framer-motion'
import { FolderKanban, Pencil, Trash2, CheckCircle2, RefreshCw } from 'lucide-react'
import { useSupprimerProjet, useModifierProjet } from '@/hooks/use-projets'
import type { Projet } from '@/types'

interface Props {
  projet: Projet
  onModifier?: (projet: Projet) => void
}

export function CarteProjet({ projet, onModifier }: Props) {
  const { mutate: supprimer } = useSupprimerProjet()
  const { mutate: modifier } = useModifierProjet()
  const acheve = projet.statut === 'acheve'

  function basculerStatut() {
    modifier({
      id: projet.id,
      statut: acheve ? 'en_cours' : 'acheve',
      avancement: acheve ? projet.avancement : 100,
    })
  }

  const couleurBarre = acheve
    ? 'bg-green-500'
    : projet.avancement >= 75
      ? 'bg-blue-500'
      : projet.avancement >= 40
        ? 'bg-yellow-500'
        : 'bg-gray-300 dark:bg-gray-600'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group p-4 rounded-xl border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800/50 transition-all"
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${acheve ? 'bg-green-50 dark:bg-green-950/50' : 'bg-blue-50 dark:bg-blue-950/50'}`}>
          <FolderKanban className={`w-4.5 h-4.5 ${acheve ? 'text-green-500' : 'text-blue-500'}`} size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-semibold truncate ${acheve ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
              {projet.titre}
            </p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${acheve ? 'bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'}`}>
              {acheve ? 'Achevé' : 'En cours'}
            </span>
          </div>

          {projet.notes && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">{projet.notes}</p>
          )}

          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${couleurBarre}`}
                style={{ width: `${acheve ? 100 : projet.avancement}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-8 text-right">
              {acheve ? 100 : projet.avancement}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
          <button
            onClick={basculerStatut}
            className={`transition-colors p-1 ${acheve ? 'text-gray-300 hover:text-blue-500 dark:text-gray-700 dark:hover:text-blue-400' : 'text-gray-300 hover:text-green-500 dark:text-gray-700 dark:hover:text-green-400'}`}
            title={acheve ? 'Remettre en cours' : 'Marquer achevé'}
          >
            {acheve ? <RefreshCw className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => onModifier?.(projet)} className="text-gray-300 hover:text-blue-500 dark:text-gray-700 dark:hover:text-blue-400 transition-colors p-1">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => supprimer(projet.id)} className="text-gray-300 hover:text-red-500 dark:text-gray-700 dark:hover:text-red-400 transition-colors p-1">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
