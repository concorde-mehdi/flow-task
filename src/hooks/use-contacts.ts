'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Contact, NouveauContact } from '@/types'

async function fetchContacts(): Promise<Contact[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('nom', { ascending: true })
  if (error) throw error
  return data ?? []
}

export function useContacts() {
  return useQuery({ queryKey: ['contacts'], queryFn: fetchContacts })
}

export function useCreerContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (contact: NouveauContact) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('contacts')
        .insert({ ...contact, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Contact ajouté !')
    },
    onError: () => toast.error('Erreur lors de la création'),
  })
}

export function useModifierContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Contact> & { id: string }) => {
      const supabase = createClient()
      const { error } = await supabase.from('contacts').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Contact mis à jour')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })
}

export function useSupprimerContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('contacts').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['contacts'] })
      const precedent = queryClient.getQueryData<Contact[]>(['contacts'])
      queryClient.setQueryData<Contact[]>(['contacts'], old => old?.filter(c => c.id !== id) ?? [])
      return { precedent }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['contacts'], ctx?.precedent)
      toast.error('Erreur lors de la suppression')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Contact supprimé')
    },
  })
}
