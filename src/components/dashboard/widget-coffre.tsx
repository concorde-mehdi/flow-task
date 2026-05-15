'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Unlock, Eye, EyeOff, Plus, Trash2, Copy, ExternalLink, KeyRound, Shield, X } from 'lucide-react'
import { toast } from 'sonner'
import { useCoffre, useAjouterMdp, useSupprimerMdp, dechiffrerMdp, getPinSentinel, setPinSentinel, verifierPinCoffre } from '@/hooks/use-coffre'
import type { CoffreMdp, NouveauCoffreMdp, CategorieCoffre } from '@/types'
import { cn } from '@/lib/utils'

const CATEGORIES: CategorieCoffre[] = ['Général', 'Réseau', 'Serveurs', 'Applications', 'Email', 'Fournisseurs', 'Personnel']
const AUTO_LOCK_MS = 5 * 60 * 1000

/* ─── Couleurs catégories ─── */
const CAT_COLOR: Record<string, string> = {
  'Réseau': 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
  'Serveurs': 'bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400',
  'Applications': 'bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
  'Email': 'bg-pink-100 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400',
  'Fournisseurs': 'bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400',
  'Personnel': 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
  'Général': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

/* ─── Écran PIN ─── */
function EcranPin({
  mode,
  onValider,
  onAnnuler,
}: {
  mode: 'creer' | 'deverrouiller'
  onValider: (pin: string) => void
  onAnnuler?: () => void
}) {
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [erreur, setErreur] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  function soumettre(e: React.FormEvent) {
    e.preventDefault()
    if (pin.length < 4) { setErreur('PIN minimum 4 chiffres'); return }
    if (mode === 'creer' && pin !== confirm) { setErreur('Les PIN ne correspondent pas'); return }
    onValider(pin)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-5 py-6 px-4"
    >
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
        <Shield className="w-7 h-7 text-indigo-500" />
      </div>

      <div className="text-center">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          {mode === 'creer' ? 'Créer un code secret' : 'Code secret'}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {mode === 'creer'
            ? 'Ce PIN protège vos mots de passe — choisissez-le bien'
            : 'Entrez votre PIN pour accéder au coffre'}
        </p>
      </div>

      <form onSubmit={soumettre} className="w-full max-w-[220px] space-y-3">
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          maxLength={8}
          value={pin}
          onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setErreur('') }}
          placeholder="••••"
          className="w-full text-center text-xl tracking-[0.4em] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-indigo-400"
        />
        {mode === 'creer' && (
          <input
            type="password"
            inputMode="numeric"
            maxLength={8}
            value={confirm}
            onChange={e => { setConfirm(e.target.value.replace(/\D/g, '')); setErreur('') }}
            placeholder="Confirmer ••••"
            className="w-full text-center text-xl tracking-[0.4em] border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-indigo-400"
          />
        )}

        {erreur && <p className="text-xs text-red-500 text-center">{erreur}</p>}

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-colors"
        >
          {mode === 'creer' ? 'Créer le coffre' : 'Déverrouiller'}
        </button>

        {onAnnuler && (
          <button type="button" onClick={onAnnuler} className="w-full text-xs text-gray-400 hover:text-gray-600 py-1">
            Annuler
          </button>
        )}
      </form>
    </motion.div>
  )
}

