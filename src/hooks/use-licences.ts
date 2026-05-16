'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Licence, NouvelleLicence } from '@/types'

async function fetchLicences(): Promise<Licence[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('licences')
    .select('*')
    .order('date_expiration', { ascending: true, nullsFirst: false })
  if (error) throw error
  return data ?? []
}

export function useLicences() {
  return useQuery({ queryKey: ['licences'], queryFn: fetchLicences })
}

export function useCreerLicence() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (licence: NouvelleLicence) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('licences')
        .insert({ ...licence, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licences'] })
      toast.success('Licence ajoutée !')
    },
    onError: () => toast.error('Erreur lors de la création'),
  })
}

export function useModifierLicence() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Licence> & { id: string }) => {
      const supabase = createClient()
      const { error } = await supabase.from('licences').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licences'] })
      toast.success('Licence mise à jour')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })
}

export function useSupprimerLicence() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('licences').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['licences'] })
      const precedent = queryClient.getQueryData<Licence[]>(['licences'])
      queryClient.setQueryData<Licence[]>(['licences'], old => old?.filter(l => l.id !== id) ?? [])
      return { precedent }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['licences'], ctx?.precedent)
      toast.error('Erreur lors de la suppression')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licences'] })
      toast.success('Licence supprimée')
    },
  })
}

export function joursAvantExpiration(date: string | null): number | null {
  if (!date) return null
  const diff = new Date(date).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
