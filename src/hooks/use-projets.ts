'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Projet, NouveauProjet } from '@/types'
import { logActivite } from '@/lib/activite'

async function fetchProjets(): Promise<Projet[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('projets')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export function useProjets() {
  return useQuery({ queryKey: ['projets'], queryFn: fetchProjets })
}

export function useCreerProjet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (projet: NouveauProjet) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('projets')
        .insert({ ...projet, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projets'] })
      toast.success('Projet créé !')
      logActivite('projet', `Nouveau projet : ${data.titre}`)
    },
    onError: () => toast.error('Erreur lors de la création'),
  })
}

export function useModifierProjet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Projet> & { id: string }) => {
      const supabase = createClient()
      const { error } = await supabase.from('projets').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projets'] })
      toast.success('Projet mis à jour')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })
}

export function useSupprimerProjet() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('projets').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['projets'] })
      const precedent = queryClient.getQueryData<Projet[]>(['projets'])
      queryClient.setQueryData<Projet[]>(['projets'], old => old?.filter(p => p.id !== id) ?? [])
      return { precedent }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['projets'], ctx?.precedent)
      toast.error('Erreur lors de la suppression')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projets'] })
      toast.success('Projet supprimé')
    },
  })
}
