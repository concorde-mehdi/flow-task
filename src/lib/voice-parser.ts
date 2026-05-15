export interface ActionVocale {
  action: 'creer_tache' | 'creer_reunion' | 'creer_note' | 'naviguer' | 'telegram' | 'lire' | 'inconnu'
  params: Record<string, unknown>
}

// ── Darja tunisienne ──────────────────────────────────────────────────────────

const DARJA_MAP: Record<string, string> = {
  // Verbes de commande
  'zid': 'crée', 'hot': 'crée', '7ot': 'crée', 'dir': 'crée', 'hott': 'crée',
  'chouf': 'affiche', 'chof': 'affiche', 'chuf': 'affiche',
  'mchi': 'aller', 'roh': 'aller', 'rouh': 'aller',
  'b3ath': 'envoie', 'ba3ath': 'envoie', 'betch': 'envoie', 'b3at': 'envoie',
  // Dates
  'dm2': 'demain', 'dema': 'demain', 'ghoudwa': 'demain', 'ghodwa': 'demain',
  'youma': "aujourd'hui", 'lyoum': "aujourd'hui", 'lioum': "aujourd'hui", 'loum': "aujourd'hui",
  // Connecteurs
  'mta3': 'de', 'mte3': 'de', 'bech': 'pour', 'mel': 'depuis',
  // Actions spécifiques
  '3ayet': 'appeler', 'klam': 'appeler', 'rissala': 'message',
}

// Regex fuzzy — Chrome transcrit les phonèmes arabes de façon approx.
const DARJA_FUZZY: [RegExp, string][] = [
  [/\bzi[dt]?\b/g, 'crée'],
  [/\bcho[uf]+\b|\bcha[uf]+\b|\bchau[fv]+\b|\bshuf\b/g, 'affiche'],
  [/\bh[o0]tt?\b|\bkh[o0]t\b/g, 'crée'],
  [/\bdm\s*2\b/g, 'demain'],
  [/\by[o0]uma?\b|\bli?[o0]um\b/g, "aujourd'hui"],
  [/\bmt[ae]3?\b/g, 'de'],
]

