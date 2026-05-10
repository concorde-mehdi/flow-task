'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Plus, Tag } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useCreerTache, useModifierTache } from '@/hooks/use-taches'
import { couleurAleatoire } from '@/lib/utils'
import type { Tache, NouvellesTache, TagTache } from '@/types'

interface FormulaireProps {
  ouvert: boolean
  onFermer: () => void
  tacheAModifier?: Tache | null
}

const COULEURS_TAGS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export function FormulairesTache({ ouvert, onFermer, tacheAModifier }: FormulaireProps) {
  const { mutate: creer, isPending: creation } = useCreerTache()
  const { mutate: modifier, isPending: modification } = useModifierTache()
  const enCours = creation || modification

  const [titre, setTitre] = useState(tacheAModifier?.titre ?? '')
  const [description, setDescription] = useState(tacheAModifier?.description ?? '')
  const [deadline, setDeadline] = useState(
    tacheAModifier?.deadline ? new Date(tacheAModifier.deadline).toISOString().slice(0, 16) : ''
  )
  const [priorite, setPriorite] = useState<'Basse' | 'Moyenne' | 'Haute'>(tacheAModifier?.priorite ?? 'Moyenne')
  const [isQuotidienne, setIsQuotidienne] = useState(tacheAModifier?.is_quotidienne ?? false)
  const [tags, setTags] = useState<TagTache[]>(tacheAModifier?.tags ?? [])
  const [nouveauTag, setNouveauTag] = useState('')
  const [couleurTag, setCouleurTag] = useState(COULEURS_TAGS[0])

  function ajouterTag() {
    if (!nouveauTag.trim() || tags.some(t => t.nom === nouveauTag.trim())) return
    setTags(prev => [...prev, { nom: nouveauTag.trim(), couleur: couleurTag }])
    setNouveauTag('')
    setCouleurTag(couleurAleatoire())
  }

  function supprimerTag(nom: string) {
    setTags(prev => prev.filter(t => t.nom !== nom))
  }

  function soumettre(e: React.FormEvent) {
    e.preventDefault()
    if (!titre.trim()) return

    const donnees: NouvellesTache = {
      titre: titre.trim(),
      description: description.trim() || null,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      priorite,
      tags,
      statut: false,
      is_quotidienne: isQuotidienne,
    }

    if (tacheAModifier) {
      modifier({ id: tacheAModifier.id, ...donnees })
    } else {
      creer(donnees)
    }
    onFermer()
  }

  return (
    <Dialog open={ouvert} onOpenChange={onFermer}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {tacheAModifier ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={soumettre} className="space-y-4 mt-2">
          <Input
            placeholder="Titre de la tâche *"
            value={titre}
            onChange={e => setTitre(e.target.value)}
            className="text-sm"
            required
            autoFocus
          />

          <Textarea
            placeholder="Description (optionnel)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="text-sm resize-none"
            rows={3}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Priorité</label>
              <Select value={priorite} onValueChange={(v) => setPriorite(v as typeof priorite)}>
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Haute">🔴 Haute</SelectItem>
                  <SelectItem value="Moyenne">🟠 Moyenne</SelectItem>
                  <SelectItem value="Basse">🔵 Basse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Deadline</label>
              <Input
                type="datetime-local"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Étiquettes
            </label>

            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {tags.map(tag => (
                <motion.span
                  key={tag.nom}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-full text-white font-medium"
                  style={{ backgroundColor: tag.couleur }}
                >
                  {tag.nom}
                  <button type="button" onClick={() => supprimerTag(tag.nom)}>
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              ))}
            </div>

            <div className="flex gap-2">
              <div className="flex gap-1">
                {COULEURS_TAGS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCouleurTag(c)}
                    className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      borderColor: couleurTag === c ? 'white' : c,
                      boxShadow: couleurTag === c ? `0 0 0 2px ${c}` : 'none'
                    }}
                  />
                ))}
              </div>
              <Input
                placeholder="Nouveau tag..."
                value={nouveauTag}
                onChange={e => setNouveauTag(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), ajouterTag())}
                className="text-xs h-8 flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={ajouterTag} className="h-8 px-2">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Quotidienne */}
          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Tâche quotidienne</p>
              <p className="text-xs text-gray-500">Apparaît chaque jour dans votre liste</p>
            </div>
            <Switch checked={isQuotidienne} onCheckedChange={setIsQuotidienne} />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onFermer} className="flex-1">
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!titre.trim() || enCours}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
              {enCours ? 'En cours...' : tacheAModifier ? 'Mettre à jour' : 'Créer la tâche'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
