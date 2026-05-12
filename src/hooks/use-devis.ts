'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Devis, NouveauDevis, StatutDevis } from '@/types'

async function fetchDevis(): Promise<Devis[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('devis')
    .select('*')
    .order('date_devis', { ascending: false })
  if (error) throw error
  return data ?? []
}

export function useDevis() {
  return useQuery({ queryKey: ['devis'], queryFn: fetchDevis })
}

export function useCreerDevis() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (devis: NouveauDevis) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('devis')
        .insert({ ...devis, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devis'] })
      toast.success('Devis ajouté !')
    },
    onError: () => toast.error('Erreur lors de la création'),
  })
}

export function useModifierDevis() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Devis> & { id: string }) => {
      const supabase = createClient()
      const { error } = await supabase.from('devis').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devis'] })
      toast.success('Devis mis à jour')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })
}

export function useSupprimerDevis() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('devis').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['devis'] })
      const precedent = queryClient.getQueryData<Devis[]>(['devis'])
      queryClient.setQueryData<Devis[]>(['devis'], old => old?.filter(d => d.id !== id) ?? [])
      return { precedent }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['devis'], ctx?.precedent)
      toast.error('Erreur lors de la suppression')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devis'] })
      toast.success('Devis supprimé')
    },
  })
}

export function useChangerStatutDevis() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: StatutDevis }) => {
      const supabase = createClient()
      const { error } = await supabase.from('devis').update({ statut }).eq('id', id)
      if (error) throw error
    },
    onMutate: async ({ id, statut }) => {
      await queryClient.cancelQueries({ queryKey: ['devis'] })
      const precedent = queryClient.getQueryData<Devis[]>(['devis'])
      queryClient.setQueryData<Devis[]>(['devis'], old =>
        old?.map(d => d.id === id ? { ...d, statut } : d) ?? []
      )
      return { precedent }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['devis'], ctx?.precedent)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devis'] }),
  })
}
