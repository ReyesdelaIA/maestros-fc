import Image from "next/image";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

type PageProps = {
  params: {
    equipoId: string;
  };
};

type Jugador = {
  id: string;
  nombre: string;
  apodo: string | null;
  apellido: string;
  fecha_nacimiento: string | null;
  numero: number | null;
  posicion: string | null;
  goles?: number | null;
  asistencias?: number | null;
};

// Normaliza nombres para comparar sin tildes y sin diferencias de may/min.
function normalizarNombreClave(valor: string | null | undefined): string {
  if (!valor) return "";
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function calcularEdad(fechaStr: string | null): number | null {
  if (!fechaStr) return null;
  const fecha = new Date(fechaStr);
  if (Number.isNaN(fecha.getTime())) return null;

  const hoy = new Date();
  let edad = hoy.getFullYear() - fecha.getFullYear();
  const m = hoy.getMonth() - fecha.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) {
    edad--;
  }
  return edad;
}

function formatearFechaCumple(fechaStr: string | null): string {
  if (!fechaStr) return "";
  const fecha = new Date(fechaStr);
  if (Number.isNaN(fecha.getTime())) return fechaStr;

  return fecha.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function esCumpleañosHoy(fechaStr: string | null): boolean {
  if (!fechaStr) return false;
  const fecha = new Date(fechaStr);
  if (Number.isNaN(fecha.getTime())) return false;

  const hoy = new Date();
  return (
    fecha.getDate() === hoy.getDate() && fecha.getMonth() === hoy.getMonth()
  );
}

/** Colores del cuadrito de posición (Portero, Defensa, Mediocampo, Delantero) */
const POSICION_ESTILOS: Record<string, { label: string; className: string }> = {
  POR: {
    label: "POR",
    className: "bg-zinc-500 text-zinc-100 font-semibold",
  },
  DEF: {
    label: "DEF",
    className: "bg-emerald-600 text-white font-semibold",
  },
  MED: {
    label: "MED",
    className: "bg-cyan-500/90 text-cyan-950 font-semibold",
  },
  DEL: {
    label: "DEL",
    className: "bg-orange-500 text-white font-semibold",
  },
};

/** Orden de posiciones: arriba porteros, luego defensas, mediocampo, abajo delanteros */
const ORDEN_POSICION: Record<string, number> = {
  POR: 0,
  DEF: 1,
  MED: 2,
  DEL: 3,
};

async function getJugadoresConStats(equipoId: string) {
  // De momento mostramos todos los jugadores (solo tienes un equipo Maestros).
  // Más adelante podemos filtrar por equipo_id cuando tengas más equipos.
  const [jugadoresRes, goleadoresRes] = await Promise.all([
    supabase
      .from("jugadores")
      .select("id, nombre, apodo, apellido, fecha_nacimiento, numero, posicion")
      .order("apellido", { ascending: true }),
    supabase
      .from("goleadores")
      .select("nombre_jugador, goles, asistencias")
      .eq("temporada", "2026"),
  ]);

  const raw = (jugadoresRes.data ?? []) as Jugador[];
  const goleadores = (goleadoresRes.data ?? []) as {
    nombre_jugador: string;
    goles: number | null;
    asistencias: number | null;
  }[];

  const goleadoresMap = new Map<
    string,
    { goles: number | null; asistencias: number | null }
  >();
  for (const g of goleadores) {
    const key = normalizarNombreClave(g.nombre_jugador);
    if (!key) continue;
    goleadoresMap.set(key, { goles: g.goles, asistencias: g.asistencias });
  }

  const withStats: Jugador[] = raw.map((j) => {
    const fullNameKey = normalizarNombreClave(
      `${j.nombre} ${j.apellido}`,
    );
    const stats = goleadoresMap.get(fullNameKey);
    return {
      ...j,
      goles: stats?.goles ?? 0,
      asistencias: stats?.asistencias ?? 0,
    };
  });

  const jugadores = [...withStats].sort((a, b) => {
    const ordenA = a.posicion != null ? (ORDEN_POSICION[a.posicion] ?? 99) : 99;
    const ordenB = b.posicion != null ? (ORDEN_POSICION[b.posicion] ?? 99) : 99;
    if (ordenA !== ordenB) return ordenA - ordenB;
    return (a.apellido ?? "").localeCompare(b.apellido ?? "", "es");
  });

  if (jugadores.length === 0) {
    return {
      jugadores: [],
    } as const;
  }

  return {
    jugadores,
  } as const;
}

export default async function EquipoPage({ params }: PageProps) {
  const equipoId = params.equipoId;

  const { jugadores } = await getJugadoresConStats(equipoId);

  return (
    <div className="min-h-screen bg-black text-zinc-50">
      <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 px-4 pb-10 pt-6">
        <header className="border-b border-zinc-800 pb-4">
          <div className="mb-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300 hover:text-emerald-200"
            >
              <span aria-hidden>←</span>
              <span>Volver al dashboard</span>
            </Link>
          </div>

          <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-400">
              Plantel
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-50">
              Equipo #{equipoId}
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Lista de jugadores con edad, dorsales, goles y asistencias.
            </p>
          </div>
          </div>
        </header>

        {jugadores.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-400">
            Aún no hay jugadores registrados para este equipo. Guarda primero
            los jugadores en la tabla `jugadores` en Supabase.
          </p>
        ) : (
          <>
            {/* Encabezado: pos, jugador, #, edad, nac., goles/asistencias */}
            <div className="mt-3 mb-1 flex items-center gap-2 px-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
              <span className="w-9" />
              <span className="w-7" />
              <span className="min-w-0 flex-1">Jugador</span>
              <span className="w-6 text-center">#</span>
              <span className="w-8 text-center">Pos</span>
              <span className="w-9 text-right">Edad</span>
              <span className="hidden w-16 text-right sm:block">Nac.</span>
              <span className="w-14 text-right">G / A</span>
            </div>

            <ul className="divide-y divide-zinc-800/80 rounded-2xl border border-zinc-800 bg-zinc-950/70">
              {jugadores.map((jugador) => {
                const edad = calcularEdad(jugador.fecha_nacimiento);
                const cumpleHoy = esCumpleañosHoy(jugador.fecha_nacimiento);
                const posicionKey =
                  jugador.posicion === "POR" ||
                  jugador.posicion === "DEF" ||
                  jugador.posicion === "MED" ||
                  jugador.posicion === "DEL"
                    ? jugador.posicion
                    : null;
                const posEstilo = posicionKey
                  ? POSICION_ESTILOS[posicionKey]
                  : null;
                const posLabel = posEstilo?.label ?? jugador.posicion ?? "—";

                return (
                  <li
                    key={jugador.id}
                    className="flex items-center gap-2 px-2 py-1.5 text-[12px]"
                  >
                    <div
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded text-[10px]"
                      title={
                        posicionKey === "POR"
                          ? "Portero"
                          : posicionKey === "DEF"
                            ? "Defensa"
                            : posicionKey === "MED"
                              ? "Mediocampo"
                              : posicionKey === "DEL"
                                ? "Delantero"
                                : "Posición"
                      }
                    >
                      {posEstilo ? (
                        <span
                          className={`inline-flex h-6 w-7 items-center justify-center rounded ${posEstilo.className}`}
                        >
                          {posEstilo.label}
                        </span>
                      ) : (
                        <span className="inline-flex h-6 w-7 items-center justify-center rounded bg-zinc-700 text-[10px] text-zinc-400">
                          {posLabel}
                        </span>
                      )}
                    </div>

                    <div className="relative h-7 w-7 flex-shrink-0 overflow-hidden rounded-full bg-zinc-900">
                      <Image
                        src="/logo_maestros.png"
                        alt=""
                        fill
                        sizes="28px"
                        className="object-contain opacity-80"
                      />
                    </div>

                    <div className="min-w-0 flex-1 truncate">
                      <span className="font-medium text-zinc-50">
                        {jugador.nombre}
                      </span>
                      {jugador.apodo && (
                        <span
                          className="ml-1 font-bold italic text-amber-300"
                          style={{
                            textShadow:
                              "0 0 8px rgba(251,191,36,0.8), 0 0 3px rgba(245,158,11,0.7)",
                          }}
                        >
                          {jugador.apodo}
                        </span>
                      )}
                      <span className="ml-1 text-zinc-50">
                        {jugador.apellido}
                      </span>
                    </div>

                    <div className="flex w-6 flex-shrink-0 justify-center">
                      {typeof jugador.numero === "number" ? (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-500/70 bg-emerald-600/20 text-[10px] font-semibold text-emerald-100">
                          {jugador.numero}
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-500">—</span>
                      )}
                    </div>

                    <span className="w-8 flex-shrink-0 text-center text-[10px] text-zinc-400">
                      {posLabel}
                    </span>

                    <span className="w-9 flex-shrink-0 text-right text-[11px] text-zinc-400">
                      {edad !== null ? `${edad}` : "—"}
                    </span>

                    <span className="hidden w-16 flex-shrink-0 text-right text-[10px] text-zinc-500 sm:block">
                      {jugador.fecha_nacimiento
                        ? formatearFechaCumple(jugador.fecha_nacimiento)
                        : "—"}
                    </span>

                    <div className="flex w-14 flex-shrink-0 items-center justify-end gap-1">
                      <span
                        className="inline-flex items-center gap-0.5 rounded bg-zinc-900 px-1 py-0.5 text-[10px]"
                        title="Goles"
                      >
                        <span className="h-1 w-1 rounded-full bg-emerald-400" />
                        <span className="font-medium text-zinc-300">
                          {jugador.goles ?? 0}
                        </span>
                      </span>
                      <span
                        className="inline-flex items-center gap-0.5 rounded bg-zinc-900 px-1 py-0.5 text-[10px]"
                        title="Asistencias"
                      >
                        <span className="h-1 w-1 rounded-full bg-sky-400" />
                        <span className="font-medium text-zinc-300">
                          {jugador.asistencias ?? 0}
                        </span>
                      </span>
                    </div>

                    {cumpleHoy && (
                      <span
                        className="flex-shrink-0 text-[10px] text-emerald-400"
                        title="Cumpleaños hoy"
                      >
                        🎉
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}

