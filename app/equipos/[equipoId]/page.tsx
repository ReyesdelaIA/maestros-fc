import Image from "next/image";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

type PageProps = {
  params: Promise<{
    equipoId: string;
  }>;
};

type Jugador = {
  id: string;
  categoria: string | null;
  nombre: string;
  apodo: string | null;
  apellido: string;
  fecha_nacimiento: string | null;
  numero: number | null;
  posicion: string | null;
  posicion_2?: string | null;
  goles?: number | null;
  asistencias?: number | null;
};

const PLANTEL_POR_SLUG: Record<string, string> = {
  junior: "Junior Fútbol",
  senior: "Senior Fútbol",
  "ss-futbolito": "Super Senior Futbolito",
  "ss-martes": "Super Senior Fútbol",
  // Compatibilidad con enlace histórico que existía en home.
  "996573f0-857d-42fd-b5f1-ba046439f24a": "Super Senior Futbolito",
};

const LABEL_PLANTEL: Record<string, string> = {
  "Junior Fútbol": "Maestros Junior",
  "Senior Fútbol": "Maestros Senior",
  "Super Senior Futbolito": "Maestros SS futbolito",
  "Super Senior Fútbol": "Maestros SS martes",
};

/** Parsea fecha YYYY-MM-DD como fecha local (evita desfase de 1 día por timezone) */
function parseFechaLocal(fechaStr: string | null): Date | null {
  if (!fechaStr) return null;
  const match = fechaStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, y, m, d] = match;
  const fecha = new Date(parseInt(y!, 10), parseInt(m!, 10) - 1, parseInt(d!, 10));
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

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
  const fecha = parseFechaLocal(fechaStr);
  if (!fecha) return null;

  const hoy = new Date();
  let edad = hoy.getFullYear() - fecha.getFullYear();
  const m = hoy.getMonth() - fecha.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) {
    edad--;
  }
  return edad;
}

