'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRequireAuth } from '@/hooks/use-auth'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { useLignesMobiles, useModifierLigne, useSupprimerLigne } from '@/hooks/use-lignes-mobiles'
import { ImportExcel } from '@/components/lignes-mobiles/import-excel'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Smartphone, Upload, Pencil, Trash2, Phone, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { LigneMobile, StatutLigne, NouvelleLigneMobile } from '@/types'
import { cn } from '@/lib/utils'

const STATUT_CFG: Record<StatutLigne, { label: string; cls: string; dot: string }> = {
  active:      { label: 'Active',      cls: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400', dot: 'bg-emerald-400' },
  suspendue:   { label: 'Suspendue',   cls: 'bg-orange-100 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400',    dot: 'bg-orange-400' },
  resiliee:    { label: 'Résiliée',    cls: 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400',               dot: 'bg-red-400' },
  en_attente:  { label: 'En attente',  cls: 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',           dot: 'bg-blue-400' },
}

const STATUTS: StatutLigne[] = ['active', 'suspendue', 'resiliee', 'en_attente']

function FormulaireModal({ ligne, onFermer }: { ligne: LigneMobile | null; onFermer: () => void }) {
  const { mutate: modifier, isPending } = useModifierLigne()
  const [form, setForm] = useState<Partial<NouvelleLigneMobile>>({
    numero: ligne?.numero ?? '',
    type_forfait: ligne?.type_forfait ?? '',
    titulaire: ligne?.titulaire ?? '',
    statut: ligne?.statut ?? 'active',
    notes: ligne?.notes ?? '',
  })

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function soumettre() {
    if (!ligne || !form.numero?.trim()) return
    modifier({ id: ligne.id, ...form, type_forfait: form.type_forfait || null, titulaire: form.titulaire || null, notes: form.notes || null }, { onSuccess: onFermer })
  }

  const cls = 'w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-400'

  return (
    <Dialog open onOpenChange={o => !o && onFermer()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Modifier la ligne</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <input value={form.numero ?? ''} onChange={e => set('numero', e.target.value)} placeholder="Numéro *" className={`${cls} font-mono`} autoFocus />
          <input value={form.type_forfait ?? ''} onChange={e => set('type_forfait', e.target.value)} placeholder="Type de forfait" className={cls} />
          <input value={form.titulaire ?? ''} onChange={e => set('titulaire', e.target.value)} placeholder="Titulaire / Utilisateur" className={cls} />
          <select value={form.statut} onChange={e => set('statut', e.target.value as StatutLigne)} className={cls}>
            {STATUTS.map(s => <option key={s} value={s}>{STATUT_CFG[s].label}</option>)}
          </select>
          <textarea value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} placeholder="Notes" rows={2} className={cls} />
        </div>
        <div className="flex gap-3 pt-1">
          <Button variant="outline" onClick={onFermer} className="flex-1">Annuler</Button>
          <Button onClick={soumettre} disabled={!form.numero?.trim() || isPending} className="flex-1">
            {isPending ? 'Enregistrement…' : 'Modifier'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

type Filtre = 'tout' | StatutLigne

export default function PageLignesMobiles() {
  useRequireAuth()
  const { data: lignes = [], isLoading } = useLignesMobiles()
  const { mutate: supprimer } = useSupprimerLigne()
  const [importOuvert, setImportOuvert] = useState(false)
  const [ligneAModifier, setLigneAModifier] = useState<LigneMobile | null>(null)
  const [filtre, setFiltre] = useState<Filtre>('tout')
  const [recherche, setRecherche] = useState('')

  const lignesFiltrees = lignes.filter(l => {
    const okFiltre = filtre === 'tout' || l.statut === filtre
    const q = recherche.toLowerCase()
    const okRecherche = !q || l.numero.includes(q) || l.titulaire?.toLowerCase().includes(q) || l.type_forfait?.toLowerCase().includes(q)
    return okFiltre && okRecherche
  })

  const stats = {
    total: lignes.length,
    active: lignes.filter(l => l.statut === 'active').length,
    suspendue: lignes.filter(l => l.statut === 'suspendue').length,
    resiliee: lignes.filter(l => l.statut === 'resiliee').length,
  }

  // Forfaits uniques
  const parForfait = lignes.reduce<Record<string, number>>((acc, l) => {
    const f = l.type_forfait || 'Non défini'
    acc[f] = (acc[f] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header titre="Flotte mobile & lignes" />
        <main className="flex-1 p-6 pb-24 md:pb-6">
          <div className="max-w-4xl mx-auto space-y-5">

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total', val: stats.total, bg: 'bg-white dark:bg-gray-900', txt: 'text-gray-900 dark:text-white' },
                { label: 'Actives', val: stats.active, bg: 'bg-emerald-50 dark:bg-emerald-950/20', txt: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Suspendues', val: stats.suspendue, bg: 'bg-orange-50 dark:bg-orange-950/20', txt: 'text-orange-600 dark:text-orange-400' },
                { label: 'Résiliées', val: stats.resiliee, bg: 'bg-red-50 dark:bg-red-950/20', txt: 'text-red-600 dark:text-red-400' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} border border-gray-100 dark:border-gray-800 rounded-2xl p-4`}>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.txt}`}>{s.val}</p>
                </div>
              ))}
            </div>

            {/* Répartition forfaits */}
            {Object.keys(parForfait).length > 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">Répartition par forfait</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(parForfait)
                    .sort((a, b) => b[1] - a[1])
                    .map(([forfait, count]) => (
                      <span key={forfait} className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-100 dark:border-indigo-900">
                        {forfait}
                        <span className="font-bold text-indigo-500">{count}</span>
                      </span>
                    ))
                  }
                </div>
              </div>
            )}

            {/* Barre actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Rechercher numéro, titulaire, forfait…" value={recherche} onChange={e => setRecherche(e.target.value)} className="pl-9" />
                {recherche && (
                  <button onClick={() => setRecherche('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}
              </div>
              <Button onClick={() => setImportOuvert(true)} variant="outline" size="sm" className="gap-1.5 shrink-0">
                <Upload className="w-4 h-4" /> Importer Excel
              </Button>
            </div>

            {/* Filtres statut */}
            <div className="flex items-center gap-2 flex-wrap">
              {(['tout', ...STATUTS] as Filtre[]).map(f => {
                const count = f === 'tout' ? lignes.length : lignes.filter(l => l.statut === f).length
                return (
                  <button key={f} onClick={() => setFiltre(f)}
                    className={cn('text-xs px-3 py-1.5 rounded-full font-medium transition-all border',
                      filtre === f
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-300'
                    )}>
                    {f === 'tout' ? 'Tout' : STATUT_CFG[f as StatutLigne].label}
                    {count > 0 && <span className="opacity-60 ml-1">({count})</span>}
                  </button>
                )
              })}
            </div>

            {/* Liste */}
            {isLoading ? (
              <div className="space-y-2">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 bg-white dark:bg-gray-900 rounded-xl animate-pulse border border-gray-100 dark:border-gray-800" />)}</div>
            ) : lignesFiltrees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Smartphone className="w-12 h-12 text-gray-200 dark:text-gray-800" />
                <p className="text-gray-400 dark:text-gray-600 text-sm">
                  {recherche || filtre !== 'tout' ? 'Aucune ligne trouvée' : 'Aucune ligne enregistrée'}
                </p>
                {!recherche && filtre === 'tout' && (
                  <Button onClick={() => setImportOuvert(true)} variant="outline" size="sm" className="gap-1.5">
                    <Upload className="w-4 h-4" /> Importer depuis Excel
                  </Button>
                )}
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
                  {/* En-tête tableau */}
                  <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-800">
                    <span className="w-2" />
                    <span>Numéro</span>
                    <span>Forfait / Titulaire</span>
                    <span>Statut</span>
                    <span />
                  </div>
                  <div className="divide-y divide-gray-50 dark:divide-gray-800">
                    {lignesFiltrees.map(ligne => {
                      const cfg = STATUT_CFG[ligne.statut]
                      return (
                        <motion.div
                          key={ligne.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-3 items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 group transition-colors"
                        >
                          <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                          <p className="text-sm font-mono font-semibold text-gray-900 dark:text-white truncate">
                            {ligne.numero}
                          </p>
                          <div className="min-w-0">
                            {ligne.type_forfait && <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{ligne.type_forfait}</p>}
                            {ligne.titulaire && <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{ligne.titulaire}</p>}
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.cls}`}>{cfg.label}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <a href={`tel:${ligne.numero}`}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors">
                              <Phone className="w-3 h-3" />
                            </a>
                            <button onClick={() => setLigneAModifier(ligne)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button onClick={() => supprimer(ligne.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>
      <BottomNav />

      <AnimatePresence>
        {importOuvert && <ImportExcel key="import" onFermer={() => setImportOuvert(false)} />}
      </AnimatePresence>

      {ligneAModifier && <FormulaireModal ligne={ligneAModifier} onFermer={() => setLigneAModifier(null)} />}
    </div>
  )
}
