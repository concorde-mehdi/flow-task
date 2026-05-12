'use client'

import Link from 'next/link'
import { Wallet, AlertCircle, ArrowRight } from 'lucide-react'
import { useCharges } from '@/hooks/use-charges'
import { isThisMonth, parseISO } from 'date-fns'

export function WidgetCharges() {
  const { data: charges = [], isLoading } = useCharges()

  const chargesDuMois = charges.filter(c => isThisMonth(parseISO(c.date_charge)))
  const totalMois = chargesDuMois.reduce((s, c) => s + c.montant, 0)
  const enAttente = charges.filter(c => c.statut === 'en_attente').reduce((s, c) => s + c.montant, 0)

  function fmt(n: number) {
    return n.toLocaleString('fr-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) + ' DT'
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Charges du mois</p>
        </div>
        <Link href="/charges" className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium transition-colors">
          Voir tout <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-2/3" />
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{fmt(totalMois)}</p>
          {enAttente > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
              <AlertCircle className="w-3.5 h-3.5" />
              <span className="font-medium">{fmt(enAttente)} en attente</span>
            </div>
          )}
          {enAttente === 0 && chargesDuMois.length > 0 && (
            <p className="text-xs text-green-500 dark:text-green-400 font-medium">Tout est réglé ✓</p>
          )}
          {chargesDuMois.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-600">Aucune charge ce mois</p>
          )}
        </div>
      )}
    </div>
  )
}
