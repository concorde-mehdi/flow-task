'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { LigneMobile, NouvelleLigneMobile } from '@/types'

async function fetchLignes(): Promise<LigneMobile[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('lignes_mobiles')
    .select('*')
    .order('numero', { ascending: true })
  if (error) throw error
  return data ?? []
}

export function useLignesMobiles() {
  return useQuery({ queryKey: ['lignes_mobiles'], queryFn: fetchLignes })
}

export function useCreerLigne() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ligne: NouvelleLigneMobile) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('lignes_mobiles')
        .insert({ ...ligne, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lignes_mobiles'] })
      toast.success('Ligne ajoutée !')
    },
    onError: () => toast.error('Erreur lors de la création'),
  })
}

export function useModifierLigne() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LigneMobile> & { id: string }) => {
      const supabase = createClient()
      const { error } = await supabase.from('lignes_mobiles').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lignes_mobiles'] })
      toast.success('Ligne mise à jour')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })
}

export function useSupprimerLigne() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('lignes_mobiles').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['lignes_mobiles'] })
      const prev = queryClient.getQueryData<LigneMobile[]>(['lignes_mobiles'])
      queryClient.setQueryData<LigneMobile[]>(['lignes_mobiles'], old => old?.filter(l => l.id !== id) ?? [])
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['lignes_mobiles'], ctx?.prev)
      toast.error('Erreur lors de la suppression')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lignes_mobiles'] })
      toast.success('Ligne supprimée')
    },
  })
}

export function useImporterLignes() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (lignes: NouvelleLigneMobile[]) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const payload = lignes.map(l => ({ ...l, user_id: user!.id }))
      const { error } = await supabase.from('lignes_mobiles').insert(payload)
      if (error) throw error
      return payload.length
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['lignes_mobiles'] })
      toast.success(`${count} ligne(s) importée(s) avec succès !`)
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Erreur'
      toast.error(`Erreur import : ${msg}`)
    },
  })
}
