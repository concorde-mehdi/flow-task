'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRequireAuth } from '@/hooks/use-auth'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { useSitesMonitores, useSupprimerSite, useCreerSite, useModifierSite, useVerifierTousSites, verifierSite } from '@/hooks/use-sites-monitores'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Activity, Trash2, RefreshCw, ExternalLink, CheckCircle, XCircle, HelpCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { SiteMonitore, StatutSite } from '@/types'
import { cn } from '@/lib/utils'

function badgeStatut(statut: StatutSite) {
  if (statut === 'en_ligne') return { label: 'En ligne', cls: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400', icone: <CheckCircle className="w-3 h-3" /> }
  if (statut === 'hors_ligne') return { label: 'Hors ligne', cls: 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400', icone: <XCircle className="w-3 h-3" /> }
  return { label: 'Inconnu', cls: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400', icone: <HelpCircle className="w-3 h-3" /> }
}

function FormulaireAjoutSite({ onFermer }: { onFermer: () => void }) {
  const { mutate: creer, isPending } = useCreerSite()
  const [titre, setTitre] = useState('')
  const [url, setUrl] = useState('https://')
  const [notes, setNotes] = useState('')

  function soumettre(e: React.FormEvent) {
    e.preventDefault()
    if (!titre.trim() || !url.trim()) return
    creer({
      titre: titre.trim(),
      url: url.trim(),
      statut: 'inconnu',
      derniere_verification: null,
      notes: notes.trim() || null,
    }, { onSuccess: onFermer })
  }

  const cls = 'w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-400'

  return (
    <motion.form
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      onSubmit={soumettre}
      className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-900 rounded-2xl p-4 space-y-3"
    >
      <p className="text-sm font-bold text-gray-900 dark:text-white">Nouveau site</p>
      <div className="grid grid-cols-2 gap-3">
        <input value={titre} onChange={e => setTitre(e.target.value)} placeholder="Nom *" className={cls} autoFocus />
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL *" className={cls} type="url" />
      </div>
      <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optionnel)" className={cls} />
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onFermer} className="flex-1" size="sm">Annuler</Button>
        <Button type="submit" disabled={!titre.trim() || !url.trim() || isPending} className="flex-1" size="sm">
          {isPending ? 'Ajout…' : 'Ajouter'}
        </Button>
      </div>
    </motion.form>
  )
}

export default function PageMonitoring() {
  useRequireAuth()
  const { data: sites = [], isLoading } = useSitesMonitores()
  const { mutate: supprimer } = useSupprimerSite()
  const { mutate: modifierSite } = useModifierSite()
  const { mutate: verifierTous, isPending: verifEnCours } = useVerifierTousSites()
  const [ajoutOuvert, setAjoutOuvert] = useState(false)
  const [verifIds, setVerifIds] = useState<Set<string>>(new Set())

  const enLigne = sites.filter(s => s.statut === 'en_ligne').length
  const horsLigne = sites.filter(s => s.statut === 'hors_ligne').length

  async function verifierUnSite(site: SiteMonitore) {
    setVerifIds(prev => new Set(prev).add(site.id))
    try {
      const result = await verifierSite(site.id, site.url)
      const statut: StatutSite = result.up ? 'en_ligne' : 'hors_ligne'
      modifierSite({ id: site.id, statut, derniere_verification: new Date().toISOString() })
      toast.success(`${site.titre} : ${result.up ? '✅ En ligne' : '❌ Hors ligne'} (${result.ms}ms)`)
    } catch {
      toast.error(`Erreur vérification ${site.titre}`)
    } finally {
      setVerifIds(prev => { const n = new Set(prev); n.delete(site.id); return n })
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header titre="Monitoring sites web" />
        <main className="flex-1 p-6 pb-24 md:pb-6">
          <div className="max-w-3xl mx-auto space-y-5">

            {/* Stats */}
            {sites.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'En ligne', val: enLigne, bg: 'bg-emerald-50 dark:bg-emerald-950/20', txt: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'Hors ligne', val: horsLigne, bg: 'bg-red-50 dark:bg-red-950/20', txt: 'text-red-600 dark:text-red-400' },
                  { label: 'Total', val: sites.length, bg: 'bg-white dark:bg-gray-900', txt: 'text-gray-900 dark:text-white' },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} border border-gray-100 dark:border-gray-800 rounded-2xl p-4`}>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{s.label}</p>
                    <p className={`text-2xl font-bold ${s.txt}`}>{s.val}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              <Button onClick={() => verifierTous(sites)} disabled={verifEnCours || sites.length === 0} variant="outline" size="sm" className="gap-1.5">
                {verifEnCours ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Vérifier tout
              </Button>
              <Button onClick={() => setAjoutOuvert(v => !v)} size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" /> Ajouter un site
              </Button>
            </div>

            <AnimatePresence>
              {ajoutOuvert && <FormulaireAjoutSite key="form" onFermer={() => setAjoutOuvert(false)} />}
            </AnimatePresence>

            {isLoading ? (
              <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl animate-pulse" />)}</div>
            ) : sites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Activity className="w-12 h-12 text-gray-200 dark:text-gray-800" />
                <p className="text-gray-400 dark:text-gray-600 text-sm">Aucun site surveillé</p>
                <Button onClick={() => setAjoutOuvert(true)} variant="outline" size="sm" className="gap-1.5">
                  <Plus className="w-4 h-4" /> Ajouter le premier site
                </Button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="space-y-2">
                  {sites.map(site => {
                    const badge = badgeStatut(site.statut)
                    const enVerif = verifIds.has(site.id)
                    return (
                      <motion.div
                        key={site.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-4 group"
                      >
                        <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', site.statut === 'en_ligne' ? 'bg-emerald-400 shadow-emerald-400/50 shadow-sm' : site.statut === 'hors_ligne' ? 'bg-red-400' : 'bg-gray-300 dark:bg-gray-600')} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{site.titre}</p>
                            <span className={cn('flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium', badge.cls)}>
                              {badge.icone}{badge.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <a href={site.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline truncate max-w-[220px] flex items-center gap-0.5">
                              {site.url} <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            </a>
                            {site.derniere_verification && (
                              <span className="text-[10px] text-gray-400">
                                vérifié {new Date(site.derniere_verification).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => verifierUnSite(site)} disabled={enVerif}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                            {enVerif ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => supprimer(site.id)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
