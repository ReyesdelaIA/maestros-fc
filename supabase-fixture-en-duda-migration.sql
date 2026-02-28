-- Migración: habilitar estado "en_duda" en asistencias_partido
-- Ejecutar si ya creaste la tabla antes de este cambio.

ALTER TABLE asistencias_partido
  DROP CONSTRAINT IF EXISTS asistencia_estado_check;

ALTER TABLE asistencias_partido
  ADD CONSTRAINT asistencia_estado_check
  CHECK (estado_asistencia IN ('disponible', 'en_duda', 'no_disponible'));
