'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCreerTache } from '@/hooks/use-taches'
import { motion } from 'framer-motion'

export function AjoutRapide({ onOuvrir }: { onOuvrir: () => void }) {
  const [titre, setTitre] = useState('')
  const { mutate: creer, isPending } = useCreerTache()

  function ajouterVite(e: React.FormEvent) {
    e.preventDefault()
    if (!titre.trim()) return
    creer({
      titre: titre.trim(),
      description: null,
      deadline: null,
      priorite: 'Moyenne',
      tags: [],
      statut: false,
      is_quotidienne: false,
    })
    setTitre('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-4"
    >
      <form onSubmit={ajouterVite} className="flex gap-2">
        <Input
          placeholder="Ajouter une tâche rapidement..."
          value={titre}
          onChange={e => setTitre(e.target.value)}
          className="text-sm flex-1 border-0 bg-gray-50 dark:bg-gray-800 focus-visible:ring-1 focus-visible:ring-blue-500"
        />
        <Button
          type="submit"
          disabled={!titre.trim() || isPending}
          size="sm"
          className="bg-blue-500 hover:bg-blue-600 text-white shrink-0"
        >
          <Plus className="w-4 h-4 mr-1" />
          Ajouter
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOuvrir}
          className="shrink-0 text-xs"
        >
          + Détails
        </Button>
      </form>
    </motion.div>
  )
}
