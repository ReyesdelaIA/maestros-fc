/**
 * Etiquetas cortas para equipos/categorías.
 * Nunca mostrar "Maestros" en la UI; usar Junior, Senior, SS Futbolito, SS Fútbol.
 */

/** Categorías de plantel (BD: Junior Fútbol, Senior Fútbol, etc.) */
export const CATEGORY_LABELS: Record<string, string> = {
  "Junior Fútbol": "Junior",
  "Senior Fútbol": "Senior",
  "Super Senior Futbolito": "SS Futbolito",
  "Super Senior Fútbol": "SS Fútbol",
};

/** Equipos de títulos (BD: Maestros Junior, Maestros SS Martes, etc.) */
export const EQUIPO_TITULOS_LABELS: Record<string, string> = {
  "Maestros Junior": "Junior",
  "Maestros Senior": "Senior",
  "Maestros SS Futbolito": "SS Futbolito",
  "Maestros SS Martes": "SS Fútbol",
};

export function getCategoriaLabel(categoria: string | null | undefined): string {
  if (!categoria) return "";
  return CATEGORY_LABELS[categoria] ?? categoria;
}

export function getEquipoTitulosLabel(equipo: string | null | undefined): string {
  if (!equipo) return "";
  return EQUIPO_TITULOS_LABELS[equipo] ?? equipo;
}
