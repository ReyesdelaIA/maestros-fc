-- Agregar 2 títulos faltantes a Maestros Junior
-- Ejecutar en Supabase → SQL Editor → New query → pegar y Run

INSERT INTO titulos_maestros (equipo, anio, detalle)
VALUES
  ('Maestros Junior', 2019, 'Clausura 2019'),
  ('Maestros Junior', 2022, 'Clausura 2022');
