'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Materiel, NouveauMateriel, StatutMateriel } from '@/types'

async function fetchMateriel(): Promise<Materiel[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('materiel')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export function useMateriel() {
  return useQuery({ queryKey: ['materiel'], queryFn: fetchMateriel })
}

export function useCreerMateriel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (item: NouveauMateriel) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('materiel')
        .insert({ ...item, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiel'] })
      toast.success('Équipement ajouté !')
    },
    onError: () => toast.error('Erreur lors de la création'),
  })
}

export function useModifierMateriel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Materiel> & { id: string }) => {
      const supabase = createClient()
      const { error } = await supabase.from('materiel').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiel'] })
      toast.success('Équipement mis à jour')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })
}

export function useSupprimerMateriel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('materiel').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['materiel'] })
      const precedent = queryClient.getQueryData<Materiel[]>(['materiel'])
      queryClient.setQueryData<Materiel[]>(['materiel'], old => old?.filter(m => m.id !== id) ?? [])
      return { precedent }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['materiel'], ctx?.precedent)
      toast.error('Erreur lors de la suppression')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiel'] })
      toast.success('Équipement supprimé')
    },
  })
}

export function useChangerStatutMateriel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: StatutMateriel }) => {
      const supabase = createClient()
      const { error } = await supabase.from('materiel').update({ statut }).eq('id', id)
      if (error) throw error
    },
    onMutate: async ({ id, statut }) => {
      await queryClient.cancelQueries({ queryKey: ['materiel'] })
      const precedent = queryClient.getQueryData<Materiel[]>(['materiel'])
      queryClient.setQueryData<Materiel[]>(['materiel'], old =>
        old?.map(m => m.id === id ? { ...m, statut } : m) ?? []
      )
      return { precedent }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['materiel'], ctx?.precedent)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['materiel'] }),
  })
}
