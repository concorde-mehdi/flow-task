'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCreerDocument, useModifierDocument } from '@/hooks/use-documents'
import type { Document, NouveauDocument } from '@/types'
import { TYPES_DOCUMENTS } from '@/types'

interface Props {
  ouvert: boolean
  onFermer: () => void
  documentAModifier?: Document | null
}

export function FormulaireDocument({ ouvert, onFermer, documentAModifier }: Props) {
  const { mutate: creer, isPending: creation } = useCreerDocument()
  const { mutate: modifier, isPending: modification } = useModifierDocument()

  const [titre, setTitre] = useState('')
  const [url, setUrl] = useState('')
  const [type, setType] = useState('Autre')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (documentAModifier) {
      setTitre(documentAModifier.titre)
      setUrl(documentAModifier.url)
      setType(documentAModifier.type)
      setNotes(documentAModifier.notes ?? '')
    } else {
      setTitre(''); setUrl(''); setType('Autre'); setNotes('')
    }
  }, [documentAModifier, ouvert])

  function soumettre() {
    if (!titre.trim() || !url.trim()) return
    const doc: NouveauDocument = {
      titre: titre.trim(),
      url: url.trim(),
      type,
      notes: notes.trim() || null,
    }
    if (documentAModifier) {
      modifier({ id: documentAModifier.id, ...doc }, { onSuccess: onFermer })
    } else {
      creer(doc, { onSuccess: onFermer })
    }
  }

  const enCours = creation || modification

  return (
    <Dialog open={ouvert} onOpenChange={(o) => !o && onFermer()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{documentAModifier ? 'Modifier le document' : 'Nouveau document'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Input placeholder="Titre *" value={titre} onChange={e => setTitre(e.target.value)} autoFocus />
          <Input placeholder="URL / Lien *" value={url} onChange={e => setUrl(e.target.value)} type="url" />
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Type</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TYPES_DOCUMENTS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Textarea placeholder="Notes (optionnel)" value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onFermer} className="flex-1" disabled={enCours}>Annuler</Button>
          <Button onClick={soumettre} className="flex-1" disabled={!titre.trim() || !url.trim() || enCours}>
            {enCours ? 'Enregistrement…' : documentAModifier ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
