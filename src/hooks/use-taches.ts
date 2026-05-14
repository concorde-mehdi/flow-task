'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Tache, NouvellesTache, FiltresTaches } from '@/types'
import { estUrgente } from '@/lib/utils'
import { logActivite } from '@/lib/activite'

async function fetchTaches(): Promise<Tache[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('taches')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export function useTaches(filtres?: FiltresTaches) {
  return useQuery({
    queryKey: ['taches'],
    queryFn: fetchTaches,
    select: (data) => {
      let resultat = data
      if (filtres?.statut === 'a_faire') resultat = resultat.filter(t => !t.statut)
      if (filtres?.statut === 'faites') resultat = resultat.filter(t => t.statut)
      if (filtres?.priorite && filtres.priorite !== 'Toutes') {
        resultat = resultat.filter(t => t.priorite === filtres.priorite)
      }
      if (filtres?.tag) {
        resultat = resultat.filter(t => t.tags.some(tag => tag.nom === filtres.tag))
      }
      if (filtres?.recherche) {
        const q = filtres.recherche.toLowerCase()
        resultat = resultat.filter(t => t.titre.toLowerCase().includes(q))
      }
      return resultat
    },
  })
}

export function useTachesUrgentes() {
  return useQuery({
    queryKey: ['taches'],
    queryFn: fetchTaches,
    select: (data) => data.filter(t => estUrgente(t) && !t.statut),
  })
}

export function useTachesQuotidiennes() {
  return useQuery({
    queryKey: ['taches'],
    queryFn: fetchTaches,
    select: (data) => data.filter(t => t.is_quotidienne && !t.statut),
  })
}

export function useCreerTache() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (tache: NouvellesTache) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('taches')
        .insert({ ...tache, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onMutate: async (nouvelleTache) => {
      await queryClient.cancelQueries({ queryKey: ['taches'] })
      const precedent = queryClient.getQueryData<Tache[]>(['taches'])
      const optimiste: Tache = {
        id: `temp-${Date.now()}`,
        user_id: 'temp',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...nouvelleTache,
      }
      queryClient.setQueryData<Tache[]>(['taches'], old => [optimiste, ...(old ?? [])])
      return { precedent }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['taches'], ctx?.precedent)
      toast.error('Erreur lors de la création de la tâche')
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['taches'] })
      toast.success('Tâche créée !')
      logActivite('tache', `Tâche créée : ${data.titre}`)
    },
  })
}

export function useToggleTache() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: boolean }) => {
      const supabase = createClient()
      const { error } = await supabase
        .from('taches')
        .update({ statut, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onMutate: async ({ id, statut }) => {
      await queryClient.cancelQueries({ queryKey: ['taches'] })
      const precedent = queryClient.getQueryData<Tache[]>(['taches'])
      queryClient.setQueryData<Tache[]>(['taches'], old =>
        old?.map(t => t.id === id ? { ...t, statut } : t) ?? []
      )
      return { precedent }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['taches'], ctx?.precedent)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taches'] })
    },
  })
}

export function useModifierTache() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Tache> & { id: string }) => {
      const supabase = createClient()
      const { error } = await supabase
        .from('taches')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taches'] })
      toast.success('Tâche mise à jour')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })
}

export function useSupprimerTache() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('taches').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['taches'] })
      const precedent = queryClient.getQueryData<Tache[]>(['taches'])
      queryClient.setQueryData<Tache[]>(['taches'], old => old?.filter(t => t.id !== id) ?? [])
      return { precedent }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['taches'], ctx?.precedent)
      toast.error('Erreur lors de la suppression')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taches'] })
      toast.success('Tâche supprimée')
      logActivite('tache', 'Tâche supprimée')
    },
  })
}
