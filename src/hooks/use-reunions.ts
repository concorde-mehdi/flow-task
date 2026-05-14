'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Reunion, NouvelleReunion } from '@/types'
import { logActivite } from '@/lib/activite'

async function fetchReunions(): Promise<Reunion[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('reunions')
    .select('*')
    .order('date_heure', { ascending: true })
  if (error) throw error
  return data ?? []
}

export function useReunions() {
  return useQuery({ queryKey: ['reunions'], queryFn: fetchReunions })
}

export function useCreerReunion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (reunion: NouvelleReunion) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('reunions')
        .insert({ ...reunion, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reunions'] })
      toast.success('Réunion ajoutée !')
      logActivite('reunion', `Réunion planifiée : ${data.titre}`)
    },
    onError: () => toast.error('Erreur lors de la création'),
  })
}

export function useModifierReunion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Reunion> & { id: string }) => {
      const supabase = createClient()
      const { error } = await supabase.from('reunions').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reunions'] })
      toast.success('Réunion mise à jour')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })
}

export function useSupprimerReunion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('reunions').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['reunions'] })
      const precedent = queryClient.getQueryData<Reunion[]>(['reunions'])
      queryClient.setQueryData<Reunion[]>(['reunions'], old => old?.filter(r => r.id !== id) ?? [])
      return { precedent }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['reunions'], ctx?.precedent)
      toast.error('Erreur lors de la suppression')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reunions'] })
      toast.success('Réunion supprimée')
    },
  })
}
