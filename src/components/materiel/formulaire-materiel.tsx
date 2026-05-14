'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreerMateriel, useModifierMateriel } from '@/hooks/use-materiel'
import type { Materiel, NouveauMateriel, StatutMateriel } from '@/types'
import { CATEGORIES_MATERIEL } from '@/types'

interface Props {
  ouvert: boolean
  onFermer: () => void
  materielAModifier?: Materiel | null
}

export function FormulaireMateriel({ ouvert, onFermer, materielAModifier }: Props) {
  const { mutate: creer, isPending: creation } = useCreerMateriel()
  const { mutate: modifier, isPending: modification } = useModifierMateriel()

  const [titre, setTitre] = useState('')
  const [quantite, setQuantite] = useState('1')
  const [statut, setStatut] = useState<StatutMateriel>('commande')
  const [categorie, setCategorie] = useState('Général')
  const [fournisseur, setFournisseur] = useState('')
  const [dateCommande, setDateCommande] = useState('')
  const [dateLivraison, setDateLivraison] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (materielAModifier) {
      setTitre(materielAModifier.titre)
      setQuantite(String(materielAModifier.quantite))
      setStatut(materielAModifier.statut)
      setCategorie(materielAModifier.categorie ?? 'Général')
      setFournisseur(materielAModifier.fournisseur ?? '')
      setDateCommande(materielAModifier.date_commande ?? '')
      setDateLivraison(materielAModifier.date_livraison_prevue ?? '')
      setNotes(materielAModifier.notes ?? '')
    } else {
      setTitre(''); setQuantite('1'); setStatut('commande'); setCategorie('Général')
      setFournisseur(''); setDateCommande(''); setDateLivraison(''); setNotes('')
    }
  }, [materielAModifier, ouvert])

  function soumettre() {
    if (!titre.trim()) return
    const item: NouveauMateriel = {
      titre: titre.trim(),
      quantite: parseInt(quantite) || 1,
      statut,
      categorie,
      fournisseur: fournisseur.trim() || null,
      date_commande: dateCommande || null,
      date_livraison_prevue: dateLivraison || null,
      notes: notes.trim() || null,
    }
    if (materielAModifier) {
      modifier({ id: materielAModifier.id, ...item }, { onSuccess: onFermer })
    } else {
      creer(item, { onSuccess: onFermer })
    }
  }

  const enCours = creation || modification

  return (
    <Dialog open={ouvert} onOpenChange={(o) => !o && onFermer()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{materielAModifier ? 'Modifier l\'équipement' : 'Nouvel équipement'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Input placeholder="Nom de l'équipement *" value={titre} onChange={e => setTitre(e.target.value)} autoFocus />
          <div className="flex gap-3">
            <Input type="number" placeholder="Qté" value={quantite} onChange={e => setQuantite(e.target.value)} min="1" className="w-24" />
            <Select value={statut} onValueChange={(v) => setStatut(v as StatutMateriel)}>
              <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="commande">Commandé</SelectItem>
                <SelectItem value="en_livraison">En livraison</SelectItem>
                <SelectItem value="livre">Livré</SelectItem>
                <SelectItem value="en_panne">En panne</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Catégorie</label>
            <select
              value={categorie}
              onChange={e => setCategorie(e.target.value)}
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES_MATERIEL.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Input placeholder="Fournisseur" value={fournisseur} onChange={e => setFournisseur(e.target.value)} />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Date commande</label>
              <Input type="date" value={dateCommande} onChange={e => setDateCommande(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500 mb-1 block">Livraison prévue</label>
              <Input type="date" value={dateLivraison} onChange={e => setDateLivraison(e.target.value)} />
            </div>
          </div>
          <Textarea placeholder="Notes (optionnel)" value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onFermer} className="flex-1" disabled={enCours}>Annuler</Button>
          <Button onClick={soumettre} className="flex-1" disabled={!titre.trim() || enCours}>
            {enCours ? 'Enregistrement…' : materielAModifier ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
