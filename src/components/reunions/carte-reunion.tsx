'use client'

import { motion } from 'framer-motion'
import { MapPin, Clock, Pencil, Trash2, CalendarDays } from 'lucide-react'
import { useSupprimerReunion } from '@/hooks/use-reunions'
import type { Reunion } from '@/types'

interface Props {
  reunion: Reunion
  onModifier?: (reunion: Reunion) => void
}

function formatDateHeure(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }),
    heure: d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  }
}

function estPassee(iso: string) {
  return new Date(iso) < new Date()
}

function formatDuree(min: number) {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

export function CarteReunion({ reunion, onModifier }: Props) {
  const { mutate: supprimer } = useSupprimerReunion()
  const { date, heure } = formatDateHeure(reunion.date_heure)
  const passee = estPassee(reunion.date_heure)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`group flex items-start gap-4 p-4 rounded-xl border bg-white dark:bg-gray-900 transition-all ${
        passee
          ? 'border-gray-100 dark:border-gray-800 opacity-60'
          : 'border-blue-100 dark:border-blue-900/40 hover:border-blue-200 dark:hover:border-blue-800/60'
      }`}
    >
      <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl shrink-0 ${passee ? 'bg-gray-100 dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-950/50'}`}>
        <CalendarDays className={`w-5 h-5 ${passee ? 'text-gray-400' : 'text-blue-500'}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${passee ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
          {reunion.titre}
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <CalendarDays className="w-3 h-3" />{date} à {heure}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <Clock className="w-3 h-3" />{formatDuree(reunion.duree_minutes)}
          </span>
          {reunion.lieu && (
            <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <MapPin className="w-3 h-3" />{reunion.lieu}
            </span>
          )}
        </div>
        {reunion.description && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">{reunion.description}</p>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
        <button onClick={() => onModifier?.(reunion)} className="text-gray-300 hover:text-blue-500 dark:text-gray-700 dark:hover:text-blue-400 transition-colors p-1">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => supprimer(reunion.id)} className="text-gray-300 hover:text-red-500 dark:text-gray-700 dark:hover:text-red-400 transition-colors p-1">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  )
}
