'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { FormulairesTache } from '@/components/taches/formulaire-tache'
import { FormulaireReunion } from '@/components/reunions/formulaire-reunion'
import { useTaches } from '@/hooks/use-taches'
import { useReunions } from '@/hooks/use-reunions'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Tache, Reunion } from '@/types'

export default function PageCalendrier() {
  const [dateActuelle, setDateActuelle] = useState(new Date())
  const [tacheSelectionnee, setTacheSelectionnee] = useState<Tache | null>(null)
  const [formulaireTacheOuvert, setFormulaireTacheOuvert] = useState(false)
  const [reunionSelectionnee, setReunionSelectionnee] = useState<Reunion | null>(null)
  const [formulaireReunionOuvert, setFormulaireReunionOuvert] = useState(false)

  const { data: taches = [] } = useTaches()
  const { data: reunions = [] } = useReunions()

  const debutMois = startOfMonth(dateActuelle)
  const finMois = endOfMonth(dateActuelle)
  const debutCalendrier = startOfWeek(debutMois, { weekStartsOn: 1 })
  const finCalendrier = endOfWeek(finMois, { weekStartsOn: 1 })
  const jours = eachDayOfInterval({ start: debutCalendrier, end: finCalendrier })

  const joursEnTete = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  function tachesDuJour(jour: Date): Tache[] {
    return taches.filter(t => t.deadline && isSameDay(new Date(t.deadline), jour))
  }

  function reunionsDuJour(jour: Date): Reunion[] {
    return reunions.filter(r => isSameDay(new Date(r.date_heure), jour))
  }

  function couleurTache(tache: Tache): string {
    switch (tache.priorite) {
      case 'Haute': return 'bg-red-500'
      case 'Moyenne': return 'bg-orange-400'
      default: return 'bg-blue-500'
    }
  }

  // Compte des événements du mois pour le résumé
  const tachesAvecDeadline = taches.filter(t => t.deadline && new Date(t.deadline) >= startOfMonth(dateActuelle) && new Date(t.deadline) <= endOfMonth(dateActuelle))
  const reunionsMois = reunions.filter(r => new Date(r.date_heure) >= startOfMonth(dateActuelle) && new Date(r.date_heure) <= endOfMonth(dateActuelle))

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header titre="Calendrier" />

        <main className="flex-1 p-6 pb-24 md:pb-6">
          <div className="max-w-4xl mx-auto space-y-5">

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {format(dateActuelle, 'MMMM yyyy', { locale: fr })}
                </h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {tachesAvecDeadline.length} tâche{tachesAvecDeadline.length !== 1 ? 's' : ''} · {reunionsMois.length} réunion{reunionsMois.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setDateActuelle(new Date())} className="text-xs h-8 w-auto px-3 font-medium">
                  Aujourd&apos;hui
                </Button>
                <Button variant="outline" size="icon" onClick={() => setDateActuelle(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setDateActuelle(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Grille calendrier */}
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800">
                {joursEnTete.map(j => (
                  <div key={j} className="py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400">{j}</div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {jours.map((jour, idx) => {
                  const tachesJour = tachesDuJour(jour)
                  const reunionsJour = reunionsDuJour(jour)
                  const totalEvenements = tachesJour.length + reunionsJour.length
                  const estMoisActuel = jour.getMonth() === dateActuelle.getMonth()
                  const estAujourdhui = isToday(jour)

                  return (
                    <div
                      key={jour.toISOString()}
                      className={cn(
                        'min-h-[90px] md:min-h-[110px] p-2 border-b border-r border-gray-50 dark:border-gray-800/50 transition-colors',
                        idx % 7 === 6 && 'border-r-0',
                        !estMoisActuel && 'bg-gray-50/50 dark:bg-gray-900/30',
                        estAujourdhui && 'bg-blue-50/40 dark:bg-blue-950/20'
                      )}
                    >
                      <div className={cn(
                        'w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium mb-1',
                        estAujourdhui ? 'bg-blue-500 text-white'
                          : estMoisActuel ? 'text-gray-700 dark:text-gray-300'
                          : 'text-gray-300 dark:text-gray-700'
                      )}>
                        {format(jour, 'd')}
                      </div>

                      <div className="space-y-0.5">
                        {/* Réunions */}
                        {reunionsJour.slice(0, 2).map(r => (
                          <button
                            key={r.id}
                            onClick={() => { setReunionSelectionnee(r); setFormulaireReunionOuvert(true) }}
                            className="w-full text-left text-xs px-1.5 py-0.5 rounded bg-purple-500 text-white font-medium truncate flex items-center gap-1"
                          >
                            <CalendarDays className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{r.titre}</span>
                          </button>
                        ))}
                        {/* Tâches */}
                        {tachesJour.slice(0, reunionsJour.length >= 2 ? 1 : 2).map(tache => (
                          <button
                            key={tache.id}
                            onClick={() => { setTacheSelectionnee(tache); setFormulaireTacheOuvert(true) }}
                            className={cn(
                              'w-full text-left text-xs px-1.5 py-0.5 rounded text-white font-medium truncate',
                              couleurTache(tache),
                              tache.statut && 'opacity-50 line-through'
                            )}
                          >
                            {tache.titre}
                          </button>
                        ))}
                        {totalEvenements > 3 && (
                          <p className="text-xs text-gray-400 dark:text-gray-600 px-1">+{totalEvenements - 3}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Légende */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-purple-500 inline-block" /> Réunion</div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> Tâche haute priorité</div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-400 inline-block" /> Tâche moyenne</div>
              <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block" /> Tâche basse</div>
            </div>
          </div>
        </main>
      </div>

      <BottomNav />

      <FormulairesTache
        ouvert={formulaireTacheOuvert}
        onFermer={() => { setFormulaireTacheOuvert(false); setTacheSelectionnee(null) }}
        tacheAModifier={tacheSelectionnee}
      />
      <FormulaireReunion
        ouvert={formulaireReunionOuvert}
        onFermer={() => { setFormulaireReunionOuvert(false); setReunionSelectionnee(null) }}
        reunionAModifier={reunionSelectionnee}
      />
    </div>
  )
}