function normaliserDarja(t: string): string {
  let r = t
  for (const [re, rep] of DARJA_FUZZY) r = r.replace(re, rep)
  r = r.split(/\s+/).map(m => DARJA_MAP[m] ?? m).join(' ')
  return r
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const PAGES: Record<string, string> = {
  'dashboard': 'dashboard', 'accueil': 'dashboard', 'tableau de bord': 'dashboard', 'home': 'dashboard',
  'tâches': 'taches', 'taches': 'taches', 'liste des tâches': 'taches', 'tasks': 'taches',
  'agenda': 'calendrier', 'calendrier': 'calendrier', 'calendar': 'calendrier',
  'emails': 'emails', 'mail': 'emails', 'boîte mail': 'emails', 'messagerie': 'emails', 'mails': 'emails',
  'réunions': 'reunions', 'reunions': 'reunions', 'meetings': 'reunions',
  'contacts': 'contacts', 'annuaire': 'contacts', 'contact': 'contacts',
  'devis': 'devis',
  'matériel': 'materiel', 'materiel': 'materiel', 'stock': 'materiel',
  'documents': 'documents', 'fichiers': 'documents', 'document': 'documents',
  'charges': 'charges', 'factures': 'charges', 'dépenses': 'charges',
  'connexions': 'connexions', 'connexion': 'connexions', 'ordinateurs': 'connexions',
  'paramètres': 'parametres', 'parametres': 'parametres', 'settings': 'parametres', 'profil': 'parametres',
}

function extraireHeure(t: string): { h: number; m: number } | null {
  const m = t.match(/(?:à\s+)?(\d{1,2})\s*h\s*(\d{2})?/)
  if (m) return { h: parseInt(m[1]), m: parseInt(m[2] ?? '0') }
  return null
}

function appliquerHeure(d: Date, heure: { h: number; m: number } | null): Date {
  if (heure) d.setHours(heure.h, heure.m, 0, 0)
  else d.setHours(9, 0, 0, 0)
  return d
}

function extraireDate(t: string): string | null {
  const now = new Date()
  const heure = extraireHeure(t)

  if (/après[-\s]demain/.test(t)) {
    const d = new Date(now); d.setDate(d.getDate() + 2)
    return appliquerHeure(d, heure).toISOString()
  }
  if (/demain/.test(t)) {
    const d = new Date(now); d.setDate(d.getDate() + 1)
    return appliquerHeure(d, heure).toISOString()
  }

  const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
  for (let i = 0; i < JOURS.length; i++) {
    if (t.includes(JOURS[i])) {
      const d = new Date(now)
      const diff = ((i - d.getDay()) + 7) % 7 || 7
      d.setDate(d.getDate() + diff)
      return appliquerHeure(d, heure).toISOString()
    }
  }

  if (heure) {
    const d = new Date(now)
    return appliquerHeure(d, heure).toISOString()
  }

  return null
}

function extrairePriorite(t: string): 'Haute' | 'Moyenne' | 'Basse' {
  if (/urgent[e]?|critique|très\s+important[e]?/.test(t)) return 'Haute'
  if (/\bimportant[e]?\b/.test(t)) return 'Haute'
  if (/basse?\s+priorité|pas\s+urgent|peu\s+important/.test(t)) return 'Basse'
  return 'Moyenne'
}

function nettoyer(s: string, ...res: RegExp[]): string {
  let r = s
  for (const re of res) r = r.replace(re, ' ')
  return r.replace(/\s+/g, ' ').trim()
}

function cap(s: string) {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const RE_DATE = /demain|après[-\s]demain|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche/g
const RE_HEURE = /(?:à\s+)?\d{1,2}\s*h\s*\d{0,2}/g
const RE_PRIORITE = /urgent[e]?|important[e]?|critique|basse?\s+priorité|haute?\s+priorité|priorité\s+\w+/g

// ── Parser principal ──────────────────────────────────────────────────────────

export function parseVoiceCommand(transcript: string): ActionVocale {
  const raw = transcript.toLowerCase()
  const t = normaliserDarja(raw)   // darja → français avant tout

  // ── Telegram ──────────────────────────────────────────────
  const mTelegram = t.match(/^(?:envoie?r?|send)\s+(?:un\s+)?(?:message|telegram|sms|msg)\s+(.+)/)
  if (mTelegram) {
    return { action: 'telegram', params: { message: cap(mTelegram[1].trim()) } }
  }

  // ── Note / Mémo ───────────────────────────────────────────
  const mNote = t.match(/^(?:note|mémo?|memo)\s+(.+)/)
  if (mNote) {
    return { action: 'creer_note', params: { contenu: cap(mNote[1].trim()) } }
  }

  // ── Lire / Afficher ───────────────────────────────────────
  if (/tâches?\s+urgentes?|urgentes?\s+tâches?/.test(t)) {
    return { action: 'lire', params: { type: 'taches_urgentes' } }
  }
  if (/(?:réunions?|agenda|meetings?)\s+(?:d.?aujourd|aujourd)|aujourd.+réunion/.test(t)) {
    return { action: 'lire', params: { type: 'reunions_aujourd_hui' } }
  }
  if (/emails?\s+non\s+lus?|messages?\s+non\s+lus?/.test(t)) {
    return { action: 'lire', params: { type: 'emails_non_lus' } }
  }
  // Darja normalisé : "affiche mail de aujourd'hui" ou "affiche mails"
  if (/affiche?\s+(?:le?s?\s+)?(?:mail|email)s?/.test(t)) {
    return { action: 'lire', params: { type: 'emails_non_lus' } }
  }
  if (/affiche?\s+(?:le?s?\s+)?(?:réunion|meetings?)/.test(t)) {
    return { action: 'lire', params: { type: 'reunions_aujourd_hui' } }
  }
  if (/affiche?\s+(?:le?s?\s+)?tâches?\s+urgentes?/.test(t)) {
    return { action: 'lire', params: { type: 'taches_urgentes' } }
  }

  // ── Navigation ────────────────────────────────────────────
  const mNav = t.match(/^(?:aller?|va|ouvre?r?|affiche?r?|montre?r?|naviguer?|voir|accéder?)\s+(?:à\s+|aux?\s+|(?:le?s?\s+)?)?(.+)/)
  if (mNav) {
    const terme = mNav[1].trim().replace(/\s*s$/, '')
    if (PAGES[terme]) return { action: 'naviguer', params: { page: PAGES[terme] } }
    for (const [key, val] of Object.entries(PAGES)) {
      if (terme.includes(key) || key.includes(terme)) return { action: 'naviguer', params: { page: val } }
    }
  }

  // ── Réunion / Rendez-vous ─────────────────────────────────
  if (/réunion|meeting|rendez-vous|\brdv\b/.test(t)) {
    const prefixe = /^(?:(?:crée?r?|ajouter?|planifier?|organiser?|nouvelle?|mets?|fais?)\s+(?:une?\s+)?)?(?:réunion|meeting|rendez-vous|rdv)\s+/
    const titre = nettoyer(t, prefixe, RE_DATE, RE_HEURE, /\bà\b/g, /\bavec\s+la\b/g)
    const date_heure = extraireDate(t) ?? (() => {
      const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return d.toISOString()
    })()
    return {
      action: 'creer_reunion',
      params: { titre: cap(titre) || 'Nouvelle réunion', date_heure, duree_minutes: 60 },
    }
  }

  // ── Tâche ─────────────────────────────────────────────────
  const prefixeTache = /^(?:crée?r?|ajouter?|mets?|fais?|pose?|nouvelle?\s+|rappelle?-?moi\s+(?:de\s+)?|n'oublie\s+pas\s+de\s+)\s*(?:une?\s+)?(?:tâche\s+|task\s+)?/
  if (prefixeTache.test(t) || /\btâche\b|\btask\b/.test(t)) {
    const titre = nettoyer(t, prefixeTache, /\btâche\b|\btask\b/g, RE_PRIORITE, RE_DATE, RE_HEURE)
    const priorite = extrairePriorite(t)
    const deadline = extraireDate(t)
    return {
      action: 'creer_tache',
      params: { titre: cap(titre) || 'Nouvelle tâche', priorite, deadline },
    }
  }

  return { action: 'inconnu', params: { message_utilisateur: transcript } }
}
