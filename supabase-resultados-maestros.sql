-- Tabla simple para registrar resultados rápidos desde el panel /admin
-- Ejecutar en Supabase → SQL Editor → New query → Run

CREATE TABLE IF NOT EXISTS resultados_maestros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria text NOT NULL,
  rival text,
  goles_maestros int NOT NULL DEFAULT 0,
  goles_rival int NOT NULL DEFAULT 0,
  detalle_goles text,
  detalle_asistencias text,
  fecha_partido timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resultados_maestros_categoria
  ON resultados_maestros (categoria);

CREATE INDEX IF NOT EXISTS idx_resultados_maestros_fecha
  ON resultados_maestros (fecha_partido DESC);

