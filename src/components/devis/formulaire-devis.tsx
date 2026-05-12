'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreerDevis, useModifierDevis } from '@/hooks/use-devis'
import type { Devis, NouveauDevis, StatutDevis } from '@/types'

interface Props {
  ouvert: boolean
  onFermer: () => void
  devisAModifier?: Devis | null
}

export function FormulaireDevis({ ouvert, onFermer, devisAModifier }: Props) {
  const { mutate: creer, isPending: creation } = useCreerDevis()
  const { mutate: modifier, isPending: modification } = useModifierDevis()

  const [titre, setTitre] = useState('')
  const [entreprise, setEntreprise] = useState('')
  const [montant, setMontant] = useState('')
  const [statut, setStatut] = useState<StatutDevis>('envoye')
  const [dateDevis, setDateDevis] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (devisAModifier) {
      setTitre(devisAModifier.titre)
      setEntreprise(devisAModifier.entreprise ?? '')
      setMontant(devisAModifier.montant != null ? String(devisAModifier.montant) : '')
      setStatut(devisAModifier.statut)
      setDateDevis(devisAModifier.date_devis)
      setNotes(devisAModifier.notes ?? '')
    } else {
      setTitre(''); setEntreprise(''); setMontant(''); setStatut('envoye')
      setDateDevis(new Date().toISOString().split('T')[0]); setNotes('')
    }
  }, [devisAModifier, ouvert])

  function soumettre() {
    if (!titre.trim()) return
    const devis: NouveauDevis = {
      titre: titre.trim(),
      entreprise: entreprise.trim() || null,
      montant: montant ? parseFloat(montant) : null,
      statut,
      date_devis: dateDevis,
      notes: notes.trim() || null,
    }
    if (devisAModifier) {
      modifier({ id: devisAModifier.id, ...devis }, { onSuccess: onFermer })
    } else {
      creer(devis, { onSuccess: onFermer })
    }
  }

  const enCours = creation || modification

  return (
    <Dialog open={ouvert} onOpenChange={(o) => !o && onFermer()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{devisAModifier ? 'Modifier le devis' : 'Nouveau devis'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Input placeholder="Titre du devis *" value={titre} onChange={e => setTitre(e.target.value)} autoFocus />
          <Input placeholder="Entreprise / Client" value={entreprise} onChange={e => setEntreprise(e.target.value)} />
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input type="number" placeholder="Montant" value={montant} onChange={e => setMontant(e.target.value)} min="0" step="0.001" className="pr-8" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">DT</span>
            </div>
            <Select value={statut} onValueChange={(v) => setStatut(v as StatutDevis)}>
              <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="envoye">Envoyé</SelectItem>
                <SelectItem value="en_attente_signature">En attente signature</SelectItem>
                <SelectItem value="paye">Payé</SelectItem>
                <SelectItem value="refuse">Refusé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Date du devis</label>
            <Input type="date" value={dateDevis} onChange={e => setDateDevis(e.target.value)} />
          </div>
          <Textarea placeholder="Notes (optionnel)" value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onFermer} className="flex-1" disabled={enCours}>Annuler</Button>
          <Button onClick={soumettre} className="flex-1" disabled={!titre.trim() || enCours}>
            {enCours ? 'Enregistrement…' : devisAModifier ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
