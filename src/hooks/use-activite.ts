'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Activite } from '@/types'

async function fetchActivite(): Promise<Activite[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('activite')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30)
  if (error) throw error
  return data ?? []
}

export function useActivite() {
  return useQuery({ queryKey: ['activite'], queryFn: fetchActivite, staleTime: 30_000 })
}
