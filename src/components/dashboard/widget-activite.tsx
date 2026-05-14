'use client'

import { useActivite } from '@/hooks/use-activite'
import { Activity, CheckSquare, Package, CalendarDays, FolderKanban, ListTodo, FileText } from 'lucide-react'

const ICONES: Record<string, React.ReactNode> = {
  tache: <ListTodo className="w-3.5 h-3.5 text-blue-500" />,
  materiel: <Package className="w-3.5 h-3.5 text-amber-500" />,
  reunion: <CalendarDays className="w-3.5 h-3.5 text-purple-500" />,
  projet: <FolderKanban className="w-3.5 h-3.5 text-green-500" />,
  devis: <FileText className="w-3.5 h-3.5 text-orange-500" />,
  default: <CheckSquare className="w-3.5 h-3.5 text-gray-400" />,
}

function formatTemps(iso: string) {
  const d = new Date(iso)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return 'À l\'instant'
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export function WidgetActivite() {
  const { data: activites = [], isLoading } = useActivite()

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
          <Activity className="w-4 h-4 text-gray-500" />
        </div>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Activité récente</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0" />
              <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              <div className="w-12 h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : activites.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-gray-600">
          Aucune activité enregistrée — les actions apparaîtront ici.
        </p>
      ) : (
        <div className="space-y-2.5">
          {activites.slice(0, 8).map((a, i) => (
            <div key={a.id} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center shrink-0">
                {ICONES[a.type] ?? ICONES.default}
              </div>
              <p className="flex-1 text-xs text-gray-600 dark:text-gray-400 truncate">{a.description}</p>
              <span className="text-xs text-gray-300 dark:text-gray-600 shrink-0 whitespace-nowrap">{formatTemps(a.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
