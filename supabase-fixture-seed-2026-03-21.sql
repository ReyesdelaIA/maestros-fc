-- Seed de partidos ficticios
-- Fecha: sábado 21 de marzo de 2026
-- Nota: "20 pm" se interpreta como 20:00

INSERT INTO fixture_partidos (categoria, rival, fecha_partido, hora, cancha, estado)
SELECT v.categoria, v.rival, v.fecha_partido, v.hora, v.cancha, 'programado'
FROM (
  VALUES
    ('Junior Fútbol', 'Manyas', '2026-03-21'::date, '12:30', 'Cancha 2'),
    ('Senior Fútbol', 'Dako', '2026-03-21'::date, '11:00', 'Cancha 1'),
    ('Super Senior Futbolito', 'Chilcano', '2026-03-21'::date, '10:00', 'Cancha 6'),
    ('Super Senior Fútbol', 'Boedo', '2026-03-21'::date, '20:00', 'Cancha 1')
) AS v(categoria, rival, fecha_partido, hora, cancha)
WHERE NOT EXISTS (
  SELECT 1
  FROM fixture_partidos f
  WHERE f.categoria = v.categoria
    AND f.rival = v.rival
    AND f.fecha_partido = v.fecha_partido
    AND COALESCE(f.hora, '') = COALESCE(v.hora, '')
    AND COALESCE(f.cancha, '') = COALESCE(v.cancha, '')
);
