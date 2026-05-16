'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useTaches } from '@/hooks/use-taches'
import { useGmail } from '@/hooks/use-gmail'
import { useReunions } from '@/hooks/use-reunions'
import { useDocuments } from '@/hooks/use-documents'
import { useChecklistItems, useChecklistCoches, useToggleCoche } from '@/hooks/use-checklist'
import { useLicences, joursAvantExpiration } from '@/hooks/use-licences'
import { useConsommables } from '@/hooks/use-consommables'
import { useSitesMonitores } from '@/hooks/use-sites-monitores'
import { estUrgente } from '@/lib/utils'
import { isToday, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ListTodo, AlertTriangle, Mail, CalendarDays,
  Search, Circle, ArrowRight, FileText, Plus,
  CheckSquare, Square, ClipboardList, KeyRound, Lock,
  ShieldCheck, Boxes, Activity,
} from 'lucide-react'
import { VoiceButton } from '@/components/ui/voice-button'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Salutation ─── */
function salutation(prenom: string) {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return `Bonjour, ${prenom} 👋`
  if (h >= 12 && h < 18) return `Bon après-midi, ${prenom} ☀️`
  if (h >= 18 && h < 22) return `Bonsoir, ${prenom} 🌆`
  return `Bonne nuit, ${prenom} 🌙`
}

