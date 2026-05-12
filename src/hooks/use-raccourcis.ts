'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Raccourci, NouveauRaccourci } from '@/types'

async function fetchRaccourcis(): Promise<Raccourci[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('raccourcis')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export function useRaccourcis() {
  return useQuery({ queryKey: ['raccourcis'], queryFn: fetchRaccourcis })
}

export function useCreerRaccourci() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (raccourci: NouveauRaccourci) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('raccourcis')
        .insert({ ...raccourci, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raccourcis'] })
      toast.success('Raccourci ajouté !')
    },
    onError: () => toast.error('Erreur lors de la création'),
  })
}

export function useSupprimerRaccourci() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('raccourcis').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['raccourcis'] })
      const precedent = queryClient.getQueryData<Raccourci[]>(['raccourcis'])
      queryClient.setQueryData<Raccourci[]>(['raccourcis'], old => old?.filter(r => r.id !== id) ?? [])
      return { precedent }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['raccourcis'], ctx?.precedent)
      toast.error('Erreur lors de la suppression')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['raccourcis'] }),
  })
}
