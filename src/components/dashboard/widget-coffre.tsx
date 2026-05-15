'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Unlock, Eye, EyeOff, Plus, Trash2, Copy, ExternalLink, KeyRound, X, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { useCoffre, useAjouterMdp, useSupprimerMdp, dechiffrerMdp, getPinSentinel, setPinSentinel, verifierPinCoffre } from '@/hooks/use-coffre'
import type { CoffreMdp, NouveauCoffreMdp, CategorieCoffre } from '@/types'
import { cn } from '@/lib/utils'

const CATEGORIES: CategorieCoffre[] = ['Général', 'Réseau', 'Serveurs', 'Applications', 'Email', 'Fournisseurs', 'Personnel']
const AUTO_LOCK_MS = 5 * 60 * 1000

const CAT_COLOR: Record<string, string> = {
  'Réseau': 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
  'Serveurs': 'bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400',
  'Applications': 'bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
  'Email': 'bg-pink-100 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400',
  'Fournisseurs': 'bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400',
  'Personnel': 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
  'Général': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

/* ─── Formulaire PIN compact ─── */
function FormPin({ mode, onValider, onAnnuler }: {
  mode: 'creer' | 'deverrouiller'
  onValider: (pin: string) => void
  onAnnuler: () => void
}) {
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [erreur, setErreur] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => { ref.current?.focus() }, [])

  function soumettre(e: React.FormEvent) {
    e.preventDefault()
    if (pin.length < 4) { setErreur('Min 4 chiffres'); return }
    if (mode === 'creer' && pin !== confirm) { setErreur('PIN différents'); return }
    onValider(pin)
  }

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={soumettre}
      className="overflow-hidden"
    >
      <div className="pt-3 space-y-2">
        <input
          ref={ref}
          type="password"
          inputMode="numeric"
          maxLength={8}
          value={pin}
          onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setErreur('') }}
          placeholder={mode === 'creer' ? 'Nouveau PIN (4+ chiffres)' : 'Votre PIN'}
          className="w-full text-sm text-center tracking-widest border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-indigo-400"
        />
        {mode === 'creer' && (
          <input
            type="password"
            inputMode="numeric"
            maxLength={8}
            value={confirm}
            onChange={e => { setConfirm(e.target.value.replace(/\D/g, '')); setErreur('') }}
            placeholder="Confirmer PIN"
            className="w-full text-sm text-center tracking-widest border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-indigo-400"
          />
        )}
        {erreur && <p className="text-xs text-red-500">{erreur}</p>}
        <div className="flex gap-2">
          <button type="button" onClick={onAnnuler} className="flex-1 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Annuler
          </button>
          <button type="submit" className="flex-1 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors">
            {mode === 'creer' ? 'Créer' : 'Ouvrir'}
          </button>
        </div>
      </div>
    </motion.form>
  )
}

