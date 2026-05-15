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
  const size = isFab ? 24 : 20

  function handleClick() {
    if (etat === 'listening') arreter()
    else if (etat === 'idle') demarrer()
  }

  const title =
    etat === 'listening' ? 'Écoute… cliquer pour arrêter'
    : etat === 'processing' ? (transcript || 'Traitement en cours…')
    : 'Commande vocale (darja/français)'

  return (
    <div className={cn('relative inline-flex flex-col items-center justify-center', className)}>

      {/* ── Anneaux pulse écoute (double ring) ── */}
      <AnimatePresence>
        {etat === 'listening' && (
          <>
            <motion.span
              key="ring1"
              className="absolute inset-0 rounded-full border-2 border-red-400 pointer-events-none"
              initial={{ scale: 1, opacity: 0.9 }}
              animate={{ scale: isFab ? 1.8 : 2.0, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.span
              key="ring2"
              className="absolute inset-0 rounded-full border-2 border-red-300 pointer-events-none"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: isFab ? 2.3 : 2.6, opacity: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut', delay: 0.35 }}
            />
          </>
        )}
      </AnimatePresence>

      {/* ── Anneau glow idle ── */}
      {etat === 'idle' && !isFab && (
        <motion.span
          className="absolute inset-0 rounded-xl bg-indigo-400/20 pointer-events-none"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.15, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* ── Bouton principal ── */}
      <motion.button
        onClick={handleClick}
        disabled={etat === 'processing' || etat === 'done' || etat === 'error'}
        title={title}
        aria-label={title}
        animate={
          etat === 'idle'
            ? { scale: [1, 1.06, 1] }
            : etat === 'listening'
            ? { scale: 1 }
            : { scale: 1 }
        }
        transition={
          etat === 'idle'
            ? { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.2 }
        }
        className={cn(
          'relative flex items-center justify-center outline-none select-none transition-colors duration-200',
          isFab
            ? 'w-14 h-14 rounded-full shadow-xl'
            : 'w-11 h-11 rounded-xl shadow-md',
          // Idle — gradient indigo/violet
          etat === 'idle' && 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700 active:scale-95',
          // Listening — rouge vif
          etat === 'listening' && 'bg-red-500 text-white shadow-red-500/40',
          // Processing
          etat === 'processing' && 'bg-indigo-400 text-white cursor-wait',
          // Done
          etat === 'done' && 'bg-green-500 text-white',
          // Error
          etat === 'error' && 'bg-red-500 text-white',
          isFab && (etat === 'idle') && 'shadow-indigo-500/50',
          isFab && (etat === 'listening') && 'shadow-red-500/50',
        )}
      >
        <AnimatePresence mode="wait">
          {etat === 'idle' && (
            <motion.span key="mic" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Mic size={size} strokeWidth={2} />
            </motion.span>
          )}
          {etat === 'listening' && (
            <motion.span key="micoff"
              initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: [1, 1.2, 1], opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}
              transition={{ scale: { duration: 0.8, repeat: Infinity }, opacity: { duration: 0.15 } }}
            >
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
      </motion.button>

      {/* Transcript capturé pendant processing */}
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
