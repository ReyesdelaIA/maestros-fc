import Image from "next/image";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import MensajePresidenteCard from "./components/MensajePresidenteCard";
import RecuerdoMaestroCard from "./components/RecuerdoMaestroCard";
import StickerDelMesCard from "./components/StickerDelMesCard";
import EntrevistaMaestraCard from "./components/EntrevistaMaestraCard";

// Evitar caché: siempre traer datos frescos de Supabase
export const dynamic = "force-dynamic";

const CLUB_NAME = "Maestros";

const CATEGORIES = [
  "Junior Fútbol",
  "Senior Fútbol",
  "Super Senior Futbolito",
  "Super Senior Fútbol",
] as const;

type CategoryName = (typeof CATEGORIES)[number];

const CATEGORY_LABELS: Record<CategoryName, string> = {
  "Junior Fútbol": "Maestros Junior",
  "Senior Fútbol": "Maestros Senior",
  "Super Senior Futbolito": "Maestros SS futbolito",
  "Super Senior Fútbol": "Maestros SS martes",
};

// Etiqueta que va arriba de cada caja del resumen
const RESUMEN_ETIQUETA_ARRIBA: Record<CategoryName, string> = {
  "Junior Fútbol": "Maestros Junior",
  "Senior Fútbol": "Maestros Senior",
  "Super Senior Futbolito": "Maestros SS futbolito",
  "Super Senior Fútbol": "Maestros SS martes",
};

// Logo del rival por nombre (archivo en /public)
const RIVAL_LOGO: Record<string, string> = {
  "La Gloria": "/lagoria.png",
  "Palestino": "/palestino.png",
  "Boedo": "/boedo.png",
  "Cachamama": "/cachamama.png",
  CSYDA: "/CSYDA.png",
};

type UltimoResultado = {
  id: number;
  categoria: CategoryName | string | null;
  rival: string | null;
  goles_maestros: number | null;
  goles_rival: number | null;
  fecha_partido: string | null;
  cancha?: string | null;
  // Cualquier otra columna se mantiene sin tipar estrictamente.
  [key: string]: unknown;
};

type Posicion = {
  id: number;
  categoria: CategoryName | string | null;
  equipo: string;
  pj?: number | null;
  pts?: number | null;
  gf?: number | null;
  gc?: number | null;
  dg?: number | null;
  [key: string]: unknown;
};

type ProximoPartido = {
  id: number;
  categoria: CategoryName | string | null;
  rival: string | null;
  fecha_partido: string | null;
  hora?: string | null;
  cancha?: string | null;
  [key: string]: unknown;
};

type FilaClausura = {
  id: string;
  posicion: number;
  equipo: string;
  partidos_jugados: number;
  ganados: number;
  empatados: number;
  perdidos: number;
  diferencia_gol: number;
  ultimos_5: string | null;
  puntos: number;
};

type Goleador = {
  id: string;
  categoria: string;
  nombre_jugador: string;
  goles: number;
  asistencias: number;
  posicion_ranking: number;
  temporada: string;
};

type JugadorCumple = {
  id: string;
  nombre: string;
  apodo: string | null;
  apellido: string;
  fecha_nacimiento: string | null;
};

type Titulo = {
  id: string;
  equipo: string;
  anio: number;
  detalle: string;
};

/** Parsea fecha YYYY-MM-DD como fecha local (evita desfase de 1 día por timezone) */
function parseFechaLocal(fechaStr: string | null): Date | null {
  if (!fechaStr) return null;
  const match = fechaStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, y, m, d] = match;
  const fecha = new Date(
    parseInt(y!, 10),
    parseInt(m!, 10) - 1,
    parseInt(d!, 10),
  );
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function calcularProximoCumple(
  jugadores: JugadorCumple[],
): { jugador: JugadorCumple; fecha: Date; diasRestantes: number } | null {
  if (!jugadores.length) return null;

  const hoy = new Date();
  const hoyInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  let mejor:
    | { jugador: JugadorCumple; fecha: Date; diasRestantes: number }
    | null = null;

  for (const jugador of jugadores) {
    const nacimiento = parseFechaLocal(jugador.fecha_nacimiento);
    if (!nacimiento) continue;

    let cumpleEsteAnio = new Date(
      hoyInicio.getFullYear(),
      nacimiento.getMonth(),
      nacimiento.getDate(),
    );

    if (cumpleEsteAnio < hoyInicio) {
      cumpleEsteAnio = new Date(
        hoyInicio.getFullYear() + 1,
        nacimiento.getMonth(),
        nacimiento.getDate(),
      );
    }

    const diffMs = cumpleEsteAnio.getTime() - hoyInicio.getTime();
    const diasRestantes = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (!mejor || diasRestantes < mejor.diasRestantes) {
      mejor = { jugador, fecha: cumpleEsteAnio, diasRestantes };
    }
  }

  return mejor;
}

