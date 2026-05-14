'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Lien, NouveauLien } from '@/types'

async function fetchLiens(): Promise<Lien[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('liens')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export function useLiens() {
  return useQuery({ queryKey: ['liens'], queryFn: fetchLiens })
}

export function useCreerLien() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (lien: NouveauLien) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('liens')
        .insert({ ...lien, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liens'] })
      toast.success('Lien ajouté !')
    },
    onError: () => toast.error('Erreur lors de la création'),
  })
}

export function useModifierLien() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Lien> & { id: string }) => {
      const supabase = createClient()
      const { error } = await supabase.from('liens').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liens'] })
      toast.success('Lien mis à jour')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })
}

export function useSupprimerLien() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('liens').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['liens'] })
      const precedent = queryClient.getQueryData<Lien[]>(['liens'])
      queryClient.setQueryData<Lien[]>(['liens'], old => old?.filter(l => l.id !== id) ?? [])
      return { precedent }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['liens'], ctx?.precedent)
      toast.error('Erreur lors de la suppression')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['liens'] }),
  })
}

export function useEpinglerLien() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, is_raccourci }: { id: string; is_raccourci: boolean }) => {
      const supabase = createClient()
      const { error } = await supabase.from('liens').update({ is_raccourci }).eq('id', id)
      if (error) throw error
    },
    onMutate: async ({ id, is_raccourci }) => {
      await queryClient.cancelQueries({ queryKey: ['liens'] })
      const precedent = queryClient.getQueryData<Lien[]>(['liens'])
      queryClient.setQueryData<Lien[]>(['liens'], old =>
        old?.map(l => l.id === id ? { ...l, is_raccourci } : l) ?? []
      )
      return { precedent }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['liens'], ctx?.precedent)
      toast.error('Erreur')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['liens'] }),
  })
}

export function useMarquerConsulte() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('liens').update({ consulte: true }).eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['liens'] })
      const precedent = queryClient.getQueryData<Lien[]>(['liens'])
      queryClient.setQueryData<Lien[]>(['liens'], old =>
        old?.map(l => l.id === id ? { ...l, consulte: true } : l) ?? []
      )
      return { precedent }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['liens'], ctx?.precedent)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['liens'] }),
  })
}
