'use client'

import Link from 'next/link'
import { ArrowRight, Package, Wifi, Monitor, Wrench } from 'lucide-react'
import { useMateriel } from '@/hooks/use-materiel'

const ICONES_CAT: Record<string, React.ElementType> = {
  'Informatique': Monitor,
  'Réseau': Wifi,
  'Médical': Wrench,
  'Général': Package,
  'Mobilier': Package,
  'Consommables': Package,
  'Sécurité': Package,
}

const STATUT_CONFIG: Record<string, { label: string; classe: string }> = {
  'livre':       { label: 'En stock',    classe: 'text-green-600 dark:text-green-400' },
  'commande':    { label: 'Commandé',    classe: 'text-blue-600 dark:text-blue-400' },
  'en_livraison':{ label: 'En transit', classe: 'text-orange-600 dark:text-orange-400' },
  'en_panne':    { label: 'En panne',   classe: 'text-red-600 dark:text-red-400' },
}

export function WidgetStockMateriel() {
  const { data: materiel = [], isLoading } = useMateriel()

  // Grouper par catégorie : somme des quantités
  const parCategorie = materiel.reduce<Record<string, { qte: number; statutDom: string }>>((acc, m) => {
    const cat = m.categorie || 'Général'
    if (!acc[cat]) acc[cat] = { qte: 0, statutDom: m.statut }
    acc[cat].qte += m.quantite
    if (m.statut === 'en_panne') acc[cat].statutDom = 'en_panne'
    return acc
  }, {})

  const lignes = Object.entries(parCategorie)
    .sort((a, b) => b[1].qte - a[1].qte)
    .slice(0, 5)

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center">
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Stock matériel</p>
        </div>
        <Link href="/materiel" className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors">
          Voir tout <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3 flex-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : lignes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-4 text-center gap-2">
          <Package className="w-8 h-8 text-gray-200 dark:text-gray-700" />
          <p className="text-xs text-gray-400 dark:text-gray-600">Aucun matériel enregistré</p>
        </div>
      ) : (
        <div className="space-y-2.5 flex-1">
          {lignes.map(([cat, { qte, statutDom }]) => {
            const Icone = ICONES_CAT[cat] ?? Package
            const statut = STATUT_CONFIG[statutDom] ?? STATUT_CONFIG['livre']
            return (
              <div key={cat} className="flex items-center gap-3">
                <Icone className="w-4 h-4 text-gray-400 dark:text-gray-600 shrink-0" />
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 flex-1 truncate">{cat}</p>
                <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{qte}</span>
                <span className={`text-xs font-medium ${statut.classe}`}>{statut.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