/* ─── Carte entrée ─── */
function CarteEntree({ entry, pin, onSupprimer }: { entry: CoffreMdp; pin: string; onSupprimer: (id: string) => void }) {
  const [visible, setVisible] = useState(false)
  const [mdpClair, setMdpClair] = useState<string | null>(null)

  async function toggle() {
    if (mdpClair !== null) { setVisible(v => !v); return }
    try {
      const clair = await dechiffrerMdp(entry, pin)
      setMdpClair(clair)
      setVisible(true)
    } catch { toast.error('Erreur déchiffrement') }
  }

  async function copier() {
    const clair = mdpClair ?? await dechiffrerMdp(entry, pin)
    if (!mdpClair) setMdpClair(clair)
    await navigator.clipboard.writeText(clair)
    toast.success('Copié !')
  }

  return (
    <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 group">
      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[9px] font-bold', CAT_COLOR[entry.categorie])}>
        {entry.categorie.slice(0, 3).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{entry.titre}</p>
          {entry.url && (
            <a href={entry.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-gray-300 hover:text-indigo-400">
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
        {entry.identifiant && <p className="text-[10px] text-gray-400 truncate">{entry.identifiant}</p>}
        <p className="text-[10px] font-mono text-gray-500 dark:text-gray-400">{visible && mdpClair ? mdpClair : '••••••••'}</p>
      </div>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={toggle} className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40">
          {visible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </button>
        <button onClick={copier} className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/40">
          <Copy className="w-3 h-3" />
        </button>
        <button onClick={() => onSupprimer(entry.id)} className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

/* ─── Formulaire ajout ─── */
function FormulaireAjout({ pin, onFermer }: { pin: string; onFermer: () => void }) {
  const { mutateAsync: ajouter } = useAjouterMdp()
  const [form, setForm] = useState<NouveauCoffreMdp>({ titre: '', identifiant: '', mdp_clair: '', url: '', categorie: 'Général', notes: '' })
  const [mdpVisible, setMdpVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  async function soumettre(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titre || !form.mdp_clair) { toast.error('Titre et mot de passe requis'); return }
    setLoading(true)
    try {
      await ajouter({ entry: form, pin })
      toast.success('Entrée ajoutée !')
      onFermer()
    } catch { toast.error('Erreur lors de l\'ajout') } finally { setLoading(false) }
  }

  const cls = 'w-full text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-gray-400'

  return (
    <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={soumettre} className="overflow-hidden">
      <div className="border border-indigo-200 dark:border-indigo-900 rounded-xl p-3 space-y-2 bg-indigo-50/30 dark:bg-indigo-950/10 mb-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Nouvelle entrée</p>
          <button type="button" onClick={onFermer} className="text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <input value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} placeholder="Titre *" className={cls} autoFocus />
          <select value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value as CategorieCoffre }))} className={cls}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <input value={form.identifiant ?? ''} onChange={e => setForm(f => ({ ...f, identifiant: e.target.value || null }))} placeholder="Identifiant / email" className={cls} />
        <div className="relative">
          <input type={mdpVisible ? 'text' : 'password'} value={form.mdp_clair} onChange={e => setForm(f => ({ ...f, mdp_clair: e.target.value }))} placeholder="Mot de passe *" className={cn(cls, 'pr-7')} />
          <button type="button" onClick={() => setMdpVisible(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
            {mdpVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
        </div>
        <button type="submit" disabled={loading} className="w-full py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white text-xs font-semibold transition-colors">
          {loading ? 'Chiffrement…' : 'Enregistrer'}
        </button>
      </div>
    </motion.form>
  )
}

/* ─── Widget principal ─── */
export function WidgetCoffre() {
  const [phase, setPhase] = useState<'loading' | 'pin_creer' | 'verrouille' | 'ouvert'>('loading')
  const [pinFormOuvert, setPinFormOuvert] = useState(false)
  const [pin, setPin] = useState('')
  const [ajoutOuvert, setAjoutOuvert] = useState(false)
  const [ouvert, setOuvert] = useState(false) // collapsed par défaut sur le dashboard
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: entrees = [] } = useCoffre()
  const { mutateAsync: supprimer } = useSupprimerMdp()

  useEffect(() => {
    getPinSentinel().then(sentinel => {
      setPhase(sentinel ? 'verrouille' : 'pin_creer')
    })
  }, [])

  const resetTimer = useCallback(() => {
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current)
    lockTimerRef.current = setTimeout(() => {
      setPhase('verrouille')
      setPin('')
      setAjoutOuvert(false)
      setPinFormOuvert(false)
    }, AUTO_LOCK_MS)
  }, [])

  useEffect(() => {
    if (phase === 'ouvert') {
      resetTimer()
      const h = () => resetTimer()
      window.addEventListener('mousemove', h)
      window.addEventListener('keydown', h)
      return () => {
        window.removeEventListener('mousemove', h)
        window.removeEventListener('keydown', h)
        if (lockTimerRef.current) clearTimeout(lockTimerRef.current)
      }
    }
  }, [phase, resetTimer])

  async function creerPin(nouveauPin: string) {
    try {
      await setPinSentinel(nouveauPin)
      setPin(nouveauPin)
      setPhase('ouvert')
      setPinFormOuvert(false)
      toast.success('Coffre créé !')
    } catch { toast.error('Erreur création') }
  }

  async function deverrouiller(pinSaisi: string) {
    const ok = await verifierPinCoffre(pinSaisi)
    if (ok) {
      setPin(pinSaisi)
      setPhase('ouvert')
      setPinFormOuvert(false)
      resetTimer()
    } else {
      toast.error('PIN incorrect')
    }
  }

  async function onSupprimer(id: string) {
    await supprimer(id)
    toast.success('Supprimé')
  }

  const verrouiller = () => {
    setPhase('verrouille')
    setPin('')
    setAjoutOuvert(false)
    setPinFormOuvert(false)
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Header — toujours visible */}
      <button
        onClick={() => phase === 'ouvert' && setOuvert(v => !v)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3',
          phase === 'ouvert' && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors'
        )}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
            <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <span className="text-sm font-bold text-gray-900 dark:text-white">Coffre</span>
          {phase === 'ouvert' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400 font-medium">
              {entrees.length} entrée{entrees.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {phase === 'verrouille' && !pinFormOuvert && (
            <span className="flex items-center gap-1 text-[10px] text-amber-500 font-medium">
              <Lock className="w-3 h-3" /> Verrouillé
            </span>
          )}
          {phase === 'pin_creer' && !pinFormOuvert && (
            <span className="text-[10px] text-gray-400 font-medium">Non configuré</span>
          )}
          {phase === 'ouvert' && (
            <>
              <button
                onClick={e => { e.stopPropagation(); verrouiller() }}
                className="w-6 h-6 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 flex items-center justify-center transition-colors"
              >
                <Lock className="w-3 h-3" />
              </button>
              {ouvert ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
            </>
          )}
        </div>
      </button>

      {/* Contenu */}
      <AnimatePresence mode="wait">
        {phase === 'loading' && (
          <div className="px-4 pb-3 flex justify-center">
            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* ── État verrouillé ── */}
        {(phase === 'verrouille' || phase === 'pin_creer') && (
          <motion.div key="locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 pb-4">
            <AnimatePresence mode="wait">
              {!pinFormOuvert ? (
                <motion.div key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <button
                    onClick={() => setPinFormOuvert(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 text-indigo-500 text-xs font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    {phase === 'pin_creer' ? 'Configurer le coffre' : 'Déverrouiller'}
                  </button>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <FormPin
                    mode={phase === 'pin_creer' ? 'creer' : 'deverrouiller'}
                    onValider={phase === 'pin_creer' ? creerPin : deverrouiller}
                    onAnnuler={() => setPinFormOuvert(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Ouvert ── */}
        {phase === 'ouvert' && ouvert && (
          <motion.div
            key="ouvert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              <AnimatePresence>
                {ajoutOuvert && <FormulaireAjout key="form" pin={pin} onFermer={() => setAjoutOuvert(false)} />}
              </AnimatePresence>

              {entrees.length === 0 && !ajoutOuvert ? (
                <div className="flex flex-col items-center gap-1.5 py-4 text-center">
                  <p className="text-xs text-gray-400 dark:text-gray-600">Aucun mot de passe enregistré</p>
                  <button onClick={() => setAjoutOuvert(true)} className="text-xs text-indigo-500 font-medium hover:underline">Ajouter le premier</button>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  <AnimatePresence>
                    {entrees.map(e => <CarteEntree key={e.id} entry={e} pin={pin} onSupprimer={onSupprimer} />)}
                  </AnimatePresence>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <p className="text-[10px] text-gray-400 dark:text-gray-600">Auto-lock 5 min</p>
                <button
                  onClick={() => setAjoutOuvert(v => !v)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-indigo-500 hover:text-indigo-600"
                >
                  <Plus className="w-3 h-3" /> Ajouter
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Ouvert mais collapsed — affiche juste le résumé */}
        {phase === 'ouvert' && !ouvert && (
          <div className="px-4 pb-3">
            <p className="text-xs text-gray-400 dark:text-gray-600">
              {entrees.length === 0 ? 'Aucune entrée' : `${entrees.length} mot${entrees.length > 1 ? 's' : ''} de passe — cliquer pour afficher`}
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
