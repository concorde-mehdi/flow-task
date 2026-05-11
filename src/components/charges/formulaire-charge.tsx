'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreerCharge, useModifierCharge } from '@/hooks/use-charges'
import type { Charge, NouvelleCharge } from '@/types'

const CATEGORIES = ['Loyer', 'Équipement', 'Fournitures', 'Salaires', 'Services', 'Assurance', 'Électricité', 'Internet', 'Transport', 'Autre']

interface Props {
  ouvert: boolean
  onFermer: () => void
  chargeAModifier?: Charge | null
}

export function FormulaireCharge({ ouvert, onFermer, chargeAModifier }: Props) {
  const { mutate: creer, isPending: creation } = useCreerCharge()
  const { mutate: modifier, isPending: modification } = useModifierCharge()

  const [titre, setTitre] = useState('')
  const [montant, setMontant] = useState('')
  const [type, setType] = useState<'depense' | 'facture'>('depense')
  const [categorie, setCategorie] = useState('')
  const [statut, setStatut] = useState<'paye' | 'en_attente'>('en_attente')
  const [dateCharge, setDateCharge] = useState(new Date().toISOString().split('T')[0])
  const [dateEcheance, setDateEcheance] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (chargeAModifier) {
      setTitre(chargeAModifier.titre)
      setMontant(String(chargeAModifier.montant))
      setType(chargeAModifier.type)
      setCategorie(chargeAModifier.categorie ?? '')
      setStatut(chargeAModifier.statut)
      setDateCharge(chargeAModifier.date_charge)
      setDateEcheance(chargeAModifier.date_echeance ?? '')
      setNotes(chargeAModifier.notes ?? '')
    } else {
      setTitre('')
      setMontant('')
      setType('depense')
      setCategorie('')
      setStatut('en_attente')
      setDateCharge(new Date().toISOString().split('T')[0])
      setDateEcheance('')
      setNotes('')
    }
  }, [chargeAModifier, ouvert])

  function soumettre() {
    if (!titre.trim() || !montant) return

    const charge: NouvelleCharge = {
      titre: titre.trim(),
      montant: parseFloat(montant),
      type,
      categorie: categorie || null,
      statut,
      date_charge: dateCharge,
      date_echeance: dateEcheance || null,
      notes: notes.trim() || null,
    }

    if (chargeAModifier) {
      modifier({ id: chargeAModifier.id, ...charge }, { onSuccess: onFermer })
    } else {
      creer(charge, { onSuccess: onFermer })
    }
  }

  const enCours = creation || modification

  return (
    <Dialog open={ouvert} onOpenChange={(o) => !o && onFermer()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{chargeAModifier ? 'Modifier la charge' : 'Nouvelle charge'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Input
            placeholder="Titre *"
            value={titre}
            onChange={e => setTitre(e.target.value)}
          />

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                type="number"
                placeholder="Montant *"
                value={montant}
                onChange={e => setMontant(e.target.value)}
                min="0"
                step="0.01"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">€</span>
            </div>

            <Select value={type} onValueChange={(v) => setType(v as 'depense' | 'facture')}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="depense">Dépense</SelectItem>
                <SelectItem value="facture">Facture</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Select value={categorie} onValueChange={(v) => setCategorie(v ?? '')}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statut} onValueChange={(v) => setStatut(v as 'paye' | 'en_attente')}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="paye">Payé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Date</label>
              <Input
                type="date"
                value={dateCharge}
                onChange={e => setDateCharge(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Échéance</label>
              <Input
                type="date"
                value={dateEcheance}
                onChange={e => setDateEcheance(e.target.value)}
              />
            </div>
          </div>

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
          <Button onClick={soumettre} className="flex-1" disabled={!titre.trim() || !montant || enCours}>
            {enCours ? 'Enregistrement…' : chargeAModifier ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
