-- Cambios en planilla Maestros SS Futbolito
-- Ejecutar en Supabase: SQL Editor → pegar y Run

-- 1) Quitar a César Kattan de la planilla
DELETE FROM jugadores
WHERE apellido IN ('Catán', 'Kattan', 'Catan', 'Katan')
  AND (nombre ILIKE '%César%' OR nombre ILIKE '%Cesar%' OR apodo ILIKE '%Catán%' OR apodo ILIKE '%Kattan%');

-- Quitar de goleadores si estaba
DELETE FROM goleadores
WHERE nombre_jugador ILIKE '%Kattan%' OR nombre_jugador ILIKE '%Catán%';

-- 2) Agregar Rodrigo Varela como volante (MED)
INSERT INTO jugadores (nombre, apodo, apellido, posicion, numero)
VALUES ('Rodrigo', NULL, 'Varela', 'MED', NULL);

-- 3) Agregar Felipe "Turbo Cruz" como delantero (DEL)
-- Fecha de nacimiento: pendiente (más adelante)
INSERT INTO jugadores (nombre, apodo, apellido, posicion, numero)
VALUES ('Felipe', 'Turbo Cruz', 'Cruz', 'DEL', NULL);
