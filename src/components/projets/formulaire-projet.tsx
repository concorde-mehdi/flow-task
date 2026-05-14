'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCreerProjet, useModifierProjet } from '@/hooks/use-projets'
import type { Projet, NouveauProjet } from '@/types'

interface Props {
  ouvert: boolean
  onFermer: () => void
  projetAModifier?: Projet | null
}

export function FormulaireProjet({ ouvert, onFermer, projetAModifier }: Props) {
  const { mutate: creer, isPending: creation } = useCreerProjet()
  const { mutate: modifier, isPending: modification } = useModifierProjet()

  const [titre, setTitre] = useState('')
  const [statut, setStatut] = useState<'en_cours' | 'acheve'>('en_cours')
  const [avancement, setAvancement] = useState(0)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (projetAModifier) {
      setTitre(projetAModifier.titre)
      setStatut(projetAModifier.statut)
      setAvancement(projetAModifier.avancement)
      setNotes(projetAModifier.notes ?? '')
    } else {
      setTitre(''); setStatut('en_cours'); setAvancement(0); setNotes('')
    }
  }, [projetAModifier, ouvert])

  function soumettre() {
    if (!titre.trim()) return
    const projet: NouveauProjet = {
      titre: titre.trim(),
      statut,
      avancement,
      notes: notes.trim() || null,
    }
    if (projetAModifier) {
      modifier({ id: projetAModifier.id, ...projet }, { onSuccess: onFermer })
    } else {
      creer(projet, { onSuccess: onFermer })
    }
  }

  const enCours = creation || modification

  return (
    <Dialog open={ouvert} onOpenChange={(o) => !o && onFermer()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{projetAModifier ? 'Modifier le projet' : 'Nouveau projet'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Input placeholder="Titre du projet *" value={titre} onChange={e => setTitre(e.target.value)} autoFocus />

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Statut</label>
            <select
              value={statut}
              onChange={e => setStatut(e.target.value as 'en_cours' | 'acheve')}
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en_cours">En cours</option>
              <option value="acheve">Achevé</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-gray-500">Avancement</label>
              <span className="text-xs font-semibold text-blue-500">{avancement}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={avancement}
              onChange={e => setAvancement(parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <Textarea placeholder="Notes (optionnel)" value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onFermer} className="flex-1" disabled={enCours}>Annuler</Button>
          <Button onClick={soumettre} className="flex-1" disabled={!titre.trim() || enCours}>
            {enCours ? 'Enregistrement…' : projetAModifier ? 'Modifier' : 'Créer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
