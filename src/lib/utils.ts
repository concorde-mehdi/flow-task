import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInHours, isToday, isTomorrow, format, isPast } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Tache, Priorite } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function estUrgente(tache: Tache): boolean {
  if (tache.statut || !tache.deadline) return false
  const heuresRestantes = differenceInHours(new Date(tache.deadline), new Date())
  return heuresRestantes >= 0 && heuresRestantes < 24
}

export function estEnRetard(tache: Tache): boolean {
  if (tache.statut || !tache.deadline) return false
  return isPast(new Date(tache.deadline))
}

export function formatDeadline(deadline: string | null): string {
  if (!deadline) return ''
  const date = new Date(deadline)
  if (isToday(date)) return "Aujourd'hui"
  if (isTomorrow(date)) return 'Demain'
  return format(date, 'd MMM yyyy', { locale: fr })
}

export function formatHeure(deadline: string | null): string {
  if (!deadline) return ''
  return format(new Date(deadline), 'HH:mm', { locale: fr })
}

export function couleurPriorite(priorite: Priorite): string {
  switch (priorite) {
    case 'Haute': return 'text-red-500'
    case 'Moyenne': return 'text-orange-400'
    case 'Basse': return 'text-blue-400'
  }
}

export function badgePriorite(priorite: Priorite): string {
  switch (priorite) {
    case 'Haute': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'Moyenne': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    case 'Basse': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  }
}

export function trierParPriorite(taches: Tache[]): Tache[] {
  const ordre: Record<Priorite, number> = { Haute: 0, Moyenne: 1, Basse: 2 }
  return [...taches].sort((a, b) => ordre[a.priorite] - ordre[b.priorite])
}

export function couleurAleatoire(): string {
  const couleurs = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
  ]
  return couleurs[Math.floor(Math.random() * couleurs.length)]
}