async function getDashboardData() {
  const [
    ultimosResultadosRes,
    posicionesRes,
    clausuraRes,
    proximosPartidosRes,
    goleadoresRes,
    titulosRes,
    jugadoresCumpleRes,
  ] = await Promise.all([
    supabase
      .from("vista_ultimos_resultados")
      .select("*")
      .order("fecha_partido", { ascending: false })
      .limit(12),
    supabase
      .from("posiciones")
      .select("*")
      .in("categoria", CATEGORIES as readonly string[])
      .order("pts", { ascending: false })
      .order("dg", { ascending: false }),
    supabase
      .from("tabla_clausura_2015")
      .select("*")
      .order("posicion", { ascending: true }),
    supabase.from("partidos").select("*").limit(8),
    supabase
      .from("goleadores")
      .select(
        "id, categoria, nombre_jugador, goles, asistencias, posicion_ranking, temporada",
      )
      .eq("temporada", "2026")
      .order("posicion_ranking", { ascending: true }),
    supabase
      .from("titulos_maestros")
      .select("id, equipo, anio, detalle")
      .order("equipo", { ascending: true })
      .order("anio", { ascending: true }),
    supabase
      .from("jugadores")
      .select("id, nombre, apodo, apellido, fecha_nacimiento")
      .not("fecha_nacimiento", "is", null),
  ]);

  const ultimosResultados = (ultimosResultadosRes.data ??
    []) as UltimoResultado[];
  const posiciones = (posicionesRes.data ?? []) as Posicion[];
  const proximosPartidos = (proximosPartidosRes.data ??
    []) as ProximoPartido[];
  const tablaClausura2015 = (clausuraRes.data ?? []) as FilaClausura[];
  const clausuraError = clausuraRes.error;
  const goleadores = (goleadoresRes.data ?? []) as Goleador[];
  const titulos = (titulosRes.data ?? []) as Titulo[];
  const jugadoresCumple = (jugadoresCumpleRes.data ?? []) as JugadorCumple[];

  return {
    ultimosResultados,
    posiciones,
    proximosPartidos,
    tablaClausura2015,
    clausuraError: clausuraError?.message ?? null,
    goleadores,
    titulos,
    jugadoresCumple,
  };
}

function isMaestrosTeam(name: string | null | undefined) {
  if (!name) return false;
  return name.toLowerCase().includes(CLUB_NAME.toLowerCase());
}

