-- Fixture + Confirmación de asistencia (MVP sin login)
-- Ejecutar en Supabase SQL Editor

BEGIN;

CREATE TABLE IF NOT EXISTS fixture_partidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria text NOT NULL,
  rival text NOT NULL,
  fecha_partido date NOT NULL,
  hora text,
  cancha text,
  estado text NOT NULL DEFAULT 'programado',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fixture_estado_check
    CHECK (estado IN ('programado', 'jugado', 'suspendido'))
);

CREATE TABLE IF NOT EXISTS asistencias_partido (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partido_id uuid NOT NULL REFERENCES fixture_partidos(id) ON DELETE CASCADE,
  jugador_id uuid NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
  estado_asistencia text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT asistencia_estado_check
    CHECK (estado_asistencia IN ('disponible', 'en_duda', 'no_disponible')),
  CONSTRAINT asistencias_partido_jugador_unique UNIQUE (partido_id, jugador_id)
);

CREATE INDEX IF NOT EXISTS idx_fixture_categoria_fecha
  ON fixture_partidos (categoria, fecha_partido);

CREATE INDEX IF NOT EXISTS idx_asistencias_partido
  ON asistencias_partido (partido_id);

CREATE INDEX IF NOT EXISTS idx_asistencias_jugador
  ON asistencias_partido (jugador_id);

-- RLS (modo A: sin login, lectura/escritura pública)
ALTER TABLE fixture_partidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias_partido ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS fixture_select_anon ON fixture_partidos;
CREATE POLICY fixture_select_anon
  ON fixture_partidos FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS fixture_insert_anon ON fixture_partidos;
CREATE POLICY fixture_insert_anon
  ON fixture_partidos FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS fixture_update_anon ON fixture_partidos;
CREATE POLICY fixture_update_anon
  ON fixture_partidos FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS asistencia_select_anon ON asistencias_partido;
CREATE POLICY asistencia_select_anon
  ON asistencias_partido FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS asistencia_insert_anon ON asistencias_partido;
CREATE POLICY asistencia_insert_anon
  ON asistencias_partido FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS asistencia_update_anon ON asistencias_partido;
CREATE POLICY asistencia_update_anon
  ON asistencias_partido FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Si "jugadores" tiene RLS activo y el front no puede leer, habilitar esta policy:
-- ALTER TABLE jugadores ENABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS jugadores_read_anon ON jugadores;
-- CREATE POLICY jugadores_read_anon
--   ON jugadores FOR SELECT
--   TO anon
--   USING (true);

COMMIT;

-- Seed opcional de próximos partidos (editar fecha/hora/cancha según corresponda):
-- INSERT INTO fixture_partidos (categoria, rival, fecha_partido, hora, cancha, estado) VALUES
-- ('Junior Fútbol', 'Rival Junior', '2026-03-08', '11:00', 'Cancha 1', 'programado'),
-- ('Senior Fútbol', 'Rival Senior', '2026-03-08', '12:00', 'Cancha 2', 'programado'),
-- ('Super Senior Futbolito', 'Rival Futbolito', '2026-03-08', '10:00', 'Cancha 3', 'programado'),
-- ('Super Senior Fútbol', 'Rival Martes', '2026-03-10', '21:00', 'Cancha 4', 'programado');
