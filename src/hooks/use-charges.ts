'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Charge, NouvelleCharge } from '@/types'

async function fetchCharges(): Promise<Charge[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('charges')
    .select('*')
    .order('date_charge', { ascending: false })
  if (error) throw error
  return data ?? []
}

export function useCharges() {
  return useQuery({ queryKey: ['charges'], queryFn: fetchCharges })
}

export function useCreerCharge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (charge: NouvelleCharge) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('charges')
        .insert({ ...charge, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charges'] })
      toast.success('Charge ajoutée !')
    },
    onError: () => toast.error('Erreur lors de la création'),
  })
}

export function useModifierCharge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Charge> & { id: string }) => {
      const supabase = createClient()
      const { error } = await supabase.from('charges').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charges'] })
      toast.success('Charge mise à jour')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })
}

export function useSupprimerCharge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('charges').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['charges'] })
      const precedent = queryClient.getQueryData<Charge[]>(['charges'])
      queryClient.setQueryData<Charge[]>(['charges'], old => old?.filter(c => c.id !== id) ?? [])
      return { precedent }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['charges'], ctx?.precedent)
      toast.error('Erreur lors de la suppression')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charges'] })
      toast.success('Charge supprimée')
    },
  })
}

export function useToggleStatutCharge() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, statut }: { id: string; statut: 'paye' | 'en_attente' }) => {
      const supabase = createClient()
      const { error } = await supabase.from('charges').update({ statut }).eq('id', id)
      if (error) throw error
    },
    onMutate: async ({ id, statut }) => {
      await queryClient.cancelQueries({ queryKey: ['charges'] })
      const precedent = queryClient.getQueryData<Charge[]>(['charges'])
      queryClient.setQueryData<Charge[]>(['charges'], old =>
        old?.map(c => c.id === id ? { ...c, statut } : c) ?? []
      )
      return { precedent }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['charges'], ctx?.precedent)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['charges'] }),
  })
}
