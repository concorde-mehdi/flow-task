-- ============================================================
-- FlowTask — Schéma Supabase
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- ============================================================

-- Table des tâches
CREATE TABLE taches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  titre TEXT NOT NULL,
  description TEXT,
  deadline TIMESTAMPTZ,
  priorite TEXT CHECK (priorite IN ('Basse', 'Moyenne', 'Haute')) DEFAULT 'Moyenne',
  tags JSONB DEFAULT '[]'::jsonb,
  statut BOOLEAN DEFAULT FALSE,
  is_quotidienne BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_taches_user_id ON taches(user_id);
CREATE INDEX idx_taches_deadline ON taches(deadline);
CREATE INDEX idx_taches_statut ON taches(statut);
CREATE INDEX idx_taches_priorite ON taches(priorite);

-- Table des rappels
CREATE TABLE rappels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tache_id UUID REFERENCES taches(id) ON DELETE CASCADE NOT NULL,
  rappel_a TIMESTAMPTZ NOT NULL,
  est_envoye BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rappels_tache_id ON rappels(tache_id);
CREATE INDEX idx_rappels_rappel_a ON rappels(rappel_a) WHERE NOT est_envoye;

-- Row Level Security
ALTER TABLE taches ENABLE ROW LEVEL SECURITY;
ALTER TABLE rappels ENABLE ROW LEVEL SECURITY;

-- Politiques RLS : chaque utilisateur accède UNIQUEMENT à ses données
CREATE POLICY "Utilisateurs voient leurs propres tâches"
  ON taches FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs voient leurs propres rappels"
  ON rappels FOR ALL
  USING (
    tache_id IN (
      SELECT id FROM taches WHERE user_id = auth.uid()
    )
  );

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_updated_at
  BEFORE UPDATE ON taches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Activer la réplication en temps réel
ALTER PUBLICATION supabase_realtime ADD TABLE taches;
