'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCreerConnexion, useModifierConnexion } from '@/hooks/use-connexions'
import type { ConnexionPC, NouvelleConnexion } from '@/types'

interface Props {
  ouvert: boolean
  onFermer: () => void
  connexionAModifier?: ConnexionPC | null
}

export function FormulaireConnexion({ ouvert, onFermer, connexionAModifier }: Props) {
  const { mutate: creer, isPending: creation } = useCreerConnexion()
  const { mutate: modifier, isPending: modification } = useModifierConnexion()

  const [nom, setNom] = useState('')
  const [ip, setIp] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (connexionAModifier) {
      setNom(connexionAModifier.nom)
      setIp(connexionAModifier.ip)
      setDescription(connexionAModifier.description ?? '')
    } else {
      setNom(''); setIp(''); setDescription('')
    }
  }, [connexionAModifier, ouvert])

  function soumettre() {
    if (!nom.trim() || !ip.trim()) return
    const connexion: NouvelleConnexion = {
      nom: nom.trim(),
      ip: ip.trim(),
      description: description.trim() || null,
    }
    if (connexionAModifier) {
      modifier({ id: connexionAModifier.id, ...connexion }, { onSuccess: onFermer })
    } else {
      creer(connexion, { onSuccess: onFermer })
    }
  }

  const enCours = creation || modification

  return (
    <Dialog open={ouvert} onOpenChange={(o) => !o && onFermer()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{connexionAModifier ? 'Modifier la connexion' : 'Nouvelle connexion PC'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Input placeholder="Nom (ex: Serveur HP, Bureau DRH) *" value={nom} onChange={e => setNom(e.target.value)} autoFocus />
          <Input placeholder="Adresse IP *" value={ip} onChange={e => setIp(e.target.value)} />
          <Textarea placeholder="Description (optionnel)" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onFermer} className="flex-1" disabled={enCours}>Annuler</Button>
          <Button onClick={soumettre} className="flex-1" disabled={!nom.trim() || !ip.trim() || enCours}>
            {enCours ? 'Enregistrement…' : connexionAModifier ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
