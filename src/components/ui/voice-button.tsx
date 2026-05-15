'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Loader2, Check, AlertCircle } from 'lucide-react'
import { useVoiceAgent } from '@/hooks/use-voice-agent'
import { cn } from '@/lib/utils'

interface VoiceButtonProps {
  variant?: 'fab' | 'icon'
  className?: string
}

export function VoiceButton({ variant = 'icon', className }: VoiceButtonProps) {
  const { etat, transcript, demarrer, arreter } = useVoiceAgent()
  const isFab = variant === 'fab'
  const size = isFab ? 22 : 18

  function handleClick() {
    if (etat === 'listening') arreter()
    else if (etat === 'idle') demarrer()
  }

  const title =
    etat === 'listening' ? 'Écoute… cliquer pour arrêter'
    : etat === 'processing' ? (transcript || 'Traitement en cours…')
    : 'Commande vocale'

  return (
    <div className={cn('relative inline-flex flex-col items-center justify-center', className)}>
      {/* Anneau pulse pendant l'écoute */}
      <AnimatePresence>
        {etat === 'listening' && (
          <motion.span
            key="ring"
            className={cn(
              'absolute rounded-full border-2 border-red-400 pointer-events-none',
              isFab ? 'inset-0' : 'inset-0',
            )}
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: isFab ? 1.7 : 1.9, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      <button
        onClick={handleClick}
        disabled={etat === 'processing' || etat === 'done' || etat === 'error'}
        title={title}
        aria-label={title}
        className={cn(
          'relative flex items-center justify-center transition-all duration-200 outline-none select-none',
          isFab
            ? 'w-14 h-14 rounded-full shadow-lg'
            : 'w-9 h-9 rounded-xl',
          etat === 'idle' && isFab && 'bg-indigo-500 hover:bg-indigo-600 active:scale-95 text-white',
          etat === 'idle' && !isFab && 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
          etat === 'listening' && isFab && 'bg-red-500 text-white',
          etat === 'listening' && !isFab && 'text-red-500 bg-red-50 dark:bg-red-950/30',
          etat === 'processing' && isFab && 'bg-indigo-400 text-white cursor-wait',
          etat === 'processing' && !isFab && 'text-indigo-400 cursor-wait',
          etat === 'done' && isFab && 'bg-green-500 text-white',
          etat === 'done' && !isFab && 'text-green-500',
          etat === 'error' && isFab && 'bg-red-500 text-white',
          etat === 'error' && !isFab && 'text-red-500',
        )}
      >
        <AnimatePresence mode="wait">
          {etat === 'idle' && (
            <motion.span key="mic" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Mic size={size} strokeWidth={2} />
            </motion.span>
          )}
          {etat === 'listening' && (
            <motion.span key="micoff" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MicOff size={size} strokeWidth={2} />
            </motion.span>
          )}
          {etat === 'processing' && (
            <motion.span key="spin" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Loader2 size={size} className="animate-spin" />
            </motion.span>
          )}
          {etat === 'done' && (
            <motion.span key="check" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Check size={size} strokeWidth={2.5} />
            </motion.span>
          )}
          {etat === 'error' && (
            <motion.span key="err" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} transition={{ duration: 0.15 }}>
              <AlertCircle size={size} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Transcript capturé — affiché pendant processing pour debug */}
      <AnimatePresence>
        {etat === 'processing' && transcript && (
          <motion.p
            key="transcript"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full mt-1.5 text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap max-w-[180px] truncate text-center pointer-events-none"
          >
            {transcript}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
