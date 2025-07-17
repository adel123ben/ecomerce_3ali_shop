-- Migration: Créer la table announcement_bar pour gérer le texte de la barre d'annonce
CREATE TABLE IF NOT EXISTS announcement_bar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Pour n'avoir qu'une seule annonce active à la fois, on peut utiliser une seule ligne (ou gérer côté app) 