'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { SiteMonitore, NouveauSiteMonitore, StatutSite } from '@/types'

async function fetchSites(): Promise<SiteMonitore[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sites_monitores')
    .select('*')
    .order('titre', { ascending: true })
  if (error) throw error
  return data ?? []
}

export function useSitesMonitores() {
  return useQuery({ queryKey: ['sites_monitores'], queryFn: fetchSites })
}

export function useCreerSite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (site: NouveauSiteMonitore) => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('sites_monitores')
        .insert({ ...site, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites_monitores'] })
      toast.success('Site ajouté !')
    },
    onError: () => toast.error('Erreur lors de la création'),
  })
}

export function useModifierSite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SiteMonitore> & { id: string }) => {
      const supabase = createClient()
      const { error } = await supabase.from('sites_monitores').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sites_monitores'] }),
    onError: () => toast.error('Erreur mise à jour'),
  })
}

export function useSupprimerSite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('sites_monitores').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['sites_monitores'] })
      const precedent = queryClient.getQueryData<SiteMonitore[]>(['sites_monitores'])
      queryClient.setQueryData<SiteMonitore[]>(['sites_monitores'], old => old?.filter(s => s.id !== id) ?? [])
      return { precedent }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['sites_monitores'], ctx?.precedent)
      toast.error('Erreur lors de la suppression')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites_monitores'] })
      toast.success('Site supprimé')
    },
  })
}

export async function verifierSite(id: string, url: string): Promise<{ up: boolean; statusCode: number | null; ms: number }> {
  const res = await fetch('/api/check-site', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  return res.json()
}

export function useVerifierTousSites() {
  const queryClient = useQueryClient()
  const { mutateAsync: modifier } = useModifierSite()

  return useMutation({
    mutationFn: async (sites: SiteMonitore[]) => {
      const resultats = await Promise.allSettled(
        sites.map(async (site) => {
          const result = await verifierSite(site.id, site.url)
          const statut: StatutSite = result.up ? 'en_ligne' : 'hors_ligne'
          await modifier({
            id: site.id,
            statut,
            derniere_verification: new Date().toISOString(),
          })
          return { ...site, statut }
        })
      )
      return resultats
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites_monitores'] })
      toast.success('Vérification terminée')
    },
    onError: () => toast.error('Erreur lors de la vérification'),
  })
}
