export type Priorite = 'Basse' | 'Moyenne' | 'Haute'

export interface TagTache {
  nom: string
  couleur: string
}

export interface Tache {
  id: string
  user_id: string
  titre: string
  description: string | null
  deadline: string | null
  priorite: Priorite
  tags: TagTache[]
  statut: boolean
  is_quotidienne: boolean
  created_at: string
  updated_at: string
}

export type NouvellesTache = Omit<Tache, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export interface Rappel {
  id: string
  tache_id: string
  rappel_a: string
  est_envoye: boolean
}

export interface FiltresTaches {
  priorite?: Priorite | 'Toutes'
  statut?: 'toutes' | 'a_faire' | 'faites'
  tag?: string
  recherche?: string
}

export type TypeCharge = 'depense' | 'facture'
export type StatutCharge = 'paye' | 'en_attente'

export interface Charge {
  id: string
  user_id: string
  titre: string
  montant: number
  type: TypeCharge
  categorie: string | null
  statut: StatutCharge
  date_charge: string
  date_echeance: string | null
  notes: string | null
  created_at: string
}

export type NouvelleCharge = Omit<Charge, 'id' | 'user_id' | 'created_at'>

export interface Profil {
  user_id: string
  titre_poste: string
  updated_at: string
}

export interface Lien {
  id: string
  user_id: string
  titre: string
  url: string
  categorie: string
  consulte: boolean
  is_raccourci: boolean
  notes: string | null
  created_at: string
}

export type NouveauLien = Omit<Lien, 'id' | 'user_id' | 'created_at'>

export const CATEGORIES_LIENS = ['Documentation', 'Outils IT', 'Formation', 'Ressources clinique', 'Fournisseurs'] as const

export interface Contact {
  id: string
  user_id: string
  nom: string
  poste: string | null
  telephone: string | null
  email: string | null
  notes: string | null
  created_at: string
}

export type NouveauContact = Omit<Contact, 'id' | 'user_id' | 'created_at'>

export type StatutDevis = 'envoye' | 'en_attente_signature' | 'paye' | 'refuse'

export interface Devis {
  id: string
  user_id: string
  titre: string
  entreprise: string | null
  montant: number | null
  statut: StatutDevis
  date_devis: string
  notes: string | null
  created_at: string
}

export type NouveauDevis = Omit<Devis, 'id' | 'user_id' | 'created_at'>

export type StatutMateriel = 'commande' | 'en_livraison' | 'livre' | 'en_panne'

export interface Materiel {
  id: string
  user_id: string
  titre: string
  quantite: number
  statut: StatutMateriel
  categorie: string
  fournisseur: string | null
  date_commande: string | null
  date_livraison_prevue: string | null
  notes: string | null
  created_at: string
}

export type NouveauMateriel = Omit<Materiel, 'id' | 'user_id' | 'created_at'>

export const CATEGORIES_MATERIEL = ['Général', 'Informatique', 'Réseau', 'Médical', 'Mobilier', 'Consommables', 'Sécurité'] as const

export interface Raccourci {
  id: string
  user_id: string
  titre: string
  type: 'telegram' | 'email'
  message: string
  created_at: string
}

export type NouveauRaccourci = Omit<Raccourci, 'id' | 'user_id' | 'created_at'>

export interface Reunion {
  id: string
  user_id: string
  titre: string
  date_heure: string
  lieu: string | null
  description: string | null
  duree_minutes: number
  created_at: string
}

export type NouvelleReunion = Omit<Reunion, 'id' | 'user_id' | 'created_at'>

export interface Document {
  id: string
  user_id: string
  titre: string
  url: string
  type: string
  notes: string | null
  created_at: string
}

export type NouveauDocument = Omit<Document, 'id' | 'user_id' | 'created_at'>

export const TYPES_DOCUMENTS = ['PDF', 'Word', 'Excel', 'PowerPoint', 'Image', 'Vidéo', 'Lien', 'Autre'] as const

export type StatutReseau = 'en_ligne' | 'hors_ligne' | 'inconnu'

export interface ConnexionPC {
  id: string
  user_id: string
  nom: string
  ip: string
  description: string | null
  statut?: StatutReseau
  created_at: string
}

export type NouvelleConnexion = {
  nom: string
  ip: string
  description: string | null
}

export type StatutProjet = 'en_cours' | 'acheve'

export interface Projet {
  id: string
  user_id: string
  titre: string
  statut: StatutProjet
  avancement: number
  notes: string | null
  created_at: string
}

export type NouveauProjet = Omit<Projet, 'id' | 'user_id' | 'created_at'>

export interface Activite {
  id: string
  user_id: string
  type: string
  description: string
  created_at: string
}

export type CouleurNote = 'yellow' | 'blue' | 'green' | 'pink' | 'purple'

export interface StickyNote {
  id: string
  user_id: string
  contenu: string
  couleur: CouleurNote
  created_at: string
  updated_at: string
}

export type CategorieCoffre = 'Général' | 'Réseau' | 'Serveurs' | 'Applications' | 'Email' | 'Fournisseurs' | 'Personnel'

export interface CoffreMdp {
  id: string
  user_id: string
  titre: string
  identifiant: string | null
  mdp_chiffre: string
  iv: string
  sel: string
  url: string | null
  categorie: CategorieCoffre
  notes: string | null
  created_at: string
}

export type NouveauCoffreMdp = {
  titre: string
  identifiant: string | null
  mdp_clair: string
  url: string | null
  categorie: CategorieCoffre
  notes: string | null
}
