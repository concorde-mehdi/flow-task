'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCreerLicence, useModifierLicence } from '@/hooks/use-licences'
import type { Licence, NouvelleLicence, TypeLicence } from '@/types'
import { TYPES_LICENCES } from '@/types'

interface Props {
  ouvert: boolean
  onFermer: () => void
  licenceAModifier?: Licence | null
}

const VIDE: NouvelleLicence = {
  titre: '',
  type: 'Logiciel',
  fournisseur: null,
  date_expiration: null,
  cle_licence: null,
  notes: null,
}

export function FormulaireLicence({ ouvert, onFermer, licenceAModifier }: Props) {
  const { mutate: creer, isPending: creation } = useCreerLicence()
  const { mutate: modifier, isPending: modification } = useModifierLicence()
  const [form, setForm] = useState<NouvelleLicence>(VIDE)

  useEffect(() => {
    if (licenceAModifier) {
      setForm({
        titre: licenceAModifier.titre,
        type: licenceAModifier.type,
        fournisseur: licenceAModifier.fournisseur,
        date_expiration: licenceAModifier.date_expiration,
        cle_licence: licenceAModifier.cle_licence,
        notes: licenceAModifier.notes,
      })
    } else {
      setForm(VIDE)
    }
  }, [licenceAModifier, ouvert])

  function set<K extends keyof NouvelleLicence>(key: K, val: NouvelleLicence[K]) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function soumettre() {
    if (!form.titre.trim()) return
    if (licenceAModifier) {
      modifier({ id: licenceAModifier.id, ...form }, { onSuccess: onFermer })
    } else {
      creer(form, { onSuccess: onFermer })
    }
  }

  const enCours = creation || modification
  const cls = 'w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-400'

  return (
    <Dialog open={ouvert} onOpenChange={o => !o && onFermer()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{licenceAModifier ? 'Modifier la licence' : 'Nouvelle licence / garantie'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <input autoFocus value={form.titre} onChange={e => set('titre', e.target.value)}
            placeholder="Nom du logiciel / équipement *" className={cls} />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.type} onChange={e => set('type', e.target.value as TypeLicence)} className={cls}>
              {TYPES_LICENCES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input value={form.fournisseur ?? ''} onChange={e => set('fournisseur', e.target.value || null)}
              placeholder="Fournisseur" className={cls} />
          </div>
          <div>
            <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 block mb-1">Date d'expiration</label>
            <input type="date" value={form.date_expiration ?? ''} onChange={e => set('date_expiration', e.target.value || null)} className={cls} />
          </div>
          <input value={form.cle_licence ?? ''} onChange={e => set('cle_licence', e.target.value || null)}
            placeholder="Clé de licence (optionnel)" className={`${cls} font-mono`} />
          <textarea value={form.notes ?? ''} onChange={e => set('notes', e.target.value || null)}
            placeholder="Notes (optionnel)" rows={2} className={cls} />
        </div>
        <div className="flex gap-3 pt-1">
          <Button variant="outline" onClick={onFermer} className="flex-1" disabled={enCours}>Annuler</Button>
          <Button onClick={soumettre} className="flex-1" disabled={!form.titre.trim() || enCours}>
            {enCours ? 'Enregistrement…' : licenceAModifier ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
