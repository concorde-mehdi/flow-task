'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, FileSpreadsheet, AlertCircle, CheckCircle, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useImporterLignes } from '@/hooks/use-lignes-mobiles'
import type { NouvelleLigneMobile, StatutLigne } from '@/types'

// Détection automatique des colonnes
const MAPS_NUMERO = ['numero', 'numéro', 'num', 'tel', 'téléphone', 'telephone', 'phone', 'msisdn', 'ligne', 'number', 'mobile']
const MAPS_FORFAIT = ['forfait', 'offre', 'plan', 'abonnement', 'type', 'formule', 'pack', 'tarif', 'option']
const MAPS_TITULAIRE = ['nom', 'titulaire', 'abonné', 'abonne', 'utilisateur', 'user', 'name', 'prenom', 'prénom', 'proprietaire', 'propriétaire']
const MAPS_STATUT = ['statut', 'etat', 'état', 'status', 'état ligne', 'etat ligne']

function detectColonne(headers: string[], maps: string[]): string | null {
  const h = headers.map(x => x.toLowerCase().trim())
  for (const m of maps) {
    const found = h.find(x => x.includes(m))
    if (found) return headers[h.indexOf(found)]
  }
  return null
}

function normaliserStatut(val: string | undefined): StatutLigne {
  if (!val) return 'active'
  const v = val.toLowerCase()
  if (v.includes('suspend') || v.includes('bloqué') || v.includes('bloque')) return 'suspendue'
  if (v.includes('resili') || v.includes('résili') || v.includes('terminé') || v.includes('termine')) return 'resiliee'
  if (v.includes('attente') || v.includes('cours')) return 'en_attente'
  return 'active'
}

interface ColMapping {
  numero: string | null
  forfait: string | null
  titulaire: string | null
  statut: string | null
}

interface PreviewRow {
  numero: string
  type_forfait: string | null
  titulaire: string | null
  statut: StatutLigne
}

interface Props {
  onFermer: () => void
}

