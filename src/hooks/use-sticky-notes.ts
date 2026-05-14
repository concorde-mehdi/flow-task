'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { StickyNote, CouleurNote } from '@/types'

async function fetchStickyNotes(): Promise<StickyNote[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sticky_notes')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export function useStickyNotes() {
  return useQuery({ queryKey: ['sticky_notes'], queryFn: fetchStickyNotes })
}

export function useCreerStickyNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (couleur: CouleurNote) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('sticky_notes')
        .insert({ user_id: user!.id, contenu: '', couleur })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sticky_notes'] }),
  })
}

export function useMettreAJourStickyNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, contenu }: { id: string; contenu: string }) => {
      const supabase = createClient()
      const { error } = await supabase
        .from('sticky_notes')
        .update({ contenu, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sticky_notes'] }),
  })
}

export function useSupprimerStickyNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('sticky_notes').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['sticky_notes'] })
      const precedent = queryClient.getQueryData<StickyNote[]>(['sticky_notes'])
      queryClient.setQueryData<StickyNote[]>(['sticky_notes'], old => old?.filter(n => n.id !== id) ?? [])
      return { precedent }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['sticky_notes'], ctx?.precedent)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sticky_notes'] }),
  })
}
