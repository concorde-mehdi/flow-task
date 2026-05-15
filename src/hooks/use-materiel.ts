'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Materiel, NouveauMateriel } from '@/types'
import { logActivite } from '@/lib/activite'

async function fetchMateriel(): Promise<Materiel[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('materiel')
    .select('*')
    .order('categorie', { ascending: true })
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['materiel'] })
      toast.success('Équipement ajouté !')
      logActivite('materiel', `Équipement ajouté : ${data.titre}`)
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
