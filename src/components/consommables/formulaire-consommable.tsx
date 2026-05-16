'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCreerConsommable, useModifierConsommable } from '@/hooks/use-consommables'
import type { Consommable, NouveauConsommable } from '@/types'
import { CATEGORIES_CONSOMMABLES } from '@/types'

interface Props {
  ouvert: boolean
  onFermer: () => void
  itemAModifier?: Consommable | null
}

const VIDE: NouveauConsommable = {
  titre: '',
  categorie: 'Autre',
  stock_actuel: 0,
  seuil_alerte: 2,
  notes: null,
}

export function FormulaireConsommable({ ouvert, onFermer, itemAModifier }: Props) {
  const { mutate: creer, isPending: creation } = useCreerConsommable()
  const { mutate: modifier, isPending: modification } = useModifierConsommable()
  const [form, setForm] = useState<NouveauConsommable>(VIDE)

  useEffect(() => {
    if (itemAModifier) {
      setForm({
        titre: itemAModifier.titre,
        categorie: itemAModifier.categorie,
        stock_actuel: itemAModifier.stock_actuel,
        seuil_alerte: itemAModifier.seuil_alerte,
        notes: itemAModifier.notes,
      })
    } else {
      setForm(VIDE)
    }
  }, [itemAModifier, ouvert])

  function set<K extends keyof NouveauConsommable>(key: K, val: NouveauConsommable[K]) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function soumettre() {
    if (!form.titre.trim()) return
    if (itemAModifier) {
      modifier({ id: itemAModifier.id, ...form }, { onSuccess: onFermer })
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
          <DialogTitle>{itemAModifier ? 'Modifier le consommable' : 'Nouveau consommable'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <input autoFocus value={form.titre} onChange={e => set('titre', e.target.value)}
            placeholder="Nom du consommable *" className={cls} />
          <select value={form.categorie} onChange={e => set('categorie', e.target.value as NouveauConsommable['categorie'])} className={cls}>
            {CATEGORIES_CONSOMMABLES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 block mb-1">Stock actuel</label>
              <input type="number" min={0} value={form.stock_actuel}
                onChange={e => set('stock_actuel', Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-sm text-center border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-orange-500 block mb-1">Seuil d'alerte</label>
              <input type="number" min={0} value={form.seuil_alerte}
                onChange={e => set('seuil_alerte', Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full text-sm text-center border border-orange-200 dark:border-orange-800/50 rounded-lg px-2 py-2 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>
          <textarea value={form.notes ?? ''} onChange={e => set('notes', e.target.value || null)}
            placeholder="Notes (optionnel)" rows={2} className={cls} />
        </div>
        <div className="flex gap-3 pt-1">
          <Button variant="outline" onClick={onFermer} className="flex-1" disabled={enCours}>Annuler</Button>
          <Button onClick={soumettre} className="flex-1" disabled={!form.titre.trim() || enCours}>
            {enCours ? 'Enregistrement…' : itemAModifier ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