function getResultadoEtiqueta(resultado: UltimoResultado) {
  const gf = resultado.goles_maestros ?? 0;
  const gc = resultado.goles_rival ?? 0;

  if (gf > gc) return "Victoria";
  if (gf < gc) return "Derrota";
  return "Empate";
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("es-CL", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("es-CL", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

export default async function Home() {
  const {
    ultimosResultados,
    posiciones,
    proximosPartidos,
    tablaClausura2015,
    clausuraError,
    goleadores,
    titulos,
    jugadoresCumple,
  } = await getDashboardData();

  // Agrupamos datos por categoría para renderizar secciones compactas.
  const posicionesPorCategoria: Record<string, Posicion[]> = {};
  for (const row of posiciones) {
    const key = row.categoria ?? "Sin categoría";
    if (!posicionesPorCategoria[key]) posicionesPorCategoria[key] = [];
    posicionesPorCategoria[key].push(row);
  }

  const goleadoresPorCategoria: Record<string, Goleador[]> = {};
  for (const row of goleadores) {
    const key = row.categoria ?? "";
    if (!goleadoresPorCategoria[key]) goleadoresPorCategoria[key] = [];
    goleadoresPorCategoria[key].push(row);
  }

  const resultadosPorCategoria: Record<string, UltimoResultado[]> = {};
  for (const row of ultimosResultados) {
    const key = row.categoria ?? "General";
    if (!resultadosPorCategoria[key]) resultadosPorCategoria[key] = [];
    resultadosPorCategoria[key].push(row);
  }

  // Títulos por equipo (usamos la tabla titulos_maestros)
  const TITULOS_ORDER = [
    "Maestros Junior",
    "Maestros Senior",
    "Maestros SS Futbolito",
    "Maestros SS Martes",
  ] as const;

  // Deduplicar por (equipo, anio, detalle) por si hay filas repetidas en la BD
  const titulosUnicos: Titulo[] = [];
  const vistos = new Set<string>();
  for (const t of titulos) {
    const equipoKey = (t.equipo ?? "").trim().toLowerCase();
    const detalleKey = (t.detalle ?? "").trim().toLowerCase();
    const clave = `${equipoKey}|${t.anio}|${detalleKey}`;
    if (vistos.has(clave)) continue;
    vistos.add(clave);
    titulosUnicos.push(t);
  }

  const titulosPorEquipo: Record<string, Titulo[]> = {};
  for (const t of titulosUnicos) {
    const key = t.equipo;
    if (!titulosPorEquipo[key]) titulosPorEquipo[key] = [];
    titulosPorEquipo[key].push(t);
  }

  // Ordenamos cada grupo por año y luego por detalle
  for (const key of Object.keys(titulosPorEquipo)) {
    titulosPorEquipo[key].sort((a, b) => {
      if (a.anio !== b.anio) return a.anio - b.anio;
      return a.detalle.localeCompare(b.detalle, "es");
    });
  }

  const totalTitulos = titulosUnicos.length;

  const esTituloAnual = (t: Titulo) =>
    (t.detalle ?? "").toLowerCase().includes("anual");

  const titulosOrdenadosParaCopas = [...titulosUnicos].sort((a, b) => {
    const aAnual = esTituloAnual(a);
    const bAnual = esTituloAnual(b);
    if (aAnual !== bAnual) return aAnual ? -1 : 1;
    return a.anio - b.anio || a.detalle.localeCompare(b.detalle, "es");
  });

  // Resumen de títulos ordenado de mayor a menor cantidad (y luego por orden preferido)
  const resumenTitulos = (() => {
    const ordenIndex: Record<string, number> = {};
    TITULOS_ORDER.forEach((eq, idx) => {
      ordenIndex[eq] = idx;
    });

    return TITULOS_ORDER
      .map((equipo) => {
        const lista = titulosPorEquipo[equipo] ?? [];
        const cantidad = lista.length;
        return { equipo, cantidad, lista };
      })
      .sort((a, b) => {
        if (b.cantidad !== a.cantidad) return b.cantidad - a.cantidad;
        return (ordenIndex[a.equipo] ?? 0) - (ordenIndex[b.equipo] ?? 0);
      });
  })();

  const proximoPorCategoria: Record<string, ProximoPartido | undefined> = {};
  for (const cat of CATEGORIES) {
    proximoPorCategoria[cat] = proximosPartidos.find(
      (p) => p.categoria === cat || isMaestrosTeam(p.rival)
    );
  }

  const proximoCumple = calcularProximoCumple(jugadoresCumple);
  const proximoCumpleFechaEtiqueta =
    proximoCumple?.fecha.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
    }) ?? "";

  return (
    <div className="min-h-screen bg-black text-zinc-50">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        {/* Header */}
        <header className="flex flex-col gap-4 border-b border-emerald-700/40 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border border-emerald-500/70 bg-black shadow-md shadow-emerald-900/70 sm:h-24 sm:w-24">
              <Image
                src="/logo_maestros.png"
                alt="Escudo Maestros FC"
                fill
                sizes="96px"
                className="object-contain p-1.5"
                priority
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
                Club de Fútbol
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">
                Maestros FC
              </h1>
              <p className="mt-1 text-sm text-zinc-400 sm:text-base">
                Dashboard de rendimiento • Resultados, tabla y próxima fecha.
              </p>
            </div>
          </div>

          <div className="flex justify-end sm:items-end">
            <Link
              href="/admin"
              className="inline-flex items-center rounded-full border border-emerald-500/70 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300 hover:bg-emerald-500/20"
            >
              Registrar resultado
            </Link>
          </div>
        </header>

        {/* Resumen del último fin de semana */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-zinc-50">
                Resumen del último fin de semana
              </h2>
              <span className="rounded-full border border-emerald-500/60 bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                dic 2025
              </span>
            </div>
            <span className="text-xs text-zinc-400">
              Actualizado automáticamente desde Supabase
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {CATEGORIES.map((categoria) => {
              const lista = resultadosPorCategoria[categoria] ?? [];
              let ultimo: UltimoResultado | undefined = lista[0];
              // Placeholder para Maestros FC futbolito: último partido 2-4 vs La Gloria (derrota)
              if (!ultimo && categoria === "Super Senior Futbolito") {
                ultimo = {
                  id: 0,
                  categoria,
                  rival: "La Gloria",
                  goles_maestros: 2,
                  goles_rival: 4,
                  fecha_partido: null,
                };
              }
              // Placeholder para Maestros SS Martes: último partido 0-1 vs Palestino (derrota)
              if (!ultimo && categoria === "Super Senior Fútbol") {
                ultimo = {
                  id: 0,
                  categoria,
                  rival: "Palestino",
                  goles_maestros: 0,
                  goles_rival: 1,
                  fecha_partido: null,
                };
              }
              // Placeholder para Maestros Senior: último partido 1-0 vs CSYDA (victoria)
              if (!ultimo && categoria === "Senior Fútbol") {
                ultimo = {
                  id: 0,
                  categoria,
                  rival: "CSYDA",
                  goles_maestros: 1,
                  goles_rival: 0,
                  fecha_partido: null,
                };
              }
              // Placeholder para Maestros Junior: último partido 1-0 vs Cachamama (victoria)
              if (!ultimo && categoria === "Junior Fútbol") {
                ultimo = {
                  id: 0,
                  categoria,
                  rival: "Cachamama",
                  goles_maestros: 1,
                  goles_rival: 0,
                  fecha_partido: null,
                };
              }
              const esFutbolitoSuperSenior =
                categoria === "Super Senior Futbolito";
              const etiquetaArriba = RESUMEN_ETIQUETA_ARRIBA[categoria];

              const BotonPlantilla = esFutbolitoSuperSenior ? (
                <Link
                  href="/equipos/996573f0-857d-42fd-b5f1-ba046439f24a"
                  className="w-fit rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-semibold text-black shadow-md shadow-emerald-900 transition hover:bg-emerald-400"
                >
                  Ver plantilla 2026
                </Link>
              ) : (
                <span className="w-fit rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-[10px] font-medium text-zinc-500">
                  Ver plantilla 2026
                </span>
              );

              if (!ultimo) {
                return (
                  <div key={categoria} className="flex h-full flex-col gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                      {etiquetaArriba}
                    </p>
                    {BotonPlantilla}
                    <article className="flex min-h-[140px] flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-sm">
                      <p className="text-sm text-zinc-400">
                        Aún no hay partidos registrados para este fin de semana.
                      </p>
                    </article>
                  </div>
                );
              }

              const ganamos = (ultimo.goles_maestros ?? 0) > (ultimo.goles_rival ?? 0);
              const empate = (ultimo.goles_maestros ?? 0) === (ultimo.goles_rival ?? 0);
              const marcador = `${ultimo.goles_maestros ?? "-"} - ${ultimo.goles_rival ?? "-"}`;
              const rivalNombre = ultimo.rival ?? "Rival";
              const logoRival = RIVAL_LOGO[rivalNombre] ?? null;

              return (
                <div key={categoria} className="flex h-full flex-col gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                    {etiquetaArriba}
                  </p>
                  {BotonPlantilla}
                  <article
                    className={`relative min-h-[140px] overflow-hidden rounded-2xl border p-3 shadow-md ${
                      ganamos
                        ? "border-emerald-600/70 bg-gradient-to-br from-emerald-900/90 via-emerald-950/80 to-zinc-950"
                        : empate
                          ? "border-zinc-600 bg-zinc-900/80"
                          : "border-red-700/60 bg-gradient-to-br from-red-950/90 via-red-900/70 to-zinc-950"
                    }`}
                  >
                    <div className="relative z-10 flex h-full w-full flex-row items-center justify-between gap-3">
                      {logoRival && (
                        <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-full border border-white/25 bg-black/50">
                          <Image
                            src={logoRival}
                            alt={rivalNombre}
                            width={112}
                            height={112}
                            className="h-full w-full object-contain p-1"
                          />
                        </div>
                      )}
                      <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-center">
                        <p
                          className={`w-full text-[11px] font-black uppercase tracking-[0.2em] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] sm:text-xs ${
                            ganamos ? "text-emerald-200" : empate ? "text-zinc-400" : "text-red-200"
                          }`}
                          aria-hidden
                        >
                          {ganamos ? "victoria" : empate ? "empate" : "derrota"}
                        </p>
                        <p className="w-full truncate text-xs font-semibold text-zinc-100">
                          {rivalNombre}
                        </p>
                        <p className="w-full text-2xl font-bold tabular-nums text-zinc-50">
                          {marcador}
                        </p>
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </section>

        {/* Tablas de posiciones: mismo ancho que las 4 cajas del resumen */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-50">
            Tablas de posiciones{" "}
            <span className="font-normal italic text-zinc-400">
              (Campeonato Clausura 2025 terminado)
            </span>
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {CATEGORIES.map((categoria) => {
              const esSSFutbolito = categoria === "Super Senior Futbolito";
              const esSSMartes = categoria === "Super Senior Fútbol";
              const esSenior = categoria === "Senior Fútbol";
              const esJunior = categoria === "Junior Fútbol";
              const usaClausura =
                esSSFutbolito && tablaClausura2015.length > 0;
              const tabla = usaClausura
                ? []
                : (posicionesPorCategoria[categoria] ?? []).slice(0, 12);
              const filasClausura = usaClausura ? tablaClausura2015 : [];

              return (
                <article
                  key={categoria}
                  className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/70"
                >
                    <header className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-3 py-2.5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                        {CATEGORY_LABELS[categoria as CategoryName] ?? categoria}
                      </p>
                    </header>

                    <div className="max-h-96 overflow-auto">
                      {usaClausura ? (
                        <table className="min-w-full text-left text-xs text-zinc-300">
                          <thead className="sticky top-0 bg-zinc-950">
                            <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wide text-zinc-500">
                              <th className="px-2 py-2 font-medium">#</th>
                              <th className="px-2 py-2 font-medium">Equipo</th>
                              <th className="w-0 px-1 py-2" aria-label="Estado" />
                            </tr>
                          </thead>
                          <tbody>
                            {filasClausura.map((row) => {
                              const esMaestros = isMaestrosTeam(row.equipo);
                              const nombreEquipo = esMaestros ? "Maestros" : `Equipo ${row.posicion}`;
                              const campeon = row.posicion === 1;
                              return (
                                <tr
                                  key={row.id}
                                  className={`border-b border-zinc-900/60 text-[11px] last:border-0 ${
                                    esMaestros
                                      ? "bg-emerald-800 text-white font-bold"
                                      : "bg-zinc-900/40 text-zinc-500 opacity-80 hover:bg-zinc-900/60"
                                  }`}
                                >
                                  <td className="px-2 py-1.5 w-8">{row.posicion}</td>
                                  <td className="px-2 py-1.5 font-medium">{nombreEquipo}</td>
                                  <td className="px-1 py-1.5 text-right">
                                    {campeon ? (
                                      <span className="inline-flex items-center gap-0.5 rounded bg-amber-900/60 px-1.5 py-0.5 text-[10px] font-medium text-amber-300" title="Campeón">
                                        Campeón
                                      </span>
                                    ) : null}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : esSSFutbolito && tablaClausura2015.length === 0 ? (
                        <table className="min-w-full text-left text-xs text-zinc-300">
                          <thead className="sticky top-0 bg-zinc-950">
                            <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wide text-zinc-500">
                              <th className="px-2 py-2 font-medium">#</th>
                              <th className="px-2 py-2 font-medium">Equipo</th>
                              <th className="w-0 px-1 py-2" aria-label="Estado" />
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((pos) => {
                              const esMaestros = pos === 7;
                              const nombreEquipo = esMaestros ? "Maestros" : `Equipo ${pos}`;
                              const campeon = pos === 1;
                              return (
                                <tr
                                  key={pos}
                                  className={`border-b border-zinc-900/60 text-[11px] last:border-0 ${
                                    esMaestros
                                      ? "bg-emerald-800 text-white font-bold"
                                      : "bg-zinc-900/40 text-zinc-500 opacity-80 hover:bg-zinc-900/60"
                                  }`}
                                >
                                  <td className="px-2 py-1.5 w-8">{pos}</td>
                                  <td className="px-2 py-1.5 font-medium">{nombreEquipo}</td>
                                  <td className="px-1 py-1.5 text-right">
                                    {campeon ? (
                                      <span className="inline-flex items-center gap-0.5 rounded bg-amber-900/60 px-1.5 py-0.5 text-[10px] font-medium text-amber-300" title="Campeón">
                                        Campeón
                                      </span>
                                    ) : null}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : esSSMartes && tabla.length === 0 ? (
                        <table className="min-w-full text-left text-xs text-zinc-300">
                          <thead className="sticky top-0 bg-zinc-950">
                            <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wide text-zinc-500">
                              <th className="px-2 py-2 font-medium">#</th>
                              <th className="px-2 py-2 font-medium">Equipo</th>
                              <th className="w-0 px-1 py-2" aria-label="Estado" />
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from({ length: 8 }, (_, i) => i + 1).map((pos) => {
                              const esMaestros = pos === 2;
                              const nombreEquipo = esMaestros ? "Maestros" : `Equipo ${pos}`;
                              const campeon = pos === 1;
                              return (
                                <tr
                                  key={pos}
                                  className={`border-b border-zinc-900/60 text-[11px] last:border-0 ${
                                    esMaestros
                                      ? "bg-emerald-800 text-white font-bold"
                                      : "bg-zinc-900/40 text-zinc-500 opacity-80 hover:bg-zinc-900/60"
                                  }`}
                                >
                                  <td className="px-2 py-1.5 w-8">{pos}</td>
                                  <td className="px-2 py-1.5 font-medium">{nombreEquipo}</td>
                                  <td className="px-1 py-1.5 text-right">
                                    {campeon ? (
                                      <span className="inline-flex items-center gap-0.5 rounded bg-amber-900/60 px-1.5 py-0.5 text-[10px] font-medium text-amber-300" title="Campeón">
                                        Campeón
                                      </span>
                                    ) : null}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : esSenior && tabla.length === 0 ? (
                        <table className="min-w-full text-left text-xs text-zinc-300">
                          <thead className="sticky top-0 bg-zinc-950">
                            <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wide text-zinc-500">
                              <th className="px-2 py-2 font-medium">#</th>
                              <th className="px-2 py-2 font-medium">Equipo</th>
                              <th className="w-0 px-1 py-2" aria-label="Estado" />
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((pos) => {
                              const esMaestros = pos === 10;
                              const nombreEquipo = esMaestros ? "Maestros" : `Equipo ${pos}`;
                              const promocion = pos === 10;
                              const descendido = pos >= 11;
                              const campeon = pos === 1;
                              return (
                                <tr
                                  key={pos}
                                  className={`border-b border-zinc-900/60 text-[11px] last:border-0 ${
                                    esMaestros
                                      ? "bg-emerald-800 text-white font-bold"
                                      : "bg-zinc-900/40 text-zinc-500 opacity-80 hover:bg-zinc-900/60"
                                  }`}
                                >
                                  <td className="px-2 py-1.5 w-8">{pos}</td>
                                  <td className="px-2 py-1.5 font-medium">{nombreEquipo}</td>
                                  <td className="px-1 py-1.5 text-right">
                                    {campeon ? (
                                      <span className="inline-flex items-center gap-0.5 rounded bg-amber-900/60 px-1.5 py-0.5 text-[10px] font-medium text-amber-300" title="Campeón">
                                        Campeón
                                      </span>
                                    ) : promocion ? (
                                      <span className="inline-flex items-center gap-0.5 rounded bg-amber-900/60 px-1.5 py-0.5 text-[10px] font-medium text-amber-200" title="Juega promoción">
                                        Promoción
                                      </span>
                                    ) : descendido ? (
                                      <span className="inline-flex items-center gap-0.5 rounded bg-rose-900/60 px-1.5 py-0.5 text-[10px] font-medium text-rose-300" title="Descendido a 2ª división">
                                        <span aria-hidden>↓</span> Descendido
                                      </span>
                                    ) : null}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : esJunior && tabla.length === 0 ? (
                        <table className="min-w-full text-left text-xs text-zinc-300">
                          <thead className="sticky top-0 bg-zinc-950">
                            <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wide text-zinc-500">
                              <th className="px-2 py-2 font-medium">#</th>
                              <th className="px-2 py-2 font-medium">Equipo</th>
                              <th className="w-0 px-1 py-2" aria-label="Estado" />
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((pos) => {
                              const esMaestros = pos === 4;
                              const nombreEquipo = esMaestros ? "Maestros" : `Equipo ${pos}`;
                              const descendido = pos >= 10;
                              const campeon = pos === 1;
                              return (
                                <tr
                                  key={pos}
                                  className={`border-b border-zinc-900/60 text-[11px] last:border-0 ${
                                    esMaestros
                                      ? "bg-emerald-800 text-white font-bold"
                                      : "bg-zinc-900/40 text-zinc-500 opacity-80 hover:bg-zinc-900/60"
                                  }`}
                                >
                                  <td className="px-2 py-1.5 w-8">{pos}</td>
                                  <td className="px-2 py-1.5 font-medium">{nombreEquipo}</td>
                                  <td className="px-1 py-1.5 text-right">
                                    {campeon ? (
                                      <span className="inline-flex items-center gap-0.5 rounded bg-amber-900/60 px-1.5 py-0.5 text-[10px] font-medium text-amber-300" title="Campeón">
                                        Campeón
                                      </span>
                                    ) : descendido ? (
                                      <span className="inline-flex items-center gap-0.5 rounded bg-rose-900/60 px-1.5 py-0.5 text-[10px] font-medium text-rose-300" title="Descendido a 2ª división">
                                        <span aria-hidden>↓</span> Descendido
                                      </span>
                                    ) : null}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <table className="min-w-full text-left text-xs text-zinc-300">
                          <thead className="sticky top-0 bg-zinc-950">
                            <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wide text-zinc-500">
                              <th className="px-2 py-2 font-medium">#</th>
                              <th className="px-2 py-2 font-medium">Equipo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tabla.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={2}
                                  className="px-3 py-3 text-center text-[11px] text-zinc-500"
                                >
                                  Aún no hay posiciones registradas.
                                </td>
                              </tr>
                            ) : (
                              tabla.map((row, index) => {
                                const pos = index + 1;
                                const esMaestros = isMaestrosTeam(row.equipo);
                                const nombreEquipo = esMaestros ? "Maestros" : `Equipo ${pos}`;
                                return (
                                  <tr
                                    key={row.id}
                                    className={`border-b border-zinc-900/60 text-[11px] last:border-0 ${
                                      esMaestros
                                        ? "bg-emerald-800 text-white font-bold"
                                        : "bg-zinc-900/40 text-zinc-500 opacity-80 hover:bg-zinc-900/60"
                                    }`}
                                  >
                                    <td className="px-2 py-1.5 w-8">{pos}</td>
                                    <td className="px-2 py-1.5 font-medium">{nombreEquipo}</td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </article>
                );
              })}
          </div>
        </section>

        {/* Presidente + Recuerdo Maestro + Sticker del mes + Entrevista + Cumpleaños — cajas uniformes */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {/* Izquierda: Mensaje del Presidente */}
          <MensajePresidenteCard />

          {/* Centro: El recuerdo Maestro — interactivo con pop-up */}
          <RecuerdoMaestroCard />

          {/* Derecha: El sticker del mes — interactivo con pop-up */}
          <StickerDelMesCard />

          {/* Entrevista Maestra — misma lógica de pop-up */}
          <EntrevistaMaestraCard />

          {/* Nueva caja: El cumpleaños Maestro */}
          <article className="flex h-full min-h-[420px] flex-col rounded-2xl border border-emerald-700/60 bg-gradient-to-b from-emerald-950/90 via-emerald-950/70 to-zinc-950 p-4 shadow-md shadow-emerald-900/50">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                El cumpleaños Maestro
              </p>
              {proximoCumple && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-200">
                  {proximoCumpleFechaEtiqueta}
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-1 flex-col items-center gap-3">
              <div className="relative h-44 w-full max-w-[260px] overflow-hidden rounded-xl bg-black/60">
                <Image
                  src="/toto.jpg"
                  alt="Cumpleañero Maestro"
                  fill
                  sizes="260px"
                  className="object-cover"
                />
              </div>

              {proximoCumple ? (
                <div className="w-full space-y-2 text-center">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                      Próximo cumpleañero
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-zinc-50">
                      {proximoCumple.jugador.nombre}
                      {proximoCumple.jugador.apodo ? (
                        <>
                          {" "}
                          <span className="font-bold italic text-amber-300">
                            {proximoCumple.jugador.apodo}
                          </span>
                        </>
                      ) : null}{" "}
                      <span className="text-zinc-50">
                        {proximoCumple.jugador.apellido}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-end justify-between gap-4 text-left">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                        Fecha
                      </p>
                      <p className="text-sm font-medium text-zinc-100">
                        {proximoCumpleFechaEtiqueta}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] uppercase tracking-wide text-emerald-300">
                        Cuenta regresiva
                      </p>
                      <p className="text-2xl font-extrabold tracking-tight text-emerald-200 sm:text-3xl">
                        {proximoCumple.diasRestantes === 0
                          ? "¡Hoy!"
                          : `Quedan ${proximoCumple.diasRestantes} ${
                              proximoCumple.diasRestantes === 1 ? "día" : "días"
                            }`}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-zinc-400 text-center">
                  Aún no hay fechas de nacimiento registradas para calcular el
                  próximo cumpleaños.
                </p>
              )}
            </div>
          </article>
        </section>

        {/* Ranking de goleadores y asistencias por equipo (placeholder) */}
        <section className="space-y-4">
          <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-zinc-50">
                Ranking de goleadores{" "}
                <span className="italic text-zinc-400">
                  (data desde 2025 en adelante)
                </span>
              </h2>
              <span className="text-[11px] text-zinc-400">
                Goles y asistencias por equipo
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {CATEGORIES.map((categoria) => (
                <article
                  key={categoria}
                  className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80"
                >
                  <header className="border-b border-zinc-800/80 bg-zinc-950/90 px-3 py-2.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                      {CATEGORY_LABELS[categoria as CategoryName] ?? categoria}
                    </p>
                  </header>

                  <div className="max-h-80 overflow-auto px-1.5 py-2">
                    <table className="min-w-full text-left text-[11px] text-zinc-300">
                      <thead className="sticky top-0 bg-zinc-950/95">
                        <tr className="border-b border-zinc-800 text-[10px] uppercase tracking-wide text-zinc-500">
                          <th className="px-2 py-1.5 font-medium">#</th>
                          <th className="px-2 py-1.5 font-medium">Jugador</th>
                          <th className="px-2 py-1.5 font-medium text-right">
                            <span
                              aria-hidden
                              className="inline-flex h-5 w-5 items-center justify-center text-xl leading-none"
                            >
                              ⚽
                            </span>
                            <span className="sr-only">Goles</span>
                          </th>
                          <th className="px-2 py-1.5 font-medium text-right">
                            <span aria-hidden className="inline-flex justify-end">
                              <Image
                                src="/zapato.png"
                                alt=""
                                width={20}
                                height={20}
                                className="h-5 w-5 object-contain invert opacity-90"
                              />
                            </span>
                            <span className="sr-only">Asistencias</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(goleadoresPorCategoria[categoria] ?? []).length >
                        0
                          ? (goleadoresPorCategoria[categoria] ?? [])
                              .slice(0, 7)
                              .map((row) => (
                                <tr
                                  key={row.id}
                                  className="border-b border-zinc-900/70 text-[11px] last:border-0"
                                >
                                  <td className="px-2 py-1.5 w-6 text-zinc-500">
                                    {row.posicion_ranking}
                                  </td>
                                  <td className="px-2 py-1.5">
                                    <span className="text-zinc-200">
                                      {row.nombre_jugador}
                                    </span>
                                  </td>
                                  <td className="px-2 py-1.5 text-right text-zinc-300">
                                    {row.goles}
                                  </td>
                                  <td className="px-2 py-1.5 text-right text-zinc-300">
                                    {row.asistencias}
                                  </td>
                                </tr>
                              ))
                          : Array.from({ length: 7 }, (_, i) => i + 1).map(
                              (posicion) => (
                                <tr
                                  key={posicion}
                                  className="border-b border-zinc-900/70 text-[11px] last:border-0"
                                >
                                  <td className="px-2 py-1.5 w-6 text-zinc-500">
                                    {posicion}
                                  </td>
                                  <td className="px-2 py-1.5">
                                    <span className="text-zinc-200">
                                      Jugador
                                    </span>
                                  </td>
                                  <td className="px-2 py-1.5 text-right text-zinc-300">
                                    0
                                  </td>
                                  <td className="px-2 py-1.5 text-right text-zinc-300">
                                    0
                                  </td>
                                </tr>
                              ),
                            )}
                      </tbody>
                    </table>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>

        {/* Títulos del club */}
        <section className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-lg">
          {/* Encabezado principal */}
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-full bg-black/60 ring-2 ring-emerald-500/60">
                <Image
                  src="/logo_maestros.png"
                  alt="Escudo Maestros FC"
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-400">
                  Títulos
                </p>
                <div className="mt-1 flex items-center gap-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tracking-tight text-zinc-50">
                      {totalTitulos}
                    </span>
                    <span className="text-xs text-zinc-400 uppercase">
                      Títulos totales
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {titulosOrdenadosParaCopas.map((t) => (
                      <span
                        key={t.id}
                        className="relative inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-zinc-900"
                      >
                        <Image
                          src="/copa.png"
                          alt=""
                          fill
                          sizes="28px"
                          className={`object-contain ${
                            esTituloAnual(t)
                              ? "[filter:invert(1)_sepia(0.7)_saturate(6)_hue-rotate(5deg)]"
                              : "[filter:invert(1)_sepia(0.2)_saturate(3)_hue-rotate(5deg)_opacity(0.55)]"
                          }`}
                        />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {/* Izquierda: ranking por equipos */}
            <div className="space-y-3 rounded-2xl bg-zinc-950/60 px-3 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Ranking por equipos (estrellas)
              </p>
              <div className="space-y-2 text-sm text-zinc-200">
                {resumenTitulos.map(({ equipo, cantidad, lista }) => (
                  <div
                    key={equipo}
                    className="flex items-center justify-between rounded-lg bg-zinc-900/80 px-3 py-2"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                      {equipo}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-zinc-400">
                        {cantidad} {cantidad === 1 ? "título" : "títulos"}
                      </span>
                      <span className="flex items-center gap-0.5">
                        {lista.map((t) =>
                          esTituloAnual(t) ? (
                            <span
                              key={t.id}
                              className="inline-block text-amber-300 scale-110"
                              title="Campeón anual"
                            >
                              ★
                            </span>
                          ) : (
                            <span
                              key={t.id}
                              className="text-yellow-500/55"
                            >
                              ⭐
                            </span>
                          )
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Derecha: detalle de títulos con copas */}
            <div className="space-y-1 rounded-2xl bg-zinc-950/60 px-3 py-2 text-[11px] text-zinc-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Detalle de títulos
              </p>

              {TITULOS_ORDER.map((equipo) =>
                (titulosPorEquipo[equipo] ?? []).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-2 rounded-xl bg-zinc-900/70 px-2.5 py-1"
                  >
                    <div className="relative flex h-4 w-4 items-center justify-center overflow-hidden">
                      <Image
                        src="/copa.png"
                        alt="Copa"
                        fill
                        sizes="36px"
                        className="object-contain invert"
                      />
                    </div>
                    <div className="flex w-full items-center justify-between text-[10px]">
                      <span className="font-semibold uppercase tracking-wide text-emerald-300">
                        {equipo}
                      </span>
                      <span className="text-zinc-200">
                        {t.detalle} {t.anio}{" "}
                        {esTituloAnual(t) ? (
                          <span
                            className="ml-1 inline-block text-amber-300 scale-110"
                            title="Campeón anual"
                          >
                            ★
                          </span>
                        ) : (
                          <span className="ml-1 text-yellow-500/55">⭐</span>
                        )}
                      </span>
                    </div>
                  </div>
                )),
              )}
              {/*
              <div className="flex items-center gap-3 rounded-xl bg-zinc-900/70 px-3 py-1.5">
                <div className="relative flex h-5 w-5 items-center justify-center overflow-hidden">
                  <Image
                    src="/copa.png"
                    alt="Copa"
                    fill
                    sizes="36px"
                    className="object-contain invert"
                  />
                </div>
                <div className="flex w-full items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wide text-emerald-300">
                    Maestros Junior
                  </span>
                  <span className="text-zinc-200">
                    Apertura 2011 <span className="ml-1">⭐️</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-zinc-900/70 px-3 py-1.5">
                <div className="relative flex h-5 w-5 items-center justify-center overflow-hidden">
                  <Image
                    src="/copa.png"
                    alt="Copa"
                    fill
                    sizes="36px"
                    className="object-contain invert"
                  />
                </div>
                <div className="flex w-full items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wide text-emerald-300">
                    Maestros Junior
                  </span>
                  <span className="text-zinc-200">
                    Clausura 2012 <span className="ml-1">⭐️</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-zinc-900/70 px-3 py-1.5">
                <div className="relative flex h-5 w-5 items-center justify-center overflow-hidden">
                  <Image
                    src="/copa.png"
                    alt="Copa"
                    fill
                    sizes="36px"
                    className="object-contain invert"
                  />
                </div>
                <div className="flex w-full items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wide text-emerald-300">
                    Maestros Junior
                  </span>
                  <span className="text-zinc-200">
                    Apertura 2013 <span className="ml-1">⭐️</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-zinc-900/70 px-3 py-1.5">
                <div className="relative flex h-5 w-5 items-center justify-center overflow-hidden">
                  <Image
                    src="/copa.png"
                    alt="Copa"
                    fill
                    sizes="36px"
                    className="object-contain invert"
                  />
                </div>
                <div className="flex w-full items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wide text-emerald-300">
                    Maestros Junior
                  </span>
                  <span className="text-zinc-200">
                    Clausura 2014 <span className="ml-1">⭐️</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-zinc-900/70 px-3 py-1.5">
                <div className="relative flex h-5 w-5 items-center justify-center overflow-hidden">
                  <Image
                    src="/copa.png"
                    alt="Copa"
                    fill
                    sizes="36px"
                    className="object-contain invert"
                  />
                </div>
                <div className="flex w-full items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wide text-emerald-300">
                    Maestros Junior
                  </span>
                  <span className="text-zinc-200">
                    Anual 2019 <span className="ml-1">⭐️</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-zinc-900/70 px-3 py-1.5">
                <div className="relative flex h-5 w-5 items-center justify-center overflow-hidden">
                  <Image
                    src="/copa.png"
                    alt="Copa"
                    fill
                    sizes="36px"
                    className="object-contain invert"
                  />
                </div>
                <div className="flex w-full items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wide text-emerald-300">
                    Maestros Junior
                  </span>
                  <span className="text-zinc-200">
                    Anual 2022 <span className="ml-1">⭐️</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-zinc-900/70 px-3 py-1.5">
                <div className="relative flex h-5 w-5 items-center justify-center overflow-hidden">
                  <Image
                    src="/copa.png"
                    alt="Copa"
                    fill
                    sizes="36px"
                    className="object-contain invert"
                  />
                </div>
                <div className="flex w-full items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wide text-emerald-300">
                    Maestros SS Futbolito
                  </span>
                  <span className="text-zinc-200">
                    Clausura 2024 <span className="ml-1">⭐️</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-zinc-900/70 px-3 py-1.5">
                <div className="relative flex h-5 w-5 items-center justify-center overflow-hidden">
                  <Image
                    src="/copa.png"
                    alt="Copa"
                    fill
                    sizes="36px"
                    className="object-contain invert"
                  />
                </div>
                <div className="flex w-full items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wide text-emerald-300">
                    Maestros SS Futbolito
                  </span>
                  <span className="text-zinc-200">
                    Apertura 2025 <span className="ml-1">⭐️</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-zinc-900/70 px-3 py-1.5">
                <div className="relative flex h-5 w-5 items-center justify-center overflow-hidden">
                  <Image
                    src="/copa.png"
                    alt="Copa"
                    fill
                    sizes="36px"
                    className="object-contain invert"
                  />
                </div>
                <div className="flex w-full items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wide text-emerald-300">
                    Maestros SS Martes
                  </span>
                  <span className="text-zinc-200">
                    Apertura 2024 <span className="ml-1">⭐️</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-zinc-900/70 px-3 py-1.5">
                <div className="relative flex h-5 w-5 items-center justify-center overflow-hidden">
                  <Image
                    src="/copa.png"
                    alt="Copa"
                    fill
                    sizes="36px"
                    className="object-contain invert"
                  />
                </div>
                <div className="flex w-full items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wide text-emerald-300">
                    Maestros SS Martes
                  </span>
                  <span className="text-zinc-200">
                    Clausura 2024 <span className="ml-1">⭐️</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-zinc-900/70 px-3 py-1.5">
                <div className="relative flex h-5 w-5 items-center justify-center overflow-hidden">
                  <Image
                    src="/copa.png"
                    alt="Copa"
                    fill
                    sizes="36px"
                    className="object-contain invert"
                  />
                </div>
                <div className="flex w-full items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wide text-emerald-300">
                    Maestros Senior
                  </span>
                  <span className="text-zinc-200">
                    Apertura 2013 <span className="ml-1">⭐️</span>
                  </span>
                </div>
              </div>
              */}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
