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

// Fotos conocidas hoy. Cuando subamos más fotos, se agregan aquí.
const PHOTO_BY_PLAYER_KEY: Record<string, string> = {
  "rodrigo garces": "/toto.jpg",
};

export function getPlayerPhotoSrc(player: PlayerLike): string | null {
  const key = playerKey(player);
  return PHOTO_BY_PLAYER_KEY[key] ?? null;
}
