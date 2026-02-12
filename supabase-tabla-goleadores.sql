-- ============================================================
-- Tabla GOLEADORES en Supabase
-- Ejecutar en: Supabase → SQL Editor → New query → pegar y Run
-- ============================================================
-- Almacena el ranking de goleadores por categoría (y opcionalmente asistencias).
-- Categorías deben coincidir con la app: Junior Fútbol, Senior Fútbol,
-- Super Senior Futbolito, Super Senior Fútbol.
-- ============================================================

-- 1) Crear tabla
CREATE TABLE IF NOT EXISTS goleadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria text NOT NULL,
  nombre_jugador text NOT NULL,
  goles int NOT NULL DEFAULT 0,
  asistencias int NOT NULL DEFAULT 0,
  posicion_ranking int NOT NULL,
  temporada text NOT NULL DEFAULT '2026',
  created_at timestamptz DEFAULT now()
);

-- 2) Índices para listar por categoría y temporada
CREATE INDEX IF NOT EXISTS idx_goleadores_categoria ON goleadores (categoria);
CREATE INDEX IF NOT EXISTS idx_goleadores_temporada ON goleadores (temporada);

-- 3) RLS: permitir lectura pública (anon)
ALTER TABLE goleadores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "goleadores_read_anon" ON goleadores;
CREATE POLICY "goleadores_read_anon"
  ON goleadores FOR SELECT
  TO anon
  USING (true);

-- 4) Datos iniciales (Maestros SS Futbolito, SS Martes, Senior; Junior vacío)

-- Maestros SS Futbolito
INSERT INTO goleadores (categoria, nombre_jugador, goles, asistencias, posicion_ranking, temporada) VALUES
  ('Super Senior Futbolito', 'Rodrigo Garcés', 9, 0, 1, '2026'),
  ('Super Senior Futbolito', 'Raúl Lagos', 7, 0, 2, '2026'),
  ('Super Senior Futbolito', 'Felipe Reyes', 7, 0, 3, '2026'),
  ('Super Senior Futbolito', 'Sebastián Gonzalez', 6, 0, 4, '2026');

-- Maestros SS Martes
INSERT INTO goleadores (categoria, nombre_jugador, goles, asistencias, posicion_ranking, temporada) VALUES
  ('Super Senior Fútbol', 'Sebastián Gonzalez', 20, 0, 1, '2026'),
  ('Super Senior Fútbol', 'Matías Suarez', 14, 0, 2, '2026'),
  ('Super Senior Fútbol', 'Lucas Mira', 7, 0, 3, '2026'),
  ('Super Senior Fútbol', 'Bernardo Vergara', 5, 0, 4, '2026');

-- Maestros Senior (orden por goles: Matías 5, Francisco 4, Pablo 3, Javier 2)
INSERT INTO goleadores (categoria, nombre_jugador, goles, asistencias, posicion_ranking, temporada) VALUES
  ('Senior Fútbol', 'Matías Diaz de Valdés', 5, 0, 1, '2026'),
  ('Senior Fútbol', 'Francisco Vial', 4, 0, 2, '2026'),
  ('Senior Fútbol', 'Pablo Mackena', 3, 0, 3, '2026'),
  ('Senior Fútbol', 'Javier Concha', 2, 0, 4, '2026');

-- Maestros Junior
INSERT INTO goleadores (categoria, nombre_jugador, goles, asistencias, posicion_ranking, temporada) VALUES
  ('Junior Fútbol', 'Juan Pablo Sande', 4, 0, 1, '2026'),
  ('Junior Fútbol', 'Santiago Allende', 3, 0, 2, '2026'),
  ('Junior Fútbol', 'Diego Azocar', 2, 0, 3, '2026'),
  ('Junior Fútbol', 'Juan Pablo Porter', 2, 0, 4, '2026');
