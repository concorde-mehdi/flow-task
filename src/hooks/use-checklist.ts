'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface ChecklistItem {
  id: string
  user_id: string
  titre: string
  ordre: number
  created_at: string
}

export interface ChecklistCoche {
  id: string
  user_id: string
  item_id: string
  date_jour: string
}

const QK_ITEMS = 'checklist_items'
const QK_COCHES = 'checklist_coches'

function dateAujourdHui() {
  return new Date().toISOString().split('T')[0]
}

export function useChecklistItems() {
  return useQuery({
    queryKey: [QK_ITEMS],
    queryFn: async (): Promise<ChecklistItem[]> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .order('ordre', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useChecklistCoches() {
  return useQuery({
    queryKey: [QK_COCHES, dateAujourdHui()],
    queryFn: async (): Promise<ChecklistCoche[]> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('checklist_coches')
        .select('*')
        .eq('date_jour', dateAujourdHui())
      if (error) throw error
      return data ?? []
    },
  })
}

export function useAjouterItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (titre: string) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')
      const { data: existing } = await supabase
        .from('checklist_items')
        .select('ordre')
        .eq('user_id', user.id)
        .order('ordre', { ascending: false })
        .limit(1)
        .single()
      const ordre = (existing?.ordre ?? -1) + 1
      const { error } = await supabase.from('checklist_items').insert({
        user_id: user.id,
        titre,
        ordre,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK_ITEMS] }),
  })
}

export function useSupprimerItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('checklist_items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK_ITEMS] })
      qc.invalidateQueries({ queryKey: [QK_COCHES] })
    },
  })
}

export function useToggleCoche() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ itemId, estCoche }: { itemId: string; estCoche: boolean }) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')
      if (estCoche) {
        await supabase
          .from('checklist_coches')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', itemId)
          .eq('date_jour', dateAujourdHui())
      } else {
        await supabase.from('checklist_coches').insert({
          user_id: user.id,
          item_id: itemId,
          date_jour: dateAujourdHui(),
        })
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK_COCHES] }),
  })
}
