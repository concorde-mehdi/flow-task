'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Consommable, NouveauConsommable } from '@/types'

async function fetchConsommables(): Promise<Consommable[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('consommables')
    .select('*')
    .order('titre', { ascending: true })
  if (error) throw error
  return data ?? []
}

export function useConsommables() {
  return useQuery({ queryKey: ['consommables'], queryFn: fetchConsommables })
}

export function useCreerConsommable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (item: NouveauConsommable) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('consommables')
        .insert({ ...item, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consommables'] })
      toast.success('Consommable ajouté !')
    },
    onError: () => toast.error('Erreur lors de la création'),
  })
}

export function useModifierConsommable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Consommable> & { id: string }) => {
      const supabase = createClient()
      const { error } = await supabase.from('consommables').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consommables'] })
      toast.success('Consommable mis à jour')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })
}

export function useSupprimerConsommable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('consommables').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['consommables'] })
      const precedent = queryClient.getQueryData<Consommable[]>(['consommables'])
      queryClient.setQueryData<Consommable[]>(['consommables'], old => old?.filter(c => c.id !== id) ?? [])
      return { precedent }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['consommables'], ctx?.precedent)
      toast.error('Erreur lors de la suppression')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consommables'] })
      toast.success('Consommable supprimé')
    },
  })
}

export function useAjusterStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, delta }: { id: string; delta: number }) => {
      const supabase = createClient()
      const { data: current } = await supabase.from('consommables').select('stock_actuel').eq('id', id).single()
      const newStock = Math.max(0, (current?.stock_actuel ?? 0) + delta)
      const { error } = await supabase.from('consommables').update({ stock_actuel: newStock }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['consommables'] }),
    onError: () => toast.error('Erreur mise à jour stock'),
  })
}
