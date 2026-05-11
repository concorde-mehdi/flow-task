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
