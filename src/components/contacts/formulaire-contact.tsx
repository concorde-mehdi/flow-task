'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCreerContact, useModifierContact } from '@/hooks/use-contacts'
import type { Contact, NouveauContact } from '@/types'

interface Props {
  ouvert: boolean
  onFermer: () => void
  contactAModifier?: Contact | null
}

export function FormulaireContact({ ouvert, onFermer, contactAModifier }: Props) {
  const { mutate: creer, isPending: creation } = useCreerContact()
  const { mutate: modifier, isPending: modification } = useModifierContact()

  const [nom, setNom] = useState('')
  const [poste, setPoste] = useState('')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (contactAModifier) {
      setNom(contactAModifier.nom)
      setPoste(contactAModifier.poste ?? '')
      setTelephone(contactAModifier.telephone ?? '')
      setEmail(contactAModifier.email ?? '')
      setNotes(contactAModifier.notes ?? '')
    } else {
      setNom(''); setPoste(''); setTelephone(''); setEmail(''); setNotes('')
    }
  }, [contactAModifier, ouvert])

  function soumettre() {
    if (!nom.trim()) return
    const contact: NouveauContact = {
      nom: nom.trim(),
      poste: poste.trim() || null,
      telephone: telephone.trim() || null,
      email: email.trim() || null,
      notes: notes.trim() || null,
    }
    if (contactAModifier) {
      modifier({ id: contactAModifier.id, ...contact }, { onSuccess: onFermer })
    } else {
      creer(contact, { onSuccess: onFermer })
    }
  }

  const enCours = creation || modification

  return (
    <Dialog open={ouvert} onOpenChange={(o) => !o && onFermer()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{contactAModifier ? 'Modifier le contact' : 'Nouveau contact'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Input placeholder="Nom *" value={nom} onChange={e => setNom(e.target.value)} autoFocus />
          <Input placeholder="Poste / Fonction" value={poste} onChange={e => setPoste(e.target.value)} />
          <Input placeholder="Téléphone" value={telephone} onChange={e => setTelephone(e.target.value)} type="tel" />
          <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} type="email" />
          <Textarea placeholder="Notes (optionnel)" value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onFermer} className="flex-1" disabled={enCours}>Annuler</Button>
          <Button onClick={soumettre} className="flex-1" disabled={!nom.trim() || enCours}>
            {enCours ? 'Enregistrement…' : contactAModifier ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
