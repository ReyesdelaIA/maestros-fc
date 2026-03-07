type PlayerLike = {
  nombre: string;
  apellido: string;
};

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function apellidoPaterno(apellido: string): string {
  return apellido.trim().split(/\s+/)[0] ?? "";
}

function playerKey(player: PlayerLike): string {
  return normalizeText(`${player.nombre} ${apellidoPaterno(player.apellido)}`);
}

/** Ruta automática: /fotos-jugadores/nombre-apellido.jpg (ej: felipe-huidobro.jpg) */
function autoPhotoPath(player: PlayerLike): string {
  const key = playerKey(player).replace(/\s+/g, "-");
  return `/fotos-jugadores/${key}.jpg`;
}

// Sobrescribe manuales si hace falta (ej. apodo vs nombre en DB, otro apellido)
const PHOTO_OVERRIDE: Record<string, string> = {
  "rodrigo garces": "/toto.jpg",
  "luis moller": "/fotos-jugadores/lucho-moller.png",
  "felipe huidobro": "/fotos-jugadores/felipe-juidobro.png",
  "felipe guidobro": "/fotos-jugadores/felipe-juidobro.png",
  "felipe juidobro": "/fotos-jugadores/felipe-juidobro.png",
};

export function getPlayerPhotoSrc(player: PlayerLike): string | null {
  const key = playerKey(player);
  if (PHOTO_OVERRIDE[key]) return PHOTO_OVERRIDE[key];
  return autoPhotoPath(player);
}
