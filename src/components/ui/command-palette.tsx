'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, X,
  ListTodo, Users, Link2, FileText, Package, Monitor, FolderKanban, CalendarDays, FolderOpen, Wallet
} from 'lucide-react'
import { useTaches } from '@/hooks/use-taches'
import { useContacts } from '@/hooks/use-contacts'
import { useLiens } from '@/hooks/use-liens'
import { useDocuments } from '@/hooks/use-documents'
import { useDevis } from '@/hooks/use-devis'
import { useMateriel } from '@/hooks/use-materiel'
import { useConnexions } from '@/hooks/use-connexions'
import { useProjets } from '@/hooks/use-projets'
import { useReunions } from '@/hooks/use-reunions'
import { useCharges } from '@/hooks/use-charges'

type TypeResultat = 'tache' | 'contact' | 'lien' | 'document' | 'devis' | 'materiel' | 'connexion' | 'projet' | 'reunion' | 'charge'

interface Resultat {
  id: string
  type: TypeResultat
  titre: string
  sousTitre?: string
  href: string
  urlExterne?: string
}

const CONFIG_TYPES: Record<TypeResultat, { label: string; icone: React.ReactNode; couleur: string }> = {
  tache:     { label: 'Tâche',      icone: <ListTodo className="w-3.5 h-3.5" />,     couleur: 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400' },
  contact:   { label: 'Contact',    icone: <Users className="w-3.5 h-3.5" />,        couleur: 'bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400' },
  lien:      { label: 'Lien',       icone: <Link2 className="w-3.5 h-3.5" />,        couleur: 'bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400' },
  document:  { label: 'Document',   icone: <FolderOpen className="w-3.5 h-3.5" />,   couleur: 'bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400' },
  devis:     { label: 'Devis',      icone: <FileText className="w-3.5 h-3.5" />,     couleur: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' },
  materiel:  { label: 'Matériel',   icone: <Package className="w-3.5 h-3.5" />,      couleur: 'bg-teal-100 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400' },
  connexion: { label: 'Connexion',  icone: <Monitor className="w-3.5 h-3.5" />,      couleur: 'bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400' },
  projet:    { label: 'Projet',     icone: <FolderKanban className="w-3.5 h-3.5" />, couleur: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400' },
  reunion:   { label: 'Réunion',    icone: <CalendarDays className="w-3.5 h-3.5" />, couleur: 'bg-pink-100 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400' },
  charge:    { label: 'Charge',     icone: <Wallet className="w-3.5 h-3.5" />,       couleur: 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400' },
}

interface Props {
  ouvert: boolean
  onFermer: () => void
}

export function CommandPalette({ ouvert, onFermer }: Props) {
  const router = useRouter()
  const [recherche, setRecherche] = useState('')
  const [indexActif, setIndexActif] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: taches = [] } = useTaches()
  const { data: contacts = [] } = useContacts()
  const { data: liens = [] } = useLiens()
  const { data: documents = [] } = useDocuments()
  const { data: devis = [] } = useDevis()
  const { data: materiel = [] } = useMateriel()
  const { data: connexions = [] } = useConnexions()
  const { data: projets = [] } = useProjets()
  const { data: reunions = [] } = useReunions()
  const { data: charges = [] } = useCharges()

  const q = recherche.toLowerCase().trim()

  const resultats: Resultat[] = q.length < 2 ? [] : [
    ...taches
      .filter(t => t.titre.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))
      .slice(0, 4)
      .map(t => ({ id: t.id, type: 'tache' as const, titre: t.titre, sousTitre: t.priorite, href: '/taches' })),
    ...contacts
      .filter(c => c.nom.toLowerCase().includes(q) || c.poste?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q))
      .slice(0, 3)
      .map(c => ({ id: c.id, type: 'contact' as const, titre: c.nom, sousTitre: c.poste ?? c.telephone ?? undefined, href: '/contacts' })),
    ...liens
      .filter(l => l.titre.toLowerCase().includes(q) || l.url.toLowerCase().includes(q))
      .slice(0, 3)
      .map(l => ({ id: l.id, type: 'lien' as const, titre: l.titre, sousTitre: l.categorie, href: '/liens', urlExterne: l.url })),
    ...documents
      .filter(d => d.titre.toLowerCase().includes(q))
      .slice(0, 3)
      .map(d => ({ id: d.id, type: 'document' as const, titre: d.titre, sousTitre: d.type, href: '/documents', urlExterne: d.url })),
    ...devis
      .filter(d => d.titre.toLowerCase().includes(q) || d.entreprise?.toLowerCase().includes(q))
      .slice(0, 3)
      .map(d => ({ id: d.id, type: 'devis' as const, titre: d.titre, sousTitre: d.entreprise ?? undefined, href: '/devis' })),
    ...materiel
      .filter(m => m.titre.toLowerCase().includes(q) || m.fournisseur?.toLowerCase().includes(q))
      .slice(0, 3)
      .map(m => ({ id: m.id, type: 'materiel' as const, titre: m.titre, sousTitre: m.fournisseur ?? undefined, href: '/materiel' })),
    ...connexions
      .filter(c => c.nom.toLowerCase().includes(q) || c.ip.includes(q))
      .slice(0, 3)
      .map(c => ({ id: c.id, type: 'connexion' as const, titre: c.nom, sousTitre: c.ip, href: '/connexions' })),
    ...projets
      .filter(p => p.titre.toLowerCase().includes(q))
      .slice(0, 3)
      .map(p => ({ id: p.id, type: 'projet' as const, titre: p.titre, sousTitre: p.statut === 'en_cours' ? 'En cours' : 'Achevé', href: '/projets' })),
    ...reunions
      .filter(r => r.titre.toLowerCase().includes(q) || r.lieu?.toLowerCase().includes(q))
      .slice(0, 3)
      .map(r => ({ id: r.id, type: 'reunion' as const, titre: r.titre, sousTitre: r.lieu ?? undefined, href: '/reunions' })),
    ...charges
      .filter(c => c.titre.toLowerCase().includes(q))
      .slice(0, 3)
      .map(c => ({ id: c.id, type: 'charge' as const, titre: c.titre, sousTitre: `${c.montant} DT`, href: '/charges' })),
  ]

  const naviguer = useCallback((r: Resultat) => {
    if (r.urlExterne) {
      window.open(r.urlExterne, '_blank', 'noopener,noreferrer')
    } else {
      router.push(r.href)
    }
    onFermer()
  }, [router, onFermer])

  useEffect(() => {
    setIndexActif(0)
  }, [recherche])

  useEffect(() => {
    if (ouvert) {
      setRecherche('')
      setIndexActif(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [ouvert])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (!ouvert) return
      if (e.key === 'Escape') { onFermer(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setIndexActif(i => Math.min(i + 1, resultats.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setIndexActif(i => Math.max(i - 1, 0)) }
      if (e.key === 'Enter' && resultats[indexActif]) { naviguer(resultats[indexActif]) }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [ouvert, resultats, indexActif, naviguer, onFermer])

  return (
    <AnimatePresence>
      {ouvert && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={onFermer}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                value={recherche}
                onChange={e => setRecherche(e.target.value)}
                placeholder="Rechercher une tâche, contact, document…"
                className="flex-1 text-sm bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
              />
              <button onClick={onFermer} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto">
              {q.length < 2 ? (
                <p className="text-xs text-gray-400 dark:text-gray-600 px-4 py-4">Tape au moins 2 caractères…</p>
              ) : resultats.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-600 px-4 py-4">Aucun résultat pour <strong>"{recherche}"</strong></p>
              ) : (
                <div className="py-2">
                  {resultats.map((r, i) => {
                    const cfg = CONFIG_TYPES[r.type]
                    return (
                      <button
                        key={`${r.type}-${r.id}`}
                        onClick={() => naviguer(r)}
                        onMouseEnter={() => setIndexActif(i)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          i === indexActif ? 'bg-blue-50 dark:bg-blue-950/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                        }`}
                      >
                        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${cfg.couleur}`}>
                          {cfg.icone}{cfg.label}
                        </span>
                        <span className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.titre}</p>
                          {r.sousTitre && <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{r.sousTitre}</p>}
                        </span>
                        {r.urlExterne && <span className="text-xs text-gray-300 dark:text-gray-600 shrink-0">↗</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <span className="text-xs text-gray-400">↑↓ Naviguer</span>
              <span className="text-xs text-gray-400">↵ Ouvrir</span>
              <span className="text-xs text-gray-400">Échap Fermer</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
