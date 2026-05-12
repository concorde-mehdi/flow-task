'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface EmailResume {
  id: string
  threadId: string
  sujet: string
  expediteur: string
  expediteurEmail: string
  date: string
  extrait: string
  lu: boolean
}

export interface EmailDetail extends EmailResume {
  corps: string
  messageId: string
  to: string
}

function parseExpediteur(from: string): { nom: string; email: string } {
  const match = from.match(/^"?([^"<]*)"?\s*<([^>]+)>/)
  if (match) return { nom: match[1].trim() || match[2], email: match[2] }
  return { nom: from, email: from }
}

function decodeBase64(str: string): string {
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    return decodeURIComponent(
      atob(base64).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')
    )
  } catch {
    return ''
  }
}

function extraireCorps(payload: any): string {
  if (!payload) return ''
  if (payload.mimeType === 'text/html' && payload.body?.data) {
    return decodeBase64(payload.body.data)
  }
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    const texte = decodeBase64(payload.body.data)
    return texte.replace(/\n/g, '<br>')
  }
  if (payload.parts) {
    const html = payload.parts.find((p: any) => p.mimeType === 'text/html')
    if (html?.body?.data) return decodeBase64(html.body.data)
    const plain = payload.parts.find((p: any) => p.mimeType === 'text/plain')
    if (plain?.body?.data) {
      return decodeBase64(plain.body.data).replace(/\n/g, '<br>')
    }
    for (const part of payload.parts) {
      const corps = extraireCorps(part)
      if (corps) return corps
    }
  }
  return ''
}

export function useGmail() {
  const [emails, setEmails] = useState<EmailResume[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<'no_token' | 'token_expired' | 'no_scope' | 'api_error' | null>(null)
  const [token, setToken] = useState<string | null>(null)

  const fetchEmails = useCallback(async (accessToken: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const listRes = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&labelIds=INBOX',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      if (listRes.status === 401) { setError('token_expired'); return }
      if (listRes.status === 403) { setError('no_scope'); return }
      if (!listRes.ok) { setError('api_error'); return }

      const listData = await listRes.json()
      if (!listData.messages) { setEmails([]); return }

      const details = await Promise.all(
        listData.messages.slice(0, 20).map(async (msg: { id: string }) => {
          const res = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          )
          return res.json()
        })
      )

      const parsed: EmailResume[] = details.map((msg: any) => {
        const headers: any[] = msg.payload?.headers ?? []
        const get = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value ?? ''
        const { nom, email } = parseExpediteur(get('From'))
        return {
          id: msg.id,
          threadId: msg.threadId,
          sujet: get('Subject') || '(sans objet)',
          expediteur: nom,
          expediteurEmail: email,
          date: get('Date'),
          extrait: msg.snippet ?? '',
          lu: !msg.labelIds?.includes('UNREAD'),
        }
      })
      setEmails(parsed)
    } catch {
      setError('api_error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.provider_token) {
        setError('no_token')
        setIsLoading(false)
        return
      }
      setToken(session.provider_token)
      await fetchEmails(session.provider_token)
    }
    init()
  }, [fetchEmails])

  async function fetchDetail(id: string): Promise<EmailDetail | null> {
    if (!token) return null
    try {
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!res.ok) return null
      const msg = await res.json()
      const headers: any[] = msg.payload?.headers ?? []
      const get = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value ?? ''
      const { nom, email } = parseExpediteur(get('From'))
      return {
        id: msg.id,
        threadId: msg.threadId,
        sujet: get('Subject') || '(sans objet)',
        expediteur: nom,
        expediteurEmail: email,
        date: get('Date'),
        extrait: msg.snippet ?? '',
        lu: !msg.labelIds?.includes('UNREAD'),
        corps: extraireCorps(msg.payload),
        messageId: get('Message-ID'),
        to: get('To'),
      }
    } catch {
      return null
    }
  }

  async function envoyerReponse(detail: EmailDetail, texte: string): Promise<boolean> {
    if (!token) return false
    const sujet = detail.sujet.startsWith('Re:') ? detail.sujet : `Re: ${detail.sujet}`
    const mime = [
      `To: ${detail.expediteurEmail}`,
      `Subject: ${sujet}`,
      `In-Reply-To: ${detail.messageId}`,
      `References: ${detail.messageId}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      texte,
    ].join('\r\n')

    const raw = btoa(unescape(encodeURIComponent(mime)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

    try {
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/send`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ raw, threadId: detail.threadId }),
        }
      )
      return res.ok
    } catch {
      return false
    }
  }

  return {
    emails,
    isLoading,
    error,
    refetch: () => token && fetchEmails(token),
    fetchDetail,
    envoyerReponse,
  }
}
