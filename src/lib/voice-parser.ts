export interface ActionVocale {
  action: 'creer_tache' | 'creer_reunion' | 'creer_note' | 'naviguer' | 'telegram' | 'lire' | 'inconnu'
  params: Record<string, unknown>
}

// ═══════════════════════════════════════════════════════════════════════════════
// BASE DARJA TUNISIENNE — calibrée pour Mehdi (Sousse)
// Chaque mot a plusieurs variantes phonétiques car Chrome fr-FR transcrit
// les phonèmes arabes de façon approximative selon l'accent du locuteur.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Verbes d'action ───────────────────────────────────────────────────────────
const VERBES_CREER = [
  'zid', 'zig', 'zi',                          // زيد — ajoute (Mehdi)
  '7ot', 'hot', 'hott', 'kho', 'khot',         // حط — pose/mets
  'dir', 'dier', 'di',                          // دير — fais
  'a3mel', 'a3mal', 'amel',                     // اعمل — fais/crée
  'enregistre', 'enregistrer',
]

const VERBES_NAVIGUER = [
  'mchi', 'mchee', 'mchie', 'm-chi',           // مشي — va (Mehdi)
  'rouh', 'roh', 'rou', 'ru',                   // روح — aller
  'fata7', 'fata', 'fatah', 'ftah',             // فتح — ouvre
  'ouvre', 'ouvrir',
]

const VERBES_AFFICHER = [
  'chouf', 'chof', 'chuf', 'chauffe',           // شوف — regarde/affiche (Chrome déforme souvent en "chauffe")
  'chaouef', 'chaouf', 'shuf', 'shof',
  'wari', 'warii', 'ouari',                     // وري — montre
  'affiche', 'afficher', 'montre',
]

const VERBES_ENVOYER = [
  'ab3th', 'ab3t', 'ab3',                       // أبعث — envoie (Mehdi)
  'abette', 'ab-et', 'absent',                  // variantes phonétiques Chrome
  'b3ath', 'b3at', 'ba3ath', 'baath',           // بعث — envoie (variante)
  'sifet', 'sifet', 'sifett', 'siffet',         // سيفت — envoie
  'betch', 'bech',
]

const VERBES_APPELER = [
  '3ayet', '3ayt', '3aiet', 'ayet',             // عيّط — appelle
  'klam', 'klem', 'tkelem',                     // كلّم — parle à
  'ittisel', 'ettisel',                         // اتصل — appelle
]

// ── Connecteurs de navigation ─────────────────────────────────────────────────
// "mchi l emails" → "l" = vers (لـ)
const CONNECTEURS_VERS = ['l', 'lal', 'la', 'lel', 'lil', 'vers', 'à', 'au', 'aux']

// ── Dates et temps ────────────────────────────────────────────────────────────
const DATES_DEMAIN: Record<string, string> = {
  'ghoudwa': 'demain', 'goudwa': 'demain', 'goudoua': 'demain',    // غدوة (Mehdi)
  'gdwa': 'demain', 'ghedwa': 'demain', 'ghotwa': 'demain',
  'dm2': 'demain', 'dm 2': 'demain', 'dema': 'demain',
  'ghda': 'demain', 'ghda7': 'demain',
}

const DATES_AUJOURDHUI: Record<string, string> = {
  'youma': "aujourd'hui", 'yoma': "aujourd'hui", 'youme': "aujourd'hui",  // اليوم (Mehdi)
  'lyoum': "aujourd'hui", 'lioum': "aujourd'hui", 'loum': "aujourd'hui",
  'elyoum': "aujourd'hui", 'l-youm': "aujourd'hui",
  'nhar': "aujourd'hui",                                                   // نهار (aujourd'hui en contexte)
}

const DATES_HIER: Record<string, string> = {
  'lbareh': 'hier', 'l-bareh': 'hier', "l'bareh": 'hier',                 // البارح (Mehdi)
  'lbarre': 'hier', "l'barre": 'hier', 'lbarihe': 'hier',
  'lbare': 'hier', "l'barré": 'hier', 'lbari': 'hier',
}

// Jours de la semaine en darja tunisienne
const JOURS_DARJA: Record<string, string> = {
  // Dimanche
  'had': 'dimanche', "l'had": 'dimanche', 'lhad': 'dimanche', 'el7ad': 'dimanche',
  // Lundi
  'thnin': 'lundi', 'lethnin': 'lundi', 'thneen': 'lundi', 'tnin': 'lundi',
  // Mardi
  'tlatha': 'mardi', 'tlettha': 'mardi', 'tletha': 'mardi', 'tleta': 'mardi',
  // Mercredi
  'arb3a': 'mercredi', "l'arb3a": 'mercredi', 'larb3a': 'mercredi', 'arba3a': 'mercredi',
  // Jeudi
  'khamis': 'jeudi', 'lkhamis': 'jeudi', 'el-khamis': 'jeudi',
  // Vendredi
  'jom3a': 'vendredi', 'jomaa': 'vendredi', 'jum3a': 'vendredi', 'jouma': 'vendredi',
  // Samedi
  'ssbet': 'samedi', 'sebt': 'samedi', 'ssabt': 'samedi', 'esebt': 'samedi',
}