/* ─── Carte entrée ─── */
function CarteEntree({ entry, pin, onSupprimer }: { entry: CoffreMdp; pin: string; onSupprimer: (id: string) => void }) {
  const [mdpVisible, setMdpVisible] = useState(false)
  const [mdpClair, setMdpClair] = useState<string | null>(null)
  const [chargement, setChargement] = useState(false)

  async function afficherMdp() {
    if (mdpClair !== null) { setMdpVisible(v => !v); return }
    setChargement(true)
    try {
      const clair = await dechiffrerMdp(entry, pin)
      setMdpClair(clair)
      setMdpVisible(true)
    } catch {
      toast.error('Erreur déchiffrement')
    } finally {
      setChargement(false)
    }
  }

  async function copierMdp() {
    const clair = mdpClair ?? await dechiffrerMdp(entry, pin)
    if (!mdpClair) setMdpClair(clair)
    await navigator.clipboard.writeText(clair)
    toast.success('Mot de passe copié !')
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 group"
    >
      {/* Icône catégorie */}
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-[10px] font-bold', CAT_COLOR[entry.categorie])}>
        {entry.categorie.slice(0, 3).toUpperCase()}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{entry.titre}</p>
          {entry.url && (
            <a href={entry.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-gray-400 hover:text-indigo-500">
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        {entry.identifiant && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{entry.identifiant}</p>
        )}
        <p className="text-xs font-mono text-gray-600 dark:text-gray-400 mt-0.5 tracking-wider">
          {mdpVisible && mdpClair ? mdpClair : '••••••••'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={afficherMdp}
          disabled={chargement}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
        >
          {mdpVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={copierMdp}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/40 transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onSupprimer(entry.id)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  )
}

/* ─── Formulaire ajout ─── */
function FormulaireAjout({ pin, onFermer }: { pin: string; onFermer: () => void }) {
  const { mutateAsync: ajouter } = useAjouterMdp()
  const [form, setForm] = useState<NouveauCoffreMdp>({
    titre: '',
    identifiant: '',
    mdp_clair: '',
    url: '',
    categorie: 'Général',
    notes: '',
  })
  const [mdpVisible, setMdpVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  async function soumettre(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titre || !form.mdp_clair) { toast.error('Titre et mot de passe requis'); return }
    setLoading(true)
    try {
      await ajouter({ entry: form, pin })
      toast.success('Entrée ajoutée au coffre !')
      onFermer()
    } catch {
      toast.error('Erreur lors de l\'ajout')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-gray-400'

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <form onSubmit={soumettre} className="border border-indigo-200 dark:border-indigo-900 rounded-xl p-4 space-y-3 bg-indigo-50/30 dark:bg-indigo-950/10">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Nouvelle entrée</p>
          <button type="button" onClick={onFermer} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input
            value={form.titre}
            onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
            placeholder="Titre *"
            className={inputCls}
          />
          <select
            value={form.categorie}
            onChange={e => setForm(f => ({ ...f, categorie: e.target.value as CategorieCoffre }))}
            className={inputCls}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <input
          value={form.identifiant ?? ''}
          onChange={e => setForm(f => ({ ...f, identifiant: e.target.value || null }))}
          placeholder="Identifiant / email"
          className={inputCls}
        />

        <div className="relative">
          <input
            type={mdpVisible ? 'text' : 'password'}
            value={form.mdp_clair}
            onChange={e => setForm(f => ({ ...f, mdp_clair: e.target.value }))}
            placeholder="Mot de passe *"
            className={cn(inputCls, 'pr-9')}
          />
          <button
            type="button"
            onClick={() => setMdpVisible(v => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {mdpVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        <input
          value={form.url ?? ''}
          onChange={e => setForm(f => ({ ...f, url: e.target.value || null }))}
          placeholder="URL (optionnel)"
          className={inputCls}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white text-xs font-semibold transition-colors"
        >
          {loading ? 'Chiffrement…' : 'Enregistrer'}
        </button>
      </form>
    </motion.div>
  )
}

/* ─── Widget principal ─── */
export function WidgetCoffre() {
  const [phase, setPhase] = useState<'loading' | 'pin_creer' | 'verrouille' | 'ouvert'>('loading')
  const [pin, setPin] = useState('')
  const [ajoutOuvert, setAjoutOuvert] = useState(false)
  const [filtre, setFiltre] = useState<CategorieCoffre | 'Tous'>('Tous')
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: entrees = [] } = useCoffre()
  const { mutateAsync: supprimer } = useSupprimerMdp()

  // Détecter si un PIN existe déjà
  useEffect(() => {
    getPinSentinel().then(sentinel => {
      setPhase(sentinel ? 'verrouille' : 'pin_creer')
    })
  }, [])

  // Auto-lock
  const resetTimer = useCallback(() => {
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current)
    lockTimerRef.current = setTimeout(() => {
      setPhase('verrouille')
      setPin('')
      setAjoutOuvert(false)
    }, AUTO_LOCK_MS)
  }, [])

  useEffect(() => {
    if (phase === 'ouvert') {
      resetTimer()
      const handler = () => resetTimer()
      window.addEventListener('mousemove', handler)
      window.addEventListener('keydown', handler)
      return () => {
        window.removeEventListener('mousemove', handler)
        window.removeEventListener('keydown', handler)
        if (lockTimerRef.current) clearTimeout(lockTimerRef.current)
      }
    }
  }, [phase, resetTimer])

  async function creerPin(nouveauPin: string) {
    try {
      await setPinSentinel(nouveauPin)
      setPin(nouveauPin)
      setPhase('ouvert')
      toast.success('Coffre créé — gardez ce PIN précieusement !')
    } catch {
      toast.error('Erreur création du coffre')
    }
  }

  async function deverrouiller(pinSaisi: string) {
    const ok = await verifierPinCoffre(pinSaisi)
    if (ok) {
      setPin(pinSaisi)
      setPhase('ouvert')
      resetTimer()
    } else {
      toast.error('PIN incorrect')
    }
  }

  async function onSupprimer(id: string) {
    await supprimer(id)
    toast.success('Entrée supprimée')
  }

  const entresFiltrees = filtre === 'Tous' ? entrees : entrees.filter(e => e.categorie === filtre)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
            <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Coffre — Mots de passe</h2>
          {phase === 'ouvert' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400 font-medium">
              {entrees.length} entrée{entrees.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {phase === 'ouvert' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAjoutOuvert(v => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 px-3 py-1.5 rounded-xl transition-colors"
            >
              <Plus className="w-3 h-3" />
              Ajouter
            </button>
            <button
              onClick={() => { setPhase('verrouille'); setPin(''); setAjoutOuvert(false) }}
              className="w-7 h-7 rounded-xl text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 flex items-center justify-center transition-colors"
              title="Verrouiller"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {phase === 'verrouille' && (
          <div className="flex items-center gap-1 text-xs text-amber-500">
            <Lock className="w-3.5 h-3.5" />
            <span className="font-medium">Verrouillé</span>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {phase === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-24 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}

          {phase === 'pin_creer' && (
            <motion.div key="pin_creer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EcranPin mode="creer" onValider={creerPin} />
            </motion.div>
          )}

          {phase === 'verrouille' && (
            <motion.div key="verrouille" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EcranPin mode="deverrouiller" onValider={deverrouiller} />
            </motion.div>
          )}

          {phase === 'ouvert' && (
            <motion.div key="ouvert" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {/* Formulaire ajout */}
              <AnimatePresence>
                {ajoutOuvert && (
                  <FormulaireAjout key="form" pin={pin} onFermer={() => setAjoutOuvert(false)} />
                )}
              </AnimatePresence>

              {/* Filtres catégories */}
              {entrees.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {(['Tous', ...CATEGORIES] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setFiltre(cat as CategorieCoffre | 'Tous')}
                      className={cn(
                        'text-[10px] font-medium px-2.5 py-1 rounded-full transition-colors',
                        filtre === cat
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Liste */}
              {entrees.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <Unlock className="w-8 h-8 text-gray-200 dark:text-gray-700" />
                  <p className="text-xs text-gray-400 dark:text-gray-600">Aucun mot de passe encore enregistré</p>
                  <button
                    onClick={() => setAjoutOuvert(true)}
                    className="text-xs text-indigo-500 font-medium hover:underline mt-1"
                  >
                    Ajouter le premier
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {entresFiltrees.map(entry => (
                      <CarteEntree key={entry.id} entry={entry} pin={pin} onSupprimer={onSupprimer} />
                    ))}
                  </AnimatePresence>
                  {entresFiltrees.length === 0 && (
                    <p className="text-xs text-gray-400 dark:text-gray-600 text-center py-4">Aucune entrée dans cette catégorie</p>
                  )}
                </div>
              )}

              <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center pt-1">
                Auto-verrouillage dans 5 min d&apos;inactivité
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