function formatearFechaCumple(fechaStr: string | null): string {
  const fecha = parseFechaLocal(fechaStr);
  if (!fecha) return fechaStr ?? "";

  return fecha.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function esCumpleañosHoy(fechaStr: string | null): boolean {
  const fecha = parseFechaLocal(fechaStr);
  if (!fecha) return false;

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

function normalizarPosicion(pos: string | null | undefined): "POR" | "DEF" | "MED" | "DEL" | null {
  if (!pos) return null;
  const clean = pos.trim().toUpperCase();
  if (clean === "VOL" || clean === "NED") return "MED";
  if (clean === "POR" || clean === "DEF" || clean === "MED" || clean === "DEL") return clean;
  return null;
}

function obtenerApellidoPaterno(apellido: string | null | undefined): string {
  if (!apellido) return "";
  return apellido.trim().split(/\s+/)[0] ?? "";
}

async function getJugadoresConStats(equipoId: string) {
  const categoriaFiltro = PLANTEL_POR_SLUG[equipoId] ?? null;
  const jugadoresQuery = supabase
    .from("jugadores")
    .select("id, categoria, nombre, apodo, apellido, fecha_nacimiento, numero, posicion, posicion_2")
    .order("apellido", { ascending: true });

  const jugadoresQueryFiltrada = categoriaFiltro
    ? jugadoresQuery.eq("categoria", categoriaFiltro)
    : jugadoresQuery;

  const [jugadoresRes, goleadoresRes] = await Promise.all([
    jugadoresQueryFiltrada,
    supabase
      .from("goleadores")
      .select("categoria, nombre_jugador, goles, asistencias")
      .eq("temporada", "2026")
      .eq("categoria", categoriaFiltro ?? ""),
  ]);

  const raw = (jugadoresRes.data ?? []) as Jugador[];
  const goleadores = (goleadoresRes.data ?? []) as {
    categoria?: string | null;
    nombre_jugador: string;
    goles: number | null;
    asistencias: number | null;
  }[];

  const goleadoresMap = new Map<
    string,
    { goles: number | null; asistencias: number | null }
  >();
  const addGoleadorKey = (
    key: string,
    stats: { goles: number | null; asistencias: number | null },
  ) => {
    if (!key) return;
    if (!goleadoresMap.has(key)) goleadoresMap.set(key, stats);
  };

  for (const g of goleadores) {
    const key = normalizarNombreClave(g.nombre_jugador);
    if (!key) continue;
    const stats = { goles: g.goles, asistencias: g.asistencias };
    addGoleadorKey(key, stats);

    // También indexamos por "nombre + apellido paterno" para calzar con la planilla.
    const partes = key.split(" ").filter(Boolean);
    if (partes.length >= 2) {
      const apellidoPaterno = partes[partes.length - 1];
      const nombreSinApellido = partes.slice(0, -1).join(" ");
      addGoleadorKey(`${nombreSinApellido} ${apellidoPaterno}`.trim(), stats);
    }
  }

  const withStats: Jugador[] = raw.map((j) => {
    const apellidoPaterno = obtenerApellidoPaterno(j.apellido);
    const fullNameKey = normalizarNombreClave(`${j.nombre} ${j.apellido}`);
    const nombreApellidoPaternoKey = normalizarNombreClave(
      `${j.nombre} ${apellidoPaterno}`,
    );
    const apodoApellidoCompletoKey = j.apodo
      ? normalizarNombreClave(`${j.apodo} ${j.apellido}`)
      : "";
    const apodoApellidoPaternoKey = j.apodo
      ? normalizarNombreClave(`${j.apodo} ${apellidoPaterno}`)
      : "";

    const stats =
      goleadoresMap.get(fullNameKey) ??
      goleadoresMap.get(nombreApellidoPaternoKey) ??
      (apodoApellidoCompletoKey
        ? goleadoresMap.get(apodoApellidoCompletoKey)
        : undefined) ??
      (apodoApellidoPaternoKey
        ? goleadoresMap.get(apodoApellidoPaternoKey)
        : undefined);
    return {
      ...j,
      goles: stats?.goles ?? 0,
      asistencias: stats?.asistencias ?? 0,
    };
  });

  const jugadores = [...withStats].sort((a, b) => {
    const posicionA = normalizarPosicion(a.posicion) ?? normalizarPosicion(a.posicion_2);
    const posicionB = normalizarPosicion(b.posicion) ?? normalizarPosicion(b.posicion_2);
    const ordenA = posicionA != null ? (ORDEN_POSICION[posicionA] ?? 99) : 99;
    const ordenB = posicionB != null ? (ORDEN_POSICION[posicionB] ?? 99) : 99;
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
    categoriaFiltro,
  } as const;
}

export default async function EquipoPage({ params }: PageProps) {
  const { equipoId } = await params;

  const { jugadores, categoriaFiltro } = await getJugadoresConStats(equipoId);
  const tituloEquipo = categoriaFiltro
    ? LABEL_PLANTEL[categoriaFiltro] ?? categoriaFiltro
    : `Equipo #${equipoId}`;

  const resumenPlantel = jugadores.reduce(
    (acc, jugador) => {
      const pos =
        normalizarPosicion(jugador.posicion) ??
        normalizarPosicion(jugador.posicion_2);
      if (pos) acc[pos] += 1;
      return acc;
    },
    { POR: 0, DEF: 0, MED: 0, DEL: 0 } as Record<
      "POR" | "DEF" | "MED" | "DEL",
      number
    >,
  );

  return (
    <div className="min-h-screen bg-black text-zinc-50">
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-4 pb-10 pt-6">
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
              {tituloEquipo}
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
            <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                Resumen del plantel
              </p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-zinc-50">
                  {jugadores.length}
                </span>
                <span className="pb-1 text-xs uppercase text-zinc-400">
                  jugadores
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(["POR", "DEF", "MED", "DEL"] as const).map((pos) => (
                  <div
                    key={pos}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-2 py-2 text-center"
                  >
                    <span
                      className={`inline-flex h-5 min-w-8 items-center justify-center rounded px-1 text-[10px] ${POSICION_ESTILOS[pos].className}`}
                    >
                      {POSICION_ESTILOS[pos].label}
                    </span>
                    <p className="mt-1 text-lg font-bold text-zinc-100">
                      {resumenPlantel[pos]}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Encabezado: posición, jugador, dorsal, edad, nac., goles/asistencias */}
            <div className="mt-3 mb-1 flex items-center gap-2 px-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
              <span className="w-16 text-left">Posición</span>
              <span className="w-7" />
              <span className="min-w-0 flex-1">Jugador</span>
              <span className="w-12 text-center">Dorsal</span>
              <span className="w-9 text-right">Edad</span>
              <span className="hidden w-16 text-right sm:block">Nac.</span>
              <span className="w-14 text-right">G / A</span>
            </div>

            <ul className="divide-y divide-zinc-800/80 rounded-2xl border border-zinc-800 bg-zinc-950/70">
              {jugadores.map((jugador) => {
                const edad = calcularEdad(jugador.fecha_nacimiento);
                const cumpleHoy = esCumpleañosHoy(jugador.fecha_nacimiento);
                const apellidoPaterno = obtenerApellidoPaterno(jugador.apellido);
                const posicionPrincipal = normalizarPosicion(jugador.posicion);
                const posicionSecundariaRaw = normalizarPosicion(jugador.posicion_2);
                const posicionSecundaria =
                  posicionSecundariaRaw && posicionSecundariaRaw !== posicionPrincipal
                    ? posicionSecundariaRaw
                    : null;
                const posLabel = posicionPrincipal ?? jugador.posicion ?? "—";

                return (
                  <li
                    key={jugador.id}
                    className="flex items-center gap-2 px-2 py-1.5 text-[12px]"
                  >
                    <div
                      className="flex h-7 w-16 flex-shrink-0 items-center justify-start gap-1 rounded text-[10px]"
                      title={
                        posicionPrincipal === "POR"
                          ? "Portero"
                          : posicionPrincipal === "DEF"
                            ? "Defensa"
                            : posicionPrincipal === "MED"
                              ? "Mediocampo"
                              : posicionPrincipal === "DEL"
                                ? "Delantero"
                                : "Posición"
                      }
                    >
                      {posicionPrincipal ? (
                        <span
                          className={`inline-flex h-5 min-w-8 items-center justify-center rounded px-1 text-[10px] ${POSICION_ESTILOS[posicionPrincipal].className}`}
                        >
                          {POSICION_ESTILOS[posicionPrincipal].label}
                        </span>
                      ) : (
                        <span className="inline-flex h-5 min-w-8 items-center justify-center rounded bg-zinc-700 px-1 text-[10px] text-zinc-400">
                          {posLabel}
                        </span>
                      )}
                      {posicionSecundaria && (
                        <span
                          className={`inline-flex h-5 min-w-8 items-center justify-center rounded px-1 text-[10px] ${POSICION_ESTILOS[posicionSecundaria].className}`}
                          title="Posición secundaria"
                        >
                          {POSICION_ESTILOS[posicionSecundaria].label}
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

                    <Link
                      href={`/jugadores/${jugador.id}`}
                      className="min-w-0 flex-1 truncate rounded px-1 py-0.5 hover:bg-zinc-900/70"
                    >
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
                      <span className="ml-1 text-zinc-50">{apellidoPaterno}</span>
                    </Link>

                    <div className="flex w-12 flex-shrink-0 justify-center">
                      {typeof jugador.numero === "number" ? (
                        <span className="flex h-6 min-w-6 items-center justify-center rounded-full border border-emerald-500/70 bg-emerald-600/20 px-1 text-[10px] font-semibold text-emerald-100">
                          {jugador.numero}
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-500">—</span>
                      )}
                    </div>

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

