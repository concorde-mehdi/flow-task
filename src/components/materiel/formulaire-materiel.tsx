'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCreerMateriel, useModifierMateriel } from '@/hooks/use-materiel'
import type { Materiel, NouveauMateriel } from '@/types'
import { CATEGORIES_MATERIEL } from '@/types'

interface Props {
  ouvert: boolean
  onFermer: () => void
  materielAModifier?: Materiel | null
}

const VIDE: NouveauMateriel = {
  titre: '',
  categorie: 'PC',
  quantite_totale: 1,
  quantite_active: 1,
  quantite_reserve: 0,
  quantite_panne: 0,
  localisation: null,
  notes: null,
}

export function FormulaireMateriel({ ouvert, onFermer, materielAModifier }: Props) {
  const { mutate: creer, isPending: creation } = useCreerMateriel()
  const { mutate: modifier, isPending: modification } = useModifierMateriel()
  const [form, setForm] = useState<NouveauMateriel>(VIDE)

  useEffect(() => {
    if (materielAModifier) {
      setForm({
        titre: materielAModifier.titre,
        categorie: materielAModifier.categorie,
        quantite_totale: materielAModifier.quantite_totale,
        quantite_active: materielAModifier.quantite_active,
        quantite_reserve: materielAModifier.quantite_reserve,
        quantite_panne: materielAModifier.quantite_panne,
        localisation: materielAModifier.localisation,
        notes: materielAModifier.notes,
      })
    } else {
      setForm(VIDE)
    }
  }, [materielAModifier, ouvert])

  function set<K extends keyof NouveauMateriel>(key: K, val: NouveauMateriel[K]) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function soumettre() {
    if (!form.titre.trim()) return
    const payload = {
      ...form,
      quantite_totale: form.quantite_active + form.quantite_reserve + form.quantite_panne,
    }
    if (materielAModifier) {
      modifier({ id: materielAModifier.id, ...payload }, { onSuccess: onFermer })
    } else {
      creer(payload, { onSuccess: onFermer })
    }
  }

  const enCours = creation || modification
  const inputCls = 'w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-400'

  return (
    <Dialog open={ouvert} onOpenChange={o => !o && onFermer()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{materielAModifier ? 'Modifier l\'équipement' : 'Nouvel équipement'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <input autoFocus value={form.titre} onChange={e => set('titre', e.target.value)}
                placeholder="Nom de l'équipement *" className={inputCls} />
            </div>
            <select value={form.categorie} onChange={e => set('categorie', e.target.value)} className={inputCls}>
              {CATEGORIES_MATERIEL.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input value={form.localisation ?? ''} onChange={e => set('localisation', e.target.value || null)}
              placeholder="Localisation" className={inputCls} />
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Quantités</p>
            <div className="grid grid-cols-3 gap-3">
              {([
                { key: 'quantite_active' as const, label: 'Actifs', color: 'text-emerald-600 dark:text-emerald-400' },
                { key: 'quantite_reserve' as const, label: 'Réserve', color: 'text-blue-600 dark:text-blue-400' },
                { key: 'quantite_panne' as const, label: 'En panne', color: 'text-red-600 dark:text-red-400' },
              ]).map(({ key, label, color }) => (
                <div key={key} className="text-center">
                  <label className={`text-[11px] font-medium block mb-1 ${color}`}>{label}</label>
                  <input type="number" min={0} value={form[key]}
                    onChange={e => set(key, Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-sm text-center border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 text-center mt-2">
              Total : {form.quantite_active + form.quantite_reserve + form.quantite_panne} unité(s)
            </p>
          </div>

          <textarea value={form.notes ?? ''} onChange={e => set('notes', e.target.value || null)}
            placeholder="Notes (optionnel)" rows={2} className={inputCls} />
        </div>

        <div className="flex gap-3 pt-1">
          <Button variant="outline" onClick={onFermer} className="flex-1" disabled={enCours}>Annuler</Button>
          <Button onClick={soumettre} className="flex-1" disabled={!form.titre.trim() || enCours}>
            {enCours ? 'Enregistrement…' : materielAModifier ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