// ── Mots divers utiles ────────────────────────────────────────────────────────
const MOTS_DIVERS: Record<string, string> = {
  // Urgence / priorité
  '3ajet': 'urgent', 'ajet': 'urgent', '3ajel': 'urgent',
  'mousta3jel': 'urgent', 'moustajel': 'urgent',
  'diro': 'urgent', 'bil3ajala': 'urgent',
  // Connecteurs
  'mta3': 'de', 'mte3': 'de', 'mte3i': 'de mon',
  'w': 'et', 'ou': 'ou',
  'bech': 'pour', 'bash': 'pour',
  'fi': 'dans', 'fel': 'dans le',
  '3la': 'sur', 'fawq': 'sur',
  'mel': 'depuis', 'min': 'depuis',
  // Réunion en darja
  'maw3ed': 'réunion', 'maw3id': 'réunion', 'moued': 'réunion',
  'ijtima3': 'réunion', 'ijtima': 'réunion',
  // Note
  'nota': 'note', 'nakoul': 'note', 'najjem': 'rappelle',
  // Message
  'rissala': 'message', 'rsala': 'message', 'message': 'message',
}

// ── Assemblage du dictionnaire principal ──────────────────────────────────────
const DARJA_MAP: Record<string, string> = {
  ...DATES_DEMAIN,
  ...DATES_AUJOURDHUI,
  ...DATES_HIER,
  ...JOURS_DARJA,
  ...MOTS_DIVERS,
}

// Ajouter tous les verbes
for (const v of VERBES_CREER)     DARJA_MAP[v] = 'crée'
for (const v of VERBES_NAVIGUER)  DARJA_MAP[v] = 'aller'
for (const v of VERBES_AFFICHER)  DARJA_MAP[v] = 'affiche'
for (const v of VERBES_ENVOYER)   DARJA_MAP[v] = 'envoie'
for (const v of VERBES_APPELER)   DARJA_MAP[v] = 'appeler'

