'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { chiffrer, dechiffrer, creerSentinel, verifierPin } from '@/lib/crypto'
import type { CoffreMdp, NouveauCoffreMdp, CategorieCoffre } from '@/types'

const QK = 'coffre_mdp'

export function useCoffre() {
  return useQuery({
    queryKey: [QK],
    queryFn: async (): Promise<CoffreMdp[]> => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('coffre_mdp')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useAjouterMdp() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ entry, pin }: { entry: NouveauCoffreMdp; pin: string }) => {
      const { chiffre, iv, sel } = await chiffrer(entry.mdp_clair, pin)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')
      const { error } = await supabase.from('coffre_mdp').insert({
        user_id: user.id,
        titre: entry.titre,
        identifiant: entry.identifiant,
        mdp_chiffre: chiffre,
        iv,
        sel,
        url: entry.url,
        categorie: entry.categorie,
        notes: entry.notes,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  })
}

export function useSupprimerMdp() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('coffre_mdp').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  })
}

export async function dechiffrerMdp(entry: CoffreMdp, pin: string): Promise<string> {
  return dechiffrer(entry.mdp_chiffre, entry.iv, entry.sel, pin)
}

// Sentinel management
export async function getPinSentinel() {
  const supabase = createClient()
  const { data } = await supabase.from('coffre_pin_sentinel').select('*').single()
  return data as { sentinel_chiffre: string; sentinel_iv: string; sentinel_sel: string } | null
}

export async function setPinSentinel(pin: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Non authentifié')
  const { chiffre, iv, sel } = await creerSentinel(pin)
  const { error } = await supabase.from('coffre_pin_sentinel').upsert({
    user_id: user.id,
    sentinel_chiffre: chiffre,
    sentinel_iv: iv,
    sentinel_sel: sel,
  })
  if (error) throw error
}

export async function verifierPinCoffre(pin: string): Promise<boolean> {
  const sentinel = await getPinSentinel()
  if (!sentinel) return false
  return verifierPin(pin, {
    chiffre: sentinel.sentinel_chiffre,
    iv: sentinel.sentinel_iv,
    sel: sentinel.sentinel_sel,
  })
}

export { verifierPin, CategorieCoffre }
