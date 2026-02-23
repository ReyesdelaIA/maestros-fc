-- Corregir apodo: Guaso → Huaso (Jose Miguel Echeñique)
-- Ejecutar en Supabase: SQL Editor → pegar y Run

-- Tabla jugadores: corregir apodo
UPDATE jugadores
SET apodo = 'Huaso'
WHERE apodo ILIKE 'Guaso' OR apodo ILIKE '%Guaso%';

-- Tabla goleadores: corregir nombre_jugador si aparece "Guaso"
UPDATE goleadores
SET nombre_jugador = REPLACE(
  REPLACE(nombre_jugador, 'Guaso', 'Huaso'),
  'guaso', 'Huaso'
)
WHERE nombre_jugador ILIKE '%Guaso%';
