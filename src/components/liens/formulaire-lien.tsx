'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreerLien, useModifierLien } from '@/hooks/use-liens'
import { CATEGORIES_LIENS } from '@/types'
import type { Lien, NouveauLien } from '@/types'

interface Props {
  ouvert: boolean
  onFermer: () => void
  lienAModifier?: Lien | null
}

export function FormulaireLien({ ouvert, onFermer, lienAModifier }: Props) {
  const { mutate: creer, isPending: creation } = useCreerLien()
  const { mutate: modifier, isPending: modification } = useModifierLien()

  const [titre, setTitre] = useState('')
  const [url, setUrl] = useState('')
  const [categorie, setCategorie] = useState<string>('Documentation')
  const [notes, setNotes] = useState('')
  const [consulte, setConsulte] = useState(false)

  useEffect(() => {
    if (lienAModifier) {
      setTitre(lienAModifier.titre)
      setUrl(lienAModifier.url)
      setCategorie(lienAModifier.categorie)
      setNotes(lienAModifier.notes ?? '')
      setConsulte(lienAModifier.consulte)
    } else {
      setTitre('')
      setUrl('')
      setCategorie('Documentation')
      setNotes('')
      setConsulte(false)
    }
  }, [lienAModifier, ouvert])

  function soumettre() {
    if (!titre.trim() || !url.trim()) return

    const lien: NouveauLien = {
      titre: titre.trim(),
      url: url.trim(),
      categorie,
      notes: notes.trim() || null,
      consulte,
    }

    if (lienAModifier) {
      modifier({ id: lienAModifier.id, ...lien }, { onSuccess: onFermer })
    } else {
      creer(lien, { onSuccess: onFermer })
    }
  }

  const enCours = creation || modification

  return (
    <Dialog open={ouvert} onOpenChange={(o) => !o && onFermer()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{lienAModifier ? 'Modifier le lien' : 'Nouveau lien utile'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Input
            placeholder="Titre *"
            value={titre}
            onChange={e => setTitre(e.target.value)}
            autoFocus
          />

          <Input
            placeholder="URL * (https://...)"
            value={url}
            onChange={e => setUrl(e.target.value)}
            type="url"
          />

          <Select value={categorie} onValueChange={(v) => setCategorie(v ?? 'Documentation')}>
            <SelectTrigger>
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES_LIENS.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            placeholder="Notes (optionnel)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onFermer} className="flex-1" disabled={enCours}>
            Annuler
          </Button>
          <Button onClick={soumettre} className="flex-1" disabled={!titre.trim() || !url.trim() || enCours}>
            {enCours ? 'Enregistrement…' : lienAModifier ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
