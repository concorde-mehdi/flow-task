'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCreerReunion, useModifierReunion } from '@/hooks/use-reunions'
import type { Reunion, NouvelleReunion } from '@/types'

interface Props {
  ouvert: boolean
  onFermer: () => void
  reunionAModifier?: Reunion | null
}

function toLocalDatetime(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function FormulaireReunion({ ouvert, onFermer, reunionAModifier }: Props) {
  const { mutate: creer, isPending: creation } = useCreerReunion()
  const { mutate: modifier, isPending: modification } = useModifierReunion()

  const [titre, setTitre] = useState('')
  const [dateHeure, setDateHeure] = useState('')
  const [lieu, setLieu] = useState('')
  const [description, setDescription] = useState('')
  const [duree, setDuree] = useState('60')

  useEffect(() => {
    if (reunionAModifier) {
      setTitre(reunionAModifier.titre)
      setDateHeure(toLocalDatetime(reunionAModifier.date_heure))
      setLieu(reunionAModifier.lieu ?? '')
      setDescription(reunionAModifier.description ?? '')
      setDuree(String(reunionAModifier.duree_minutes))
    } else {
      setTitre(''); setDateHeure(''); setLieu(''); setDescription(''); setDuree('60')
    }
  }, [reunionAModifier, ouvert])

  function soumettre() {
    if (!titre.trim() || !dateHeure) return
    const reunion: NouvelleReunion = {
      titre: titre.trim(),
      date_heure: new Date(dateHeure).toISOString(),
      lieu: lieu.trim() || null,
      description: description.trim() || null,
      duree_minutes: parseInt(duree) || 60,
    }
    if (reunionAModifier) {
      modifier({ id: reunionAModifier.id, ...reunion }, { onSuccess: onFermer })
    } else {
      creer(reunion, { onSuccess: onFermer })
    }
  }

  const enCours = creation || modification

  return (
    <Dialog open={ouvert} onOpenChange={(o) => !o && onFermer()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{reunionAModifier ? 'Modifier la réunion' : 'Nouvelle réunion'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Input placeholder="Titre *" value={titre} onChange={e => setTitre(e.target.value)} autoFocus />
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Date et heure *</label>
            <Input type="datetime-local" value={dateHeure} onChange={e => setDateHeure(e.target.value)} />
          </div>
          <Input placeholder="Lieu (salle, visio…)" value={lieu} onChange={e => setLieu(e.target.value)} />
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Durée (min)"
              value={duree}
              onChange={e => setDuree(e.target.value)}
              min={5}
              max={480}
              className="w-36"
            />
            <span className="text-sm text-gray-400">minutes</span>
          </div>
          <Textarea placeholder="Description / ordre du jour (optionnel)" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onFermer} className="flex-1" disabled={enCours}>Annuler</Button>
          <Button onClick={soumettre} className="flex-1" disabled={!titre.trim() || !dateHeure || enCours}>
            {enCours ? 'Enregistrement…' : reunionAModifier ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
