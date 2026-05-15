'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { parseVoiceCommand } from '@/lib/voice-parser'
import { useCreerTache } from '@/hooks/use-taches'
import { useCreerReunion } from '@/hooks/use-reunions'
import type { Priorite } from '@/types'

export type EtatVoix = 'idle' | 'listening' | 'processing' | 'done' | 'error'

export function useVoiceAgent() {
  const [etat, setEtat] = useState<EtatVoix>('idle')
  const [transcript, setTranscript] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const hasResultRef = useRef(false)
  const router = useRouter()

  const { mutateAsync: creerTache } = useCreerTache()
  const { mutateAsync: creerReunion } = useCreerReunion()

  const dispatch = useCallback(async (action: string, params: Record<string, unknown>) => {
    try {
      switch (action) {
        case 'creer_tache': {
          await creerTache({
            titre: String(params.titre ?? 'Nouvelle tâche'),
            description: null,
            deadline: (params.deadline as string) ?? null,
            priorite: (params.priorite as Priorite) ?? 'Moyenne',
            tags: [],
            statut: false,
            is_quotidienne: false,
          })
          break
        }

        case 'creer_reunion': {
          await creerReunion({
            titre: String(params.titre ?? 'Nouvelle réunion'),
            date_heure: String(params.date_heure),
            lieu: (params.lieu as string) ?? null,
            description: null,
            duree_minutes: (params.duree_minutes as number) ?? 60,
          })
          break
        }

        case 'creer_note': {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { error } = await supabase.from('sticky_notes').insert({
              user_id: user.id,
              contenu: String(params.contenu ?? ''),
              couleur: 'yellow',
            })
            if (error) throw error
          }
          toast.success('Note créée !')
          break
        }

        case 'naviguer': {
          const page = String(params.page ?? 'dashboard')
          router.push(`/${page}`)
          toast.success(`Navigation vers ${page}`)
          break
        }

        case 'telegram': {
          const res = await fetch('/api/telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: String(params.message ?? '') }),
          })
          if (res.ok) {
            toast.success('Message Telegram envoyé !')
          } else {
            throw new Error('Telegram error')
          }
          break
        }

        case 'lire': {
          const type = String(params.type ?? '')
          const dest: Record<string, string> = {
            taches_urgentes: '/taches',
            reunions_aujourd_hui: '/calendrier',
            emails_non_lus: '/emails',
          }
          const labels: Record<string, string> = {
            taches_urgentes: 'Tâches urgentes',
            reunions_aujourd_hui: 'Agenda du jour',
            emails_non_lus: 'Emails non lus',
          }
          if (dest[type]) {
            router.push(dest[type])
            toast.success(labels[type])
          }
          break
        }

        default: {
          toast.error(`Commande non comprise : "${String(params.message_utilisateur ?? transcript)}"`)
          setEtat('error')
          setTimeout(() => setEtat('idle'), 1500)
          return
        }
      }

      setEtat('done')
      setTimeout(() => setEtat('idle'), 1500)
    } catch {
      setEtat('error')
      toast.error('Erreur lors de l\'exécution')
      setTimeout(() => setEtat('idle'), 1500)
    }
  }, [creerTache, creerReunion, router, transcript])

  const traiterTranscript = useCallback(async (text: string) => {
    setTranscript(text)
    setEtat('processing')
    toast.info(`🎤 "${text}"`, { duration: 4000, id: 'transcript' })
    try {
      const { action, params } = parseVoiceCommand(text)
      await dispatch(action, params)
    } catch {
      setEtat('error')
      toast.error('Erreur de traitement')
      setTimeout(() => setEtat('idle'), 1500)
    }
  }, [dispatch])

  const demarrer = useCallback(() => {
    if (etat !== 'idle') return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SR) {
      toast.error('Reconnaissance vocale non disponible — utilisez Chrome')
      return
    }

    hasResultRef.current = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new SR() as any
    recognition.lang = 'fr-FR'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setEtat('listening')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      hasResultRef.current = true
      const text = event.results[0]?.[0]?.transcript ?? ''
      if (text) traiterTranscript(text)
    }

    recognition.onerror = () => {
      setEtat('error')
      toast.error('Erreur microphone — vérifiez les permissions')
      setTimeout(() => setEtat('idle'), 1500)
    }

    recognition.onend = () => {
      if (!hasResultRef.current) setEtat('idle')
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [etat, traiterTranscript])

  const arreter = useCallback(() => {
    recognitionRef.current?.stop()
    setEtat('idle')
  }, [])

  return { etat, transcript, demarrer, arreter }
}
