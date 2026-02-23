-- Actualizar goleadores Maestros SS Futbolito - temporada 2026
-- Ejecutar en Supabase: SQL Editor → pegar y Run
-- Incluye a todos los goleadores (Felipe, Toto, Raúl, etc.)

-- Eliminar goleadores actuales de SS Futbolito
DELETE FROM goleadores
WHERE categoria = 'Super Senior Futbolito' AND temporada = '2026';

-- Insertar lista completa ordenada por goles (posicion_ranking 1 = máximo goleador)
-- Rodrigo Garcés = Toto Garcés (mismo jugador)
INSERT INTO goleadores (categoria, nombre_jugador, goles, asistencias, posicion_ranking, temporada) VALUES
  ('Super Senior Futbolito', 'Sebastián Gonzalez', 20, 0, 1, '2026'),
  ('Super Senior Futbolito', 'Felipe Reyes', 13, 0, 2, '2026'),
  ('Super Senior Futbolito', 'Rodrigo Garcés', 12, 0, 3, '2026'),
  ('Super Senior Futbolito', 'Raúl Lagos', 8, 0, 4, '2026'),
  ('Super Senior Futbolito', 'Cristian Gana', 3, 0, 5, '2026'),
  ('Super Senior Futbolito', 'Nicolas Dominguez', 3, 0, 6, '2026'),
  ('Super Senior Futbolito', 'Huaso Echenique', 2, 0, 7, '2026'),
  ('Super Senior Futbolito', 'Felipe Cruz', 2, 0, 8, '2026'),
  ('Super Senior Futbolito', 'Manuel García de los Ríos', 1, 0, 9, '2026'),
  ('Super Senior Futbolito', 'Hernán Bustamante', 1, 0, 10, '2026'),
  ('Super Senior Futbolito', 'Pepe Hachondo', 1, 0, 11, '2026');

-- Correcciones en tabla jugadores
-- Felipe Reyes: fecha de nacimiento 2 nov 1983
UPDATE jugadores SET fecha_nacimiento = '1983-11-02'
WHERE apellido = 'Reyes' AND (nombre ILIKE '%Felipe%' OR apodo ILIKE '%Roto%');

-- José Miguel Echenique (Huaso): fecha 30 ene 1980, apellido Echenique (sin Ñ)
UPDATE jugadores SET fecha_nacimiento = '1980-01-30', apellido = 'Echenique'
WHERE apellido IN ('Echeñique', 'Echenique', 'Chenique') AND (nombre ILIKE '%Jose Miguel%' OR nombre ILIKE '%José Miguel%' OR apodo ILIKE '%Huaso%');