export function ImportExcel({ onFermer }: Props) {
  const { mutate: importer, isPending } = useImporterLignes()
  const inputRef = useRef<HTMLInputElement>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([])
  const [mapping, setMapping] = useState<ColMapping>({ numero: null, forfait: null, titulaire: null, statut: null })
  const [preview, setPreview] = useState<PreviewRow[]>([])
  const [etape, setEtape] = useState<'upload' | 'mapping' | 'preview'>('upload')
  const [nomFichier, setNomFichier] = useState('')

  async function chargerFichier(file: File) {
    setNomFichier(file.name)
    const XLSX = await import('xlsx')
    const data = await file.arrayBuffer()
    const wb = XLSX.read(data, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' }) as Record<string, string>[]
    if (rows.length === 0) return

    const hdrs = Object.keys(rows[0])
    setHeaders(hdrs)
    setRawRows(rows)

    const auto: ColMapping = {
      numero: detectColonne(hdrs, MAPS_NUMERO),
      forfait: detectColonne(hdrs, MAPS_FORFAIT),
      titulaire: detectColonne(hdrs, MAPS_TITULAIRE),
      statut: detectColonne(hdrs, MAPS_STATUT),
    }
    setMapping(auto)
    setEtape('mapping')
  }

  function construirePreview() {
    if (!mapping.numero) return
    const rows = rawRows.slice(0, 200).map(row => ({
      numero: String(row[mapping.numero!] ?? '').trim(),
      type_forfait: mapping.forfait ? String(row[mapping.forfait] ?? '').trim() || null : null,
      titulaire: mapping.titulaire ? String(row[mapping.titulaire] ?? '').trim() || null : null,
      statut: normaliserStatut(mapping.statut ? String(row[mapping.statut] ?? '') : undefined),
    })).filter(r => r.numero)
    setPreview(rows)
    setEtape('preview')
  }

  function lancer() {
    const payload: NouvelleLigneMobile[] = preview.map(r => ({
      numero: r.numero,
      type_forfait: r.type_forfait,
      titulaire: r.titulaire,
      statut: r.statut,
      date_activation: null,
      notes: null,
    }))
    importer(payload, { onSuccess: onFermer })
  }

  const STATUT_CLS: Record<StatutLigne, string> = {
    active: 'bg-emerald-100 text-emerald-600',
    suspendue: 'bg-orange-100 text-orange-600',
    resiliee: 'bg-red-100 text-red-600',
    en_attente: 'bg-blue-100 text-blue-600',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onFermer} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-950/50 flex items-center justify-center">
              <FileSpreadsheet className="w-4.5 h-4.5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Importer depuis Excel</p>
              {nomFichier && <p className="text-xs text-gray-400 truncate max-w-[200px]">{nomFichier}</p>}
            </div>
          </div>
          <button onClick={onFermer} className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Étapes */}
        <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
          {[{ id: 'upload', label: '1. Fichier' }, { id: 'mapping', label: '2. Colonnes' }, { id: 'preview', label: '3. Aperçu' }].map((s, i, arr) => (
            <div key={s.id} className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${etape === s.id ? 'bg-blue-500 text-white' : ['mapping', 'preview'].includes(etape) && i < ['upload', 'mapping', 'preview'].indexOf(etape) ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                {s.label}
              </span>
              {i < arr.length - 1 && <span className="text-gray-300">→</span>}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">

          {/* Étape 1 : Upload */}
          {etape === 'upload' && (
            <div
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all"
            >
              <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-950/50 flex items-center justify-center">
                <Upload className="w-7 h-7 text-green-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900 dark:text-white">Glisser ou cliquer pour sélectionner</p>
                <p className="text-xs text-gray-400 mt-1">Fichiers Excel (.xlsx, .xls) ou CSV</p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) chargerFichier(f) }}
              />
            </div>
          )}

          {/* Étape 2 : Mapping colonnes */}
          {etape === 'mapping' && (
            <div className="space-y-4">
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Fichier lu : <strong>{rawRows.length}</strong> lignes détectées. Vérifiez que les colonnes correspondent bien.
                </p>
              </div>

              {[
                { key: 'numero' as const, label: 'Numéro de téléphone *', required: true, color: 'text-blue-600' },
                { key: 'forfait' as const, label: 'Type de forfait', required: false, color: 'text-purple-600' },
                { key: 'titulaire' as const, label: 'Titulaire / Nom', required: false, color: 'text-gray-600' },
                { key: 'statut' as const, label: 'Statut ligne', required: false, color: 'text-gray-600' },
              ].map(({ key, label, required, color }) => (
                <div key={key}>
                  <label className={`text-xs font-semibold block mb-1.5 ${color}`}>{label}</label>
                  <div className="relative">
                    <select
                      value={mapping[key] ?? ''}
                      onChange={e => setMapping(m => ({ ...m, [key]: e.target.value || null }))}
                      className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 pr-8 bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-400 appearance-none"
                    >
                      <option value="">— Ne pas importer —</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                  {mapping[key] && rawRows[0] && (
                    <p className="text-[11px] text-gray-400 mt-1 ml-1">
                      Exemple : <span className="font-medium text-gray-600 dark:text-gray-300">{String(rawRows[0][mapping[key]!] ?? '—')}</span>
                    </p>
                  )}
                  {required && !mapping[key] && (
                    <p className="text-[11px] text-red-500 mt-1 ml-1">Ce champ est obligatoire</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Étape 3 : Aperçu */}
          {etape === 'preview' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  <strong>{preview.length}</strong> lignes prêtes à importer
                  {rawRows.length > 200 && <span className="text-gray-400"> (limité à 200 pour l'aperçu)</span>}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">Numéro</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">Forfait</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">Titulaire</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {preview.slice(0, 10).map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-3 py-1.5 font-mono text-gray-900 dark:text-white">{row.numero}</td>
                        <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400 truncate max-w-[140px]">{row.type_forfait ?? '—'}</td>
                        <td className="px-3 py-1.5 text-gray-600 dark:text-gray-400">{row.titulaire ?? '—'}</td>
                        <td className="px-3 py-1.5">
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${STATUT_CLS[row.statut]}`}>{row.statut}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 10 && (
                  <p className="text-center text-xs text-gray-400 py-2">… et {preview.length - 10} autres lignes</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
          {etape === 'upload' && (
            <Button variant="outline" onClick={onFermer} className="flex-1">Annuler</Button>
          )}
          {etape === 'mapping' && (
            <>
              <Button variant="outline" onClick={() => setEtape('upload')} className="flex-1">Retour</Button>
              <Button onClick={construirePreview} disabled={!mapping.numero} className="flex-1">
                Aperçu →
              </Button>
            </>
          )}
          {etape === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setEtape('mapping')} className="flex-1">Retour</Button>
              <Button onClick={lancer} disabled={isPending || preview.length === 0} className="flex-1 bg-emerald-500 hover:bg-emerald-600">
                {isPending ? 'Import en cours…' : `Importer ${preview.length} lignes`}
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