// ── Fuzzy regex — pour les déformations imprévisibles de Chrome ───────────────
const DARJA_FUZZY: [RegExp, string][] = [
  // Créer
  [/\bzi[dt]?\b/g, 'crée'],
  [/\bh[o0]tt?\b|\bkh[o0]t\b/g, 'crée'],
  // Afficher (Chrome déforme chouf en "chauffe" très souvent)
  [/\bcho[uf]+\b|\bcha[uf]+\b|\bchau[fv]+\b|\bshuf\b|\bchaouf\b/g, 'affiche'],
  // Naviguer
  [/\bm[\s-]?chi\b|\bmch[ée]+\b/g, 'aller'],
  [/\brou[h7]?\b|\bro[h7]\b/g, 'aller'],
  [/\bfta[h7]?\b|\bfata[h7]\b/g, 'aller'],
  // Envoyer — ab3th a des variantes très déformées
  [/\bab[e3][t]?[h]?\b|\babit\b|\babette\b/g, 'envoie'],
  [/\bb[e3][a]?[t]?[h]\b/g, 'envoie'],
  // Dates
  [/\bgou?d[wo]a?\b|\bgh[eo]d[wo]a?\b/g, 'demain'],
  [/\by[o0]uma?\b|\bylo?[o0]um\b|\bl[io][o0]um\b/g, "aujourd'hui"],
  [/\bl['\s-]?bar[eéi][h]?\b|\blbar\b/g, 'hier'],
  // Connecteur navigation "l" (mchi l emails)
  [/\b(aller|mchi)\s+[lL]['']?\s*/g, 'aller '],
  // Maw3ed (réunion) — Chrome peut dire "mooed", "mouad"
  [/\bmaw?[3oa][ée]?d\b|\bmo[uo][eé]d\b/g, 'réunion'],
  // Urgence
  [/\b[3a][ae]j[ea]l?\b|\bmoustaj[ea]l\b/g, 'urgent'],
]

// ═══════════════════════════════════════════════════════════════════════════════

function normaliserDarja(t: string): string {
  let r = t
  // 1. Fuzzy regex d'abord (phonèmes déformés)
  for (const [re, rep] of DARJA_FUZZY) r = r.replace(re, rep)
  // 2. Mapping exact mot par mot
  r = r.split(/\s+/).map(m => DARJA_MAP[m] ?? m).join(' ')
  // 3. Nettoyer les connecteurs de navigation résiduels
  for (const conn of CONNECTEURS_VERS) {
    r = r.replace(new RegExp(`\\baller\\s+${conn}\\s+`, 'g'), 'aller ')
  }
  return r.replace(/\s+/g, ' ').trim()
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════════════════════════════════════════

const PAGES: Record<string, string> = {
  'dashboard': 'dashboard', 'accueil': 'dashboard', 'tableau de bord': 'dashboard', 'home': 'dashboard',
  'tâches': 'taches', 'taches': 'taches', 'liste des tâches': 'taches', 'tasks': 'taches', 'travail': 'taches',
  'agenda': 'calendrier', 'calendrier': 'calendrier', 'calendar': 'calendrier',
  'emails': 'emails', 'mail': 'emails', 'mails': 'emails', 'boîte mail': 'emails', 'messagerie': 'emails',
  'réunions': 'reunions', 'reunions': 'reunions', 'meetings': 'reunions', 'réunion': 'reunions',
  'contacts': 'contacts', 'annuaire': 'contacts', 'contact': 'contacts',
  'devis': 'devis',
  'matériel': 'materiel', 'materiel': 'materiel', 'stock': 'materiel',
  'documents': 'documents', 'fichiers': 'documents', 'document': 'documents',
  'charges': 'charges', 'factures': 'charges', 'dépenses': 'charges',
  'connexions': 'connexions', 'connexion': 'connexions', 'ordinateurs': 'connexions',
  'paramètres': 'parametres', 'parametres': 'parametres', 'settings': 'parametres', 'profil': 'parametres',
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

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

  const JOURS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
  for (let i = 0; i < JOURS_FR.length; i++) {
    if (t.includes(JOURS_FR[i])) {
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

const RE_DATE = /demain|après[-\s]demain|hier|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|aujourd'hui/g
const RE_HEURE = /(?:à\s+)?\d{1,2}\s*h\s*\d{0,2}/g
const RE_PRIORITE = /urgent[e]?|important[e]?|critique|basse?\s+priorité|haute?\s+priorité|priorité\s+\w+/g

// ═══════════════════════════════════════════════════════════════════════════════
// PARSER PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export function parseVoiceCommand(transcript: string): ActionVocale {
  const raw = transcript.toLowerCase()
  const t = normaliserDarja(raw)   // darja → français standard

  // ── Telegram / Envoyer message ────────────────────────────────────────────
  const mTelegram = t.match(/^(?:envoie?r?|send)\s+(?:un\s+)?(?:message|telegram|sms|msg)\s+(.+)/)
  if (mTelegram) {
    return { action: 'telegram', params: { message: cap(mTelegram[1].trim()) } }
  }

  // ── Note / Mémo ───────────────────────────────────────────────────────────
  const mNote = t.match(/^(?:note|mémo?|memo|rappelle?-?moi)\s+(.+)/)
  if (mNote) {
    return { action: 'creer_note', params: { contenu: cap(mNote[1].trim()) } }
  }

  // ── Lire / Afficher (sections spécifiques) ────────────────────────────────
  if (/tâches?\s+urgentes?|urgentes?\s+tâches?/.test(t)) {
    return { action: 'lire', params: { type: 'taches_urgentes' } }
  }
  if (/(?:réunions?|agenda|meetings?)\s+(?:d.?aujourd|aujourd)|aujourd.+réunion/.test(t)) {
    return { action: 'lire', params: { type: 'reunions_aujourd_hui' } }
  }
  if (/emails?\s+non\s+lus?|messages?\s+non\s+lus?/.test(t)) {
    return { action: 'lire', params: { type: 'emails_non_lus' } }
  }
  // Après normalisation darja : "affiche mail(s)" / "affiche emails"
  if (/affiche?\s+(?:le?s?\s+)?(?:mail|email)s?/.test(t)) {
    return { action: 'lire', params: { type: 'emails_non_lus' } }
  }
  if (/affiche?\s+(?:le?s?\s+)?(?:réunion|meeting)s?/.test(t)) {
    return { action: 'lire', params: { type: 'reunions_aujourd_hui' } }
  }
  if (/affiche?\s+(?:le?s?\s+)?tâches?\s+urgentes?/.test(t)) {
    return { action: 'lire', params: { type: 'taches_urgentes' } }
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  const mNav = t.match(/^(?:aller?|va|ouvre?r?|affiche?r?|montre?r?|naviguer?|voir|accéder?)\s+(?:à\s+|aux?\s+|(?:le?s?\s+)?)?(.+)/)
  if (mNav) {
    const terme = mNav[1].trim().replace(/\s*s$/, '')
    if (PAGES[terme]) return { action: 'naviguer', params: { page: PAGES[terme] } }
    for (const [key, val] of Object.entries(PAGES)) {
      if (terme.includes(key) || key.includes(terme)) return { action: 'naviguer', params: { page: val } }
    }
  }

  // ── Réunion / Rendez-vous ─────────────────────────────────────────────────
  if (/réunion|meeting|rendez-vous|\brdv\b|maw3ed/.test(t)) {
    const prefixe = /^(?:(?:crée?r?|ajouter?|planifier?|organiser?|nouvelle?|mets?|fais?)\s+(?:une?\s+)?)?(?:réunion|meeting|rendez-vous|rdv|maw3ed)\s+/
    const titre = nettoyer(t, prefixe, RE_DATE, RE_HEURE, /\bà\b/g)
    const date_heure = extraireDate(t) ?? (() => {
      const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return d.toISOString()
    })()
    return {
      action: 'creer_reunion',
      params: { titre: cap(titre) || 'Nouvelle réunion', date_heure, duree_minutes: 60 },
    }
  }

  // ── Tâche ─────────────────────────────────────────────────────────────────
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
