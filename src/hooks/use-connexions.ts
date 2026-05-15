'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { ConnexionPC, NouvelleConnexion } from '@/types'

async function fetchConnexions(): Promise<ConnexionPC[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('connexions_pc')
    .select('*')
    .order('nom', { ascending: true })
  if (error) throw error
  return data ?? []
}

export function useConnexions() {
  return useQuery({ queryKey: ['connexions'], queryFn: fetchConnexions })
}

export function useCreerConnexion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (connexion: NouvelleConnexion) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('connexions_pc')
        .insert({ ...connexion, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connexions'] })
      toast.success('Connexion ajoutée !')
    },
    onError: () => toast.error('Erreur lors de la création'),
  })
}

export function useModifierConnexion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ConnexionPC> & { id: string }) => {
      const supabase = createClient()
      const { error } = await supabase.from('connexions_pc').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connexions'] })
      toast.success('Connexion mise à jour')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })
}

export function useChangerStatutConnexion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: string }) => {
      const supabase = createClient()
      const { error } = await supabase.from('connexions_pc').update({ statut }).eq('id', id)
      if (error) throw error
    },
    onMutate: async ({ id, statut }) => {
      await queryClient.cancelQueries({ queryKey: ['connexions'] })
      const precedent = queryClient.getQueryData<ConnexionPC[]>(['connexions'])
      queryClient.setQueryData<ConnexionPC[]>(['connexions'], old =>
        old?.map(c => c.id === id ? { ...c, statut: statut as ConnexionPC['statut'] } : c) ?? []
      )
      return { precedent }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['connexions'], ctx?.precedent)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['connexions'] }),
  })
}

export function useSupprimerConnexion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('connexions_pc').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['connexions'] })
      const precedent = queryClient.getQueryData<ConnexionPC[]>(['connexions'])
      queryClient.setQueryData<ConnexionPC[]>(['connexions'], old => old?.filter(c => c.id !== id) ?? [])
      return { precedent }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['connexions'], ctx?.precedent)
      toast.error('Erreur lors de la suppression')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connexions'] })
      toast.success('Connexion supprimée')
    },
  })
}
