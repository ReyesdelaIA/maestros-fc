-- Actualizar posiciones de jugadores en la tabla `jugadores`
-- Ejecutar en Supabase: SQL Editor → pegar y Run
-- Incluye variantes SIN ACENTO y grafías distintas (Pelao/Pelado, Payo/Pallo, Bunster, Kattan, etc.)

-- DEF Pepe Hachondo
UPDATE jugadores SET posicion = 'DEF' WHERE apellido IN ('Hachondo') OR apodo ILIKE '%Pepe Hachondo%' OR (nombre ILIKE '%Pepe%' AND apellido ILIKE '%Hachondo%');

-- MED Neiro Amenábar (con y sin acento)
UPDATE jugadores SET posicion = 'MED' WHERE apellido IN ('Amenábar', 'Amenabar') OR apodo ILIKE '%Neiro%';

-- MED Diego Boonstar / Bunster (dos grafías)
UPDATE jugadores SET posicion = 'MED' WHERE apodo ILIKE '%Boonstar%' OR apodo ILIKE '%Bunster%' OR apellido IN ('Boonstar', 'Bunster');

-- POR Hernán / Hernan Bustamante
UPDATE jugadores SET posicion = 'POR' WHERE apellido = 'Bustamante' AND (nombre ILIKE '%Hernán%' OR nombre ILIKE '%Hernan%');

-- MED Pelado / Pelao Calvo
UPDATE jugadores SET posicion = 'MED' WHERE apellido = 'Calvo' AND (apodo ILIKE '%Pelado%' OR apodo ILIKE '%Pelao%');

-- DEF Pallo / Payo Correa
UPDATE jugadores SET posicion = 'DEF' WHERE apellido = 'Correa' AND (apodo ILIKE '%Pallo%' OR apodo ILIKE '%Payo%');

-- MED Chato Costa
UPDATE jugadores SET posicion = 'MED' WHERE apellido = 'Costa' AND (apodo ILIKE '%Chato%' OR apodo = 'Chato');

-- DEF Tomás / Tomas Covarrubias
UPDATE jugadores SET posicion = 'DEF' WHERE apellido = 'Covarrubias' AND (nombre ILIKE '%Tomás%' OR nombre ILIKE '%Tomas%');

-- MED Chino Díaz / Diaz
UPDATE jugadores SET posicion = 'MED' WHERE apellido IN ('Díaz', 'Diaz') AND (apodo ILIKE '%Chino%' OR apodo = 'Chino');

-- DEL Chumi Domínguez / Dominguez
UPDATE jugadores SET posicion = 'DEL' WHERE apellido IN ('Domínguez', 'Dominguez') AND (apodo ILIKE '%Chumi%' OR apodo = 'Chumi' OR nombre ILIKE '%Francisco%');

-- DEF Nico / Nicolas Domínguez / Dominguez
UPDATE jugadores SET posicion = 'DEF' WHERE apellido IN ('Domínguez', 'Dominguez') AND (apodo ILIKE '%Nico%' OR nombre ILIKE '%Nico%' OR nombre ILIKE '%Nicolas%');

-- DEL Huaso (con H) / Uguaso / Guaso — Chenique / Echeñique / Echenique
UPDATE jugadores SET posicion = 'DEL' WHERE apellido IN ('Chenique', 'Echeñique', 'Echenique') AND (apodo ILIKE '%Huaso%' OR apodo ILIKE '%Uguaso%' OR apodo ILIKE '%Guaso%');

-- DEF Cristian Gana
UPDATE jugadores SET posicion = 'DEF' WHERE apellido = 'Gana' AND (nombre ILIKE '%Cristian%' OR apodo ILIKE '%Cristian%');

-- MED Lucho Gana
UPDATE jugadores SET posicion = 'MED' WHERE apellido = 'Gana' AND (apodo ILIKE '%Lucho%' OR apodo = 'Lucho');

-- MED Toto Garcés / Garces
UPDATE jugadores SET posicion = 'MED' WHERE apellido IN ('Garcés', 'Garces') AND (apodo ILIKE '%Toto%' OR apodo = 'Toto');

-- DEL Manuel García de los Ríos (apellido puede ser "García de los Ríos" o "Garcia de los Rios")
UPDATE jugadores SET posicion = 'DEL' WHERE nombre ILIKE '%Manuel%' AND (apellido ILIKE '%García%' OR apellido ILIKE '%Garcia%') AND (apellido ILIKE '%Ríos%' OR apellido ILIKE '%Rios%' OR apellido IN ('García', 'Garcia'));

-- DEL Sebastián / Sebastian Chama González / Gonzalez
UPDATE jugadores SET posicion = 'DEL' WHERE apellido IN ('González', 'Gonzalez') AND (apodo ILIKE '%Chama%' OR apodo = 'Chama' OR nombre ILIKE '%Sebastián%' OR nombre ILIKE '%Sebastian%');

-- DEL Rodrigo Guzmán / Guzman
UPDATE jugadores SET posicion = 'DEL' WHERE apellido IN ('Guzmán', 'Guzman') AND nombre ILIKE '%Rodrigo%';

-- POR César / Cesar Catán / Kattan
UPDATE jugadores SET posicion = 'POR' WHERE apellido IN ('Catán', 'Kattan', 'Catan', 'Katan') AND (nombre ILIKE '%César%' OR nombre ILIKE '%Cesar%' OR apodo ILIKE '%Catán%' OR apodo ILIKE '%Kattan%');

-- DEF Raúl / Raul Lagos
UPDATE jugadores SET posicion = 'DEF' WHERE apellido = 'Lagos' AND (nombre ILIKE '%Raúl%' OR nombre ILIKE '%Raul%');

-- MED Roto Reyes
UPDATE jugadores SET posicion = 'MED' WHERE apellido = 'Reyes' AND (apodo ILIKE '%Roto%' OR apodo = 'Roto');

-- MED Matías / Matias Suárez / Suarez
UPDATE jugadores SET posicion = 'MED' WHERE apellido IN ('Suárez', 'Suarez') AND (nombre ILIKE '%Matías%' OR nombre ILIKE '%Matias%');

-- DEF Patricio Valdés / Valdes
UPDATE jugadores SET posicion = 'DEF' WHERE apellido IN ('Valdés', 'Valdes') AND nombre ILIKE '%Patricio%';
