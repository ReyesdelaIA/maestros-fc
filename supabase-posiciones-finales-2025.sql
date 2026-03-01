-- Tabla final 2025 (4 categorías Maestros)
-- Fuente: capturas entregadas por Felipe
-- Ejecutar en Supabase SQL Editor

BEGIN;

-- Compatibilidad: asegurar columnas esperadas por la app
ALTER TABLE posiciones ADD COLUMN IF NOT EXISTS categoria text;
ALTER TABLE posiciones ADD COLUMN IF NOT EXISTS equipo text;
ALTER TABLE posiciones ADD COLUMN IF NOT EXISTS pj int;
ALTER TABLE posiciones ADD COLUMN IF NOT EXISTS pts int;
ALTER TABLE posiciones ADD COLUMN IF NOT EXISTS dg int;
ALTER TABLE posiciones ADD COLUMN IF NOT EXISTS gf int;
ALTER TABLE posiciones ADD COLUMN IF NOT EXISTS gc int;

-- Limpiar standings previos de estas categorías
DELETE FROM posiciones
WHERE categoria IN (
  'Super Senior Futbolito',
  'Super Senior Fútbol',
  'Senior Fútbol',
  'Junior Fútbol'
);

-- =========================
-- SUPER SENIOR FUTBOLITO
-- =========================
INSERT INTO posiciones (categoria, equipo, pj, pts, dg, gf, gc) VALUES
  ('Super Senior Futbolito', 'La Gloria Futbolito SSR', 11, 19,  29, NULL, NULL),
  ('Super Senior Futbolito', 'Chilcano FC Futbolito SSR', 11, 17, 19, NULL, NULL),
  ('Super Senior Futbolito', 'Liverpool Futbolito (SS)', 11, 15, 15, NULL, NULL),
  ('Super Senior Futbolito', 'Miami Dogs', 11, 14, 7, NULL, NULL),
  ('Super Senior Futbolito', 'Halcones (SS)', 11, 13, 8, NULL, NULL),
  ('Super Senior Futbolito', 'Dako', 11, 12, -1, NULL, NULL),
  ('Super Senior Futbolito', 'Maestros FC Futbolito (SS)', 11, 12, 16, NULL, NULL),
  ('Super Senior Futbolito', 'ST Withords Futbolito (SS)', 11, 8, -2, NULL, NULL),
  ('Super Senior Futbolito', 'Cruzados Futbolito (SS)', 11, 7, -16, NULL, NULL),
  ('Super Senior Futbolito', 'CSYDA Futbolito (SS)', 11, 7, -8, NULL, NULL),
  ('Super Senior Futbolito', 'Wallala FC (SS)', 11, 6, -30, NULL, NULL),
  ('Super Senior Futbolito', 'La Viña', 11, 2, -37, NULL, NULL);

-- =========================
-- SUPER SENIOR FÚTBOL
-- Liga Chicureo Norte - Grupo A 2025 Clausura
-- =========================
INSERT INTO posiciones (categoria, equipo, pj, pts, dg, gf, gc) VALUES
  ('Super Senior Fútbol', 'Palestino SS', 7, 13, 20, 26, 6),
  ('Super Senior Fútbol', 'Maestros SS', 7, 12, 27, 35, 8),
  ('Super Senior Fútbol', 'Cruzados SS', 7, 9, 17, 23, 6),
  ('Super Senior Fútbol', 'Sunga Negra', 7, 8, -1, 9, 10),
  ('Super Senior Fútbol', 'Club Social y Deportivo Argentino SS', 7, 6, -8, 16, 24),
  ('Super Senior Fútbol', 'Liverpool SS', 7, 5, -7, 10, 17),
  ('Super Senior Fútbol', 'Rukan SS', 7, 2, -18, 5, 23),
  ('Super Senior Fútbol', 'Kaiken', 7, 1, -30, 4, 34);

-- =========================
-- SENIOR FÚTBOL
-- Primera División Senior 2025
-- =========================
INSERT INTO posiciones (categoria, equipo, pj, pts, dg, gf, gc) VALUES
  ('Senior Fútbol', 'Furia Inter', 11, 20, 23, 30, 7),
  ('Senior Fútbol', 'Fuerte Apache', 11, 18, 26, 44, 18),
  ('Senior Fútbol', 'Boedo', 11, 18, 24, 34, 10),
  ('Senior Fútbol', 'Dako', 11, 12, 0, 18, 18),
  ('Senior Fútbol', 'Cruzados', 11, 12, -3, 24, 27),
  ('Senior Fútbol', 'Piduye', 11, 11, 1, 25, 24),
  ('Senior Fútbol', 'Iquique Glorioso', 11, 10, 0, 21, 21),
  ('Senior Fútbol', 'Tiburón (SR)', 11, 9, -6, 15, 21),
  ('Senior Fútbol', 'Viña San Pedro', 11, 7, -6, 15, 21),
  ('Senior Fútbol', 'Maestros', 11, 6, -6, 16, 22),
  ('Senior Fútbol', 'Palestino (S)', 11, 5, -27, 18, 45),
  ('Senior Fútbol', 'San Francisco', 11, 4, -26, 21, 47);

-- =========================
-- JUNIOR FÚTBOL
-- Primera División Fútbol Junior 2025 Clausura
-- =========================
INSERT INTO posiciones (categoria, equipo, pj, pts, dg, gf, gc) VALUES
  ('Junior Fútbol', 'Verbo (JR)', 11, 19, 16, 28, 12),
  ('Junior Fútbol', 'Manyas (JR)', 11, 18, 15, 21, 6),
  ('Junior Fútbol', 'Scratch (JR)', 11, 12, 12, 26, 14),
  ('Junior Fútbol', 'Maestros FC Futbol (JR)', 11, 12, -4, 9, 13),
  ('Junior Fútbol', 'Cuervo Futbol (JR)', 11, 11, 5, 16, 11),
  ('Junior Fútbol', 'Senegal (JR)', 11, 11, -6, 8, 14),
  ('Junior Fútbol', 'HDT', 11, 11, 2, 18, 16),
  ('Junior Fútbol', 'El Nido (JR)', 11, 10, -1, 16, 17),
  ('Junior Fútbol', 'Cruzados Futbol (JR)', 11, 10, -2, 14, 16),
  ('Junior Fútbol', 'Cachamama (JR)', 11, 8, -7, 9, 16),
  ('Junior Fútbol', '88 Flash (JR)', 11, 8, -7, 17, 24),
  ('Junior Fútbol', 'CAJM (JR)', 11, 2, -23, 6, 29);

COMMIT;

-- Verificación rápida:
-- SELECT categoria, equipo, pj, pts, dg, gf, gc
-- FROM posiciones
-- WHERE categoria IN ('Super Senior Futbolito', 'Super Senior Fútbol', 'Senior Fútbol', 'Junior Fútbol')
-- ORDER BY categoria, pts DESC, dg DESC;
