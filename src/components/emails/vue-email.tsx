'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Reply, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { EmailDetail } from '@/hooks/use-gmail'

interface Props {
  email: EmailDetail | null
  onFermer: () => void
  onRepondre: (email: EmailDetail, texte: string) => Promise<boolean>
}

export function VueEmail({ email, onFermer, onRepondre }: Props) {
  const [modeReponse, setModeReponse] = useState(false)
  const [texteReponse, setTexteReponse] = useState('')
  const [envoi, setEnvoi] = useState(false)

  async function envoyer() {
    if (!email || !texteReponse.trim()) return
    setEnvoi(true)
    const ok = await onRepondre(email, texteReponse)
    setEnvoi(false)
    if (ok) {
      toast.success('Réponse envoyée !')
      setTexteReponse('')
      setModeReponse(false)
      onFermer()
    } else {
      toast.error('Erreur lors de l\'envoi')
    }
  }

  if (!email) return null

  return (
    <Dialog open={!!email} onOpenChange={(o) => !o && onFermer()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <button onClick={onFermer} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{email.sujet}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              De : {email.expediteur} &lt;{email.expediteurEmail}&gt;
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setModeReponse(!modeReponse)}
            className="shrink-0 gap-1.5 text-xs"
          >
            <Reply className="w-3.5 h-3.5" />
            Répondre
          </Button>
        </div>

        {/* Corps */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {email.corps ? (
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-sm"
              dangerouslySetInnerHTML={{ __html: email.corps }}
            />
          ) : (
            <p className="text-gray-400 dark:text-gray-500 text-sm italic">(Corps vide)</p>
          )}
        </div>

        {/* Zone de réponse */}
        {modeReponse && (
          <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-4 space-y-3 shrink-0">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Répondre à : <span className="font-medium">{email.expediteurEmail}</span>
            </p>
            <Textarea
              placeholder="Écris ta réponse..."
              value={texteReponse}
              onChange={e => setTexteReponse(e.target.value)}
              rows={4}
              className="resize-none text-sm"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => { setModeReponse(false); setTexteReponse('') }}>
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={envoyer}
                disabled={!texteReponse.trim() || envoi}
                className="gap-1.5"
              >
                {envoi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Envoyer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
