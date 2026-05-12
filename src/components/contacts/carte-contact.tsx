'use client'

import { motion } from 'framer-motion'
import { Phone, Mail, Trash2, Pencil } from 'lucide-react'
import { useSupprimerContact } from '@/hooks/use-contacts'
import type { Contact } from '@/types'

const COULEURS = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500']
function couleurAvatar(nom: string): string {
  let hash = 0
  for (let i = 0; i < nom.length; i++) hash = nom.charCodeAt(i) + ((hash << 5) - hash)
  return COULEURS[Math.abs(hash) % COULEURS.length]
}
function initiales(nom: string): string {
  return nom.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase()
}

interface Props {
  contact: Contact
  onModifier?: (contact: Contact) => void
}

export function CarteContact({ contact, onModifier }: Props) {
  const { mutate: supprimer } = useSupprimerContact()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group flex items-center gap-3 p-4 rounded-xl border bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800/50 transition-all"
    >
      <div className={`w-10 h-10 rounded-full ${couleurAvatar(contact.nom)} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
        {initiales(contact.nom)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{contact.nom}</p>
        {contact.poste && <p className="text-xs text-blue-500 dark:text-blue-400 truncate">{contact.poste}</p>}
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {contact.telephone && (
            <a href={`tel:${contact.telephone}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors">
              <Phone className="w-3 h-3" />{contact.telephone}
            </a>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
              <Mail className="w-3 h-3" />{contact.email}
            </a>
          )}
        </div>
        {contact.notes && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">{contact.notes}</p>}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
        <button onClick={() => onModifier?.(contact)} className="text-gray-300 hover:text-blue-500 dark:text-gray-700 dark:hover:text-blue-400 transition-colors p-1">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => supprimer(contact.id)} className="text-gray-300 hover:text-red-500 dark:text-gray-700 dark:hover:text-red-400 transition-colors p-1">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  )
}