/* ─── Sparkline SVG inline ─── */
function Sparkline({ donnees, couleur }: { donnees: number[]; couleur: string }) {
  if (donnees.length < 2) return null
  const max = Math.max(...donnees, 1)
  const W = 60, H = 22
  const pts = donnees.map((v, i) => {
    const x = (i / (donnees.length - 1)) * W
    const y = H - Math.round((v / max) * H)
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={W} height={H} className="opacity-80">
      <polyline fill="none" stroke={couleur} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  )
}

/* ─── Couleurs agenda ─── */
const AGD_COLORS = [
  { bg: 'bg-blue-50 dark:bg-blue-950/30', dot: 'bg-blue-500' },
  { bg: 'bg-pink-50 dark:bg-pink-950/30', dot: 'bg-pink-500' },
  { bg: 'bg-green-50 dark:bg-green-950/30', dot: 'bg-green-500' },
  { bg: 'bg-amber-50 dark:bg-amber-950/30', dot: 'bg-amber-500' },
  { bg: 'bg-purple-50 dark:bg-purple-950/30', dot: 'bg-purple-500' },
]

const BADGE_PRIORITY: Record<string, string> = {
  Haute: 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400',
  Moyenne: 'bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400',
  Basse: 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
}

const TYPE_DOC: Record<string, string> = {
  'PDF': 'bg-red-100 text-red-500',
  'Word': 'bg-blue-100 text-blue-500',
  'Excel': 'bg-green-100 text-green-500',
  'Image': 'bg-purple-100 text-purple-500',
}

export function MobileDashboard({ onOuvrirPalette }: { onOuvrirPalette: () => void }) {
  const [prenom, setPrenom] = useState('Mahdi')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      const nom = data.user?.user_metadata?.full_name ?? ''
      if (nom) setPrenom(nom.split(' ')[0])
    })
  }, [])

  const { data: taches = [] } = useTaches({ statut: 'a_faire' })
  const { emails = [] } = useGmail()
  const { data: reunions = [] } = useReunions()
  const { data: documents = [] } = useDocuments()
  const { data: checkItems = [], isError: checkError } = useChecklistItems()
  const { data: checkCoches = [] } = useChecklistCoches()
  const { mutate: toggleCoche } = useToggleCoche()
  const cochesSet = new Set(checkCoches.map(c => c.item_id))
  const checkPct = checkItems.length === 0 ? 0 : Math.round((checkCoches.length / checkItems.length) * 100)

  const { data: licences = [] } = useLicences()
  const { data: consommables = [] } = useConsommables()
  const { data: sites = [] } = useSitesMonitores()

  const nbLicencesAlerte = licences.filter(l => { const j = joursAvantExpiration(l.date_expiration); return j !== null && j <= 90 }).length
  const nbConsommablesAlerte = consommables.filter(c => c.stock_actuel <= c.seuil_alerte).length
  const nbSitesHS = sites.filter(s => s.statut === 'hors_ligne').length

  /* Stats */
  const total = taches.length
  const urgentes = taches.filter(estUrgente).length
  const emailsNonLus = emails.filter(e => !e.lu).length
  const reunionsAujourd = reunions.filter(r => isToday(new Date(r.date_heure))).length

  /* Agenda today */
  const agendaJour = reunions
    .filter(r => isToday(new Date(r.date_heure)))
    .sort((a, b) => new Date(a.date_heure).getTime() - new Date(b.date_heure).getTime())

  /* Tasks today */
  const tachesJour = [
    ...taches.filter(estUrgente),
    ...taches.filter(t => !estUrgente(t) && t.priorite === 'Haute'),
    ...taches.filter(t => t.deadline && isToday(new Date(t.deadline)) && !estUrgente(t) && t.priorite !== 'Haute'),
  ].filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i).slice(0, 5)

  /* Docs */
  const docsRecents = documents.slice(0, 3)

  const stats = [
    {
      label: 'À faire', valeur: total, sousTitre: 'Tâches',
      icone: ListTodo, couleur: 'text-blue-600', fond: 'bg-blue-50 dark:bg-blue-950/30',
      sparkCouleur: '#3b82f6',
      spark: Array.from({ length: 7 }, (_, i) => Math.max(0, total - i)),
    },
    {
      label: 'Urgentes', valeur: urgentes, sousTitre: 'Tâches',
      icone: AlertTriangle, couleur: 'text-red-600', fond: 'bg-red-50 dark:bg-red-950/30',
      sparkCouleur: '#ef4444',
      spark: Array.from({ length: 7 }, (_, i) => Math.max(0, urgentes - i % 2)),
    },
    {
      label: 'Emails non lus', valeur: emailsNonLus, sousTitre: 'Messages',
      icone: Mail, couleur: 'text-purple-600', fond: 'bg-purple-50 dark:bg-purple-950/30',
      sparkCouleur: '#a855f7',
      spark: Array.from({ length: 7 }, (_, i) => Math.max(0, emailsNonLus - i % 3)),
    },
    {
      label: 'Réunions', valeur: reunionsAujourd, sousTitre: 'Réunions',
      icone: CalendarDays, couleur: 'text-indigo-600', fond: 'bg-indigo-50 dark:bg-indigo-950/30',
      sparkCouleur: '#6366f1',
      spark: Array.from({ length: 7 }, (_, i) => Math.max(0, reunionsAujourd - i % 2)),
    },
  ]

  return (
    <div className="space-y-5">

      {/* Greeting */}
      <div className="flex items-start justify-between px-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
            {salutation(prenom)}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Voici un aperçu rapide pour aujourd&apos;hui.
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={onOuvrirPalette}
            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 transition-colors shrink-0"
          >
            <Search className="w-4 h-4" />
          </button>
          <VoiceButton variant="icon" />
        </div>
      </div>

      {/* Stats 2×2 */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map(s => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.fond}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-tight">{s.label}</span>
              <div className="w-7 h-7 bg-white/60 dark:bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                <s.icone className={`w-3.5 h-3.5 ${s.couleur}`} />
              </div>
            </div>
            <p className={`text-3xl font-bold ${s.couleur}`}>{s.valeur}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">{s.sousTitre}</p>
            <Sparkline donnees={s.spark} couleur={s.sparkCouleur} />
          </div>
        ))}
      </div>

      {/* ── Checklist + Coffre côte à côte (mobile) ── */}
      <div className="grid grid-cols-2 gap-3">

        {/* Checklist */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
              <ClipboardList className="w-3 h-3 text-emerald-500" />
            </div>
            <span className="text-xs font-bold text-gray-900 dark:text-white">Checklist</span>
            {checkItems.length > 0 && (
              <span className={cn('ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                checkPct === 100
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              )}>
                {checkCoches.length}/{checkItems.length}
              </span>
            )}
          </div>

          {checkError ? (
            <p className="text-[10px] text-amber-500">SQL manquant</p>
          ) : checkItems.length === 0 ? (
            <p className="text-[10px] text-gray-400 dark:text-gray-600">Aucune tâche configurée</p>
          ) : (
            <>
              <div className="h-1 rounded-full bg-gray-100 dark:bg-gray-800 mb-2 overflow-hidden">
                <motion.div
                  className={cn('h-full rounded-full', checkPct === 100 ? 'bg-emerald-500' : 'bg-indigo-400')}
                  initial={{ width: 0 }} animate={{ width: `${checkPct}%` }} transition={{ duration: 0.4 }}
                />
              </div>
              <div className="space-y-1">
                {checkItems.slice(0, 4).map(item => {
                  const estCoche = cochesSet.has(item.id)
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleCoche({ itemId: item.id, estCoche })}
                      className="flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className={cn('shrink-0', estCoche ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600')}>
                        {estCoche ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                      </span>
                      <p className={cn('text-[10px] font-medium truncate', estCoche ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200')}>
                        {item.titre}
                      </p>
                    </div>
                  )
                })}
                {checkItems.length > 4 && (
                  <p className="text-[9px] text-gray-400 pt-0.5">+{checkItems.length - 4} autres</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Coffre */}
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900 p-3 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
              <KeyRound className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-bold text-gray-900 dark:text-white">Coffre</span>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-3">
            Mots de passe chiffrés AES-256
          </p>
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-1 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-bold transition-colors"
          >
            <Lock className="w-2.5 h-2.5" />
            Ouvrir sur desktop
          </Link>
        </div>
      </div>

      {/* Alertes : Licences / Consommables / Monitoring */}
      {(nbLicencesAlerte > 0 || nbConsommablesAlerte > 0 || nbSitesHS > 0) && (
        <div className="grid grid-cols-3 gap-2">
          <Link href="/licences" className={cn(
            'rounded-2xl p-3 flex flex-col items-center gap-1 border',
            nbLicencesAlerte > 0
              ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900'
              : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
          )}>
            <ShieldCheck className={cn('w-5 h-5', nbLicencesAlerte > 0 ? 'text-indigo-500' : 'text-gray-300 dark:text-gray-700')} />
            <p className={cn('text-lg font-bold leading-none', nbLicencesAlerte > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400')}>{nbLicencesAlerte}</p>
            <p className="text-[9px] text-gray-500 dark:text-gray-400 text-center leading-tight">Licences</p>
          </Link>
          <Link href="/consommables" className={cn(
            'rounded-2xl p-3 flex flex-col items-center gap-1 border',
            nbConsommablesAlerte > 0
              ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-100 dark:border-orange-900'
              : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
          )}>
            <Boxes className={cn('w-5 h-5', nbConsommablesAlerte > 0 ? 'text-orange-500' : 'text-gray-300 dark:text-gray-700')} />
            <p className={cn('text-lg font-bold leading-none', nbConsommablesAlerte > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400')}>{nbConsommablesAlerte}</p>
            <p className="text-[9px] text-gray-500 dark:text-gray-400 text-center leading-tight">Stock bas</p>
          </Link>
          <Link href="/monitoring" className={cn(
            'rounded-2xl p-3 flex flex-col items-center gap-1 border',
            nbSitesHS > 0
              ? 'bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900'
              : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
          )}>
            <Activity className={cn('w-5 h-5', nbSitesHS > 0 ? 'text-red-500' : 'text-gray-300 dark:text-gray-700')} />
            <p className={cn('text-lg font-bold leading-none', nbSitesHS > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400')}>{nbSitesHS}</p>
            <p className="text-[9px] text-gray-500 dark:text-gray-400 text-center leading-tight">Sites HS</p>
          </Link>
        </div>
      )}

      {/* Agenda aujourd'hui */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Aujourd&apos;hui</h2>
          <Link
            href="/reunions"
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 px-3 py-1.5 rounded-xl transition-colors"
          >
            <Plus className="w-3 h-3" />
            Planifier
          </Link>
        </div>

        {agendaJour.length === 0 ? (
          <div className="px-4 pb-4 text-xs text-gray-400 dark:text-gray-600">Aucune réunion aujourd&apos;hui</div>
        ) : (
          <div className="px-4 pb-3 space-y-2">
            {agendaJour.slice(0, 4).map((r, i) => {
              const clr = AGD_COLORS[i % AGD_COLORS.length]
              return (
                <div key={r.id} className="flex items-start gap-3">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tabular-nums pt-2 w-10 shrink-0">
                    {format(new Date(r.date_heure), 'HH:mm')}
                  </span>
                  <div className={`flex-1 flex items-start gap-2 rounded-xl px-3 py-2 ${clr.bg}`}>
                    <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${clr.dot}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{r.titre}</p>
                      {r.lieu && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{r.lieu}</p>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Tâches du jour */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
              <ListTodo className="w-3.5 h-3.5 text-orange-500" />
            </div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Tâches du jour</h2>
          </div>
          <Link href="/taches" className="flex items-center gap-1 text-xs text-blue-500 font-medium">
            Voir tout <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {tachesJour.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-600 py-2">Aucune tâche prioritaire</p>
        ) : (
          <div className="space-y-2.5">
            {tachesJour.map(t => (
              <div key={t.id} className="flex items-center gap-2.5">
                <Circle className="w-4 h-4 shrink-0 text-gray-300 dark:text-gray-600" />
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 flex-1 truncate">{t.titre}</p>
                {estUrgente(t) ? (
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-semibold shrink-0', BADGE_PRIORITY['Haute'])}>
                    Urgent
                  </span>
                ) : t.priorite === 'Haute' ? (
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-semibold shrink-0', BADGE_PRIORITY['Moyenne'])}>
                    Important
                  </span>
                ) : null}
                {t.deadline && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums shrink-0">
                    {format(new Date(t.deadline), 'HH:mm')}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documents récents */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Documents récents</h2>
          </div>
          <Link href="/documents" className="flex items-center gap-1 text-xs text-blue-500 font-medium">
            Voir tout <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {docsRecents.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-600 py-2">Aucun document</p>
        ) : (
          <div className="space-y-3">
            {docsRecents.map(doc => {
              const cls = TYPE_DOC[doc.type] ?? 'bg-gray-100 text-gray-500'
              return (
                <div key={doc.id} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${cls} flex items-center justify-center shrink-0 text-xs font-bold`}>
                    {doc.type.slice(0, 3).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{doc.titre}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Ajouté il y a {Math.round((Date.now() - new Date(doc.created_at).getTime()) / 86400000)}j
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
