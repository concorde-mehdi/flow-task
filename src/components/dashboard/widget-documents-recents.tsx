'use client'

import Link from 'next/link'
import { ArrowRight, FileText, FileSpreadsheet, FilePieChart, FileImage, File, Plus } from 'lucide-react'
import { useDocuments } from '@/hooks/use-documents'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

const TYPE_CONFIG: Record<string, { icone: React.ElementType; couleur: string; fond: string }> = {
  'PDF':        { icone: FileText,        couleur: 'text-red-500',    fond: 'bg-red-50 dark:bg-red-950/30' },
  'Word':       { icone: FileText,        couleur: 'text-blue-500',   fond: 'bg-blue-50 dark:bg-blue-950/30' },
  'Excel':      { icone: FileSpreadsheet, couleur: 'text-green-500',  fond: 'bg-green-50 dark:bg-green-950/30' },
  'PowerPoint': { icone: FilePieChart,    couleur: 'text-orange-500', fond: 'bg-orange-50 dark:bg-orange-950/30' },
  'Image':      { icone: FileImage,       couleur: 'text-purple-500', fond: 'bg-purple-50 dark:bg-purple-950/30' },
}

function IconeDoc({ type }: { type: string }) {
  const cfg = TYPE_CONFIG[type] ?? { icone: File, couleur: 'text-gray-500', fond: 'bg-gray-50 dark:bg-gray-800' }
  const Icone = cfg.icone
  return (
    <div className={`w-9 h-9 rounded-xl ${cfg.fond} flex items-center justify-center shrink-0`}>
      <Icone className={`w-4.5 h-4.5 ${cfg.couleur}`} size={18} />
    </div>
  )
}

export function WidgetDocumentsRecents() {
  const { data: documents = [], isLoading } = useDocuments()

  const recents = documents.slice(0, 4)

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center">
            <FileText className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Documents récents</p>
        </div>
        <Link href="/documents" className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors">
          Voir tout <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3 flex-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-3/4" />
                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : recents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-4 text-center gap-2">
          <FileText className="w-8 h-8 text-gray-200 dark:text-gray-700" />
          <p className="text-xs text-gray-400 dark:text-gray-600">Aucun document</p>
        </div>
      ) : (
        <div className="space-y-3 flex-1">
          {recents.map(doc => (
            <div key={doc.id} className="flex items-center gap-3">
              <IconeDoc type={doc.type} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{doc.titre}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Ajouté {formatDistanceToNow(new Date(doc.created_at), { locale: fr, addSuffix: true })}
                </p>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-600 shrink-0">{doc.type}</span>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/documents"
        className="mt-4 flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Ajouter un document
      </Link>
    </div>
  )
}
