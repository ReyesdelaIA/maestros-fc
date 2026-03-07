import Image from "next/image";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { getPlayerPhotoSrc } from "../lib/playerPhotos";
import MensajePresidenteCard from "./components/MensajePresidenteCard";
import RecuerdoMaestroCard from "./components/RecuerdoMaestroCard";
import StickerDelMesCard from "./components/StickerDelMesCard";
import EntrevistaMaestraCard from "./components/EntrevistaMaestraCard";
import FixtureCard from "./components/FixtureCard";
import CumpleCard from "./components/CumpleCard";
import UserGreeting from "./components/UserGreeting";
import BottomNav from "./components/BottomNav";
import TitulosDetalleExpandable from "./components/TitulosDetalleExpandable";
import { getEquipoTitulosLabel } from "../lib/categoryLabels";

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
  "Junior Fútbol": "Junior",
  "Senior Fútbol": "Senior",
  "Super Senior Futbolito": "SS Futbolito",
  "Super Senior Fútbol": "SS Fútbol",
};

// Etiqueta que va arriba de cada caja del resumen
const RESUMEN_ETIQUETA_ARRIBA: Record<CategoryName, string> = {
  "Junior Fútbol": "Junior",
  "Senior Fútbol": "Senior",
  "Super Senior Futbolito": "SS Futbolito",
  "Super Senior Fútbol": "SS Fútbol",
};

const CATEGORIA_TO_PLANTEL_SLUG: Record<CategoryName, string> = {
  "Junior Fútbol": "junior",
  "Senior Fútbol": "senior",
  "Super Senior Futbolito": "ss-futbolito",
  "Super Senior Fútbol": "ss-martes",
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
  pg?: number | null;
  pe?: number | null;
  pp?: number | null;
  pts?: number | null;
  gf?: number | null;
  gc?: number | null;
  dg?: number | null;
  [key: string]: unknown;
};

type ProximoPartido = {
  id: string | number;
  categoria: CategoryName | string | null;
  rival: string | null;
  fecha_partido: string | null;
  hora?: string | null;
  cancha?: string | null;
  estado?: string | null;
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

type TabSlug =
  | "general"
  | "junior"
  | "senior"
  | "super-senior-futbolito"
  | "super-senior-futbol";

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
    (async () => {
      const hoy = new Date().toISOString().slice(0, 10);
      const results: ProximoPartido[] = [];
      for (const cat of CATEGORIES) {
        const { data } = await supabase
          .from("fixture_partidos")
          .select("id, categoria, rival, fecha_partido, hora, cancha, estado")
          .eq("categoria", cat)
          .eq("estado", "programado")
          .gte("fecha_partido", hoy)
          .order("fecha_partido", { ascending: true })
          .limit(5);
        const lista = (data ?? []) as ProximoPartido[];
        const isWeekend = (f: string) => {
          const d = new Date(`${f}T12:00:00`);
          const day = d.getDay();
          return day === 0 || day === 6;
        };
        const next = lista.find((p) => isWeekend(p.fecha_partido ?? "")) ?? lista[0] ?? null;
        if (next) results.push(next);
      }
      return results;
    })(),
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
  const proximosPartidos = (proximosPartidosRes ?? []) as ProximoPartido[];
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

function formatEquipoLabel(name: string | null | undefined) {
  if (!name) return "";
  const raw = name.trim();
  if (raw === "Club Social y Deportivo Argentino SS") return "CSYDA";

  return raw
    .replace(/\bFutbolito\b/gi, "")
    .replace(/\(SS\)/gi, "")
    .replace(/\bSSR\b/g, "")
    .replace(/\bSS\b/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
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

function dayNumber(fecha: string | null | undefined): string {
  if (!fecha) return "--";
  const d = new Date(`${fecha}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleDateString("es-CL", { day: "2-digit" });
}

function formatFechaCard(fecha: string | null | undefined): string {
  if (!fecha) return "";
  const raw = fecha.includes("T") ? fecha : `${fecha}T12:00:00`;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "";
  const str = d.toLocaleDateString("es-CL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const tabParamRaw = params.tab;
  const tabParam = Array.isArray(tabParamRaw) ? tabParamRaw[0] : tabParamRaw;
  const tab: TabSlug =
    tabParam === "junior" ||
    tabParam === "senior" ||
    tabParam === "super-senior-futbolito" ||
    tabParam === "super-senior-futbol"
      ? tabParam
      : "general";
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

  const titulosParaDetalle = TITULOS_ORDER.flatMap((equipo) =>
    (titulosPorEquipo[equipo] ?? []).map((t) => ({
      id: t.id,
      equipo: getEquipoTitulosLabel(equipo),
      detalle: t.detalle ?? "",
      anio: t.anio,
      esAnual: esTituloAnual(t),
    }))
  );

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
  for (const p of proximosPartidos) {
    if (p.categoria) proximoPorCategoria[p.categoria] = p;
  }

  const proximoCumple = calcularProximoCumple(jugadoresCumple);
  const proximoCumpleFoto = proximoCumple
    ? getPlayerPhotoSrc(proximoCumple.jugador)
    : null;
  const proximoCumpleFechaEtiqueta =
    proximoCumple?.fecha.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
    }) ?? "";

  const categoryByTab: Record<Exclude<TabSlug, "general">, CategoryName> = {
    junior: "Junior Fútbol",
    senior: "Senior Fútbol",
    "super-senior-futbolito": "Super Senior Futbolito",
    "super-senior-futbol": "Super Senior Fútbol",
  };
  const categoriasVisibles: CategoryName[] =
    tab === "general" ? [...CATEGORIES] : [categoryByTab[tab]];
  return (
    <div className="min-h-screen bg-black text-zinc-50">
      <main
        className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 pt-0 sm:px-6 lg:px-8 lg:pt-0"
        style={{
          paddingBottom: "calc(6.5rem + max(env(safe-area-inset-bottom), 0.5rem))",
        }}
      >
        {/* Header */}
        <header
          className="-mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
          style={{ paddingTop: "max(env(safe-area-inset-top), 0.75rem)" }}
        >
          <div className="flex items-center justify-between gap-2 rounded-2xl bg-white/95 px-3 py-2 shadow-[0_10px_24px_rgba(0,0,0,0.22)]">
            <UserGreeting />
          </div>
        </header>

        <div
          className={
            tab === "general"
              ? "space-y-6 rounded-2xl border border-emerald-700/60 bg-gradient-to-b from-emerald-950/20 via-zinc-950/70 to-zinc-950 p-4 shadow-[0_0_24px_rgba(16,185,129,0.12)] sm:p-5"
              : "space-y-6"
          }
        >
          {/* Temas varios: primero las tarjetas (Mensaje, Cumpleaños, Recuerdo, Entrevista, Sticker) */}
          {tab === "general" && (
            <section className="grid gap-4 md:grid-cols-2">
              <MensajePresidenteCard />
              <CumpleCard
                jugador={
                  proximoCumple
                    ? {
                        id: proximoCumple.jugador.id,
                        nombre: proximoCumple.jugador.nombre,
                        apodo: proximoCumple.jugador.apodo,
                        apellido: proximoCumple.jugador.apellido,
                      }
                    : null
                }
                foto={proximoCumpleFoto}
                fechaEtiqueta={proximoCumpleFechaEtiqueta}
                diasRestantes={proximoCumple?.diasRestantes ?? 0}
              />
              <RecuerdoMaestroCard />
              <EntrevistaMaestraCard />
              <StickerDelMesCard />
            </section>
          )}

          {/* Fixture */}
          {tab === "general" && (
            <section className="space-y-3">
              <FixtureCard />
            </section>
          )}

          {/* Stats última fecha */}
          <section className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-zinc-50">
              Stats última fecha 📊
            </h2>
            <span className="rounded-full border border-emerald-500/60 bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
              dic 2025
            </span>
          </div>

          <div className={`grid gap-3 sm:gap-4 ${tab === "general" ? "grid-cols-2" : "grid-cols-1"}`}>
            {categoriasVisibles.map((categoria) => {
              const vistaEquipo = tab !== "general";
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
              const etiquetaArriba = RESUMEN_ETIQUETA_ARRIBA[categoria];

              const proximo = vistaEquipo ? proximoPorCategoria[categoria] : null;
              const proximoRivalNombre = proximo?.rival ?? "Por definir";
              const proximoLogoRival = RIVAL_LOGO[proximoRivalNombre] ?? null;

              const ganamos = !!ultimo && (ultimo.goles_maestros ?? 0) > (ultimo.goles_rival ?? 0);
              const empate = !!ultimo && (ultimo.goles_maestros ?? 0) === (ultimo.goles_rival ?? 0);
              const marcador = ultimo
                ? `${ultimo.goles_maestros ?? "-"} - ${ultimo.goles_rival ?? "-"}`
                : "—";
              const rivalNombre = ultimo?.rival ?? "—";
              const logoRival = ultimo ? (RIVAL_LOGO[ultimo.rival ?? ""] ?? null) : null;

              const logoSize = vistaEquipo ? "h-12 w-12" : "h-10 w-10";
              const nameSize = vistaEquipo ? "text-[13px]" : "text-[11px]";
              const scoreSize = vistaEquipo ? "text-[28px]" : "text-xl";
              const bodyPad = vistaEquipo ? "py-5" : "py-3";

              const cajaUltimo = (
                <article
                  className={`flex flex-col overflow-hidden rounded-2xl border shadow-lg ${
                    !ultimo
                      ? "border-zinc-700/50"
                      : ganamos
                        ? "border-emerald-600/50"
                        : empate
                          ? "border-zinc-600/50"
                          : "border-red-700/50"
                  }`}
                >
                  <div
                    className={`px-3 py-1.5 text-center ${
                      !ultimo
                        ? "bg-zinc-800/60"
                        : ganamos
                          ? "bg-emerald-800/40"
                          : empate
                            ? "bg-zinc-700/40"
                            : "bg-red-900/40"
                    }`}
                  >
                    <p
                      className={`text-[10px] font-bold uppercase tracking-widest ${
                        !ultimo
                          ? "text-zinc-500"
                          : ganamos
                            ? "text-emerald-300"
                            : empate
                              ? "text-zinc-400"
                              : "text-red-300"
                      }`}
                    >
                      Último partido
                    </p>
                  </div>
                  <div
                    className={`flex flex-1 flex-col items-center justify-center gap-1.5 px-2 ${bodyPad} ${
                      !ultimo
                        ? "bg-zinc-900/60"
                        : ganamos
                          ? "bg-gradient-to-b from-emerald-950/50 to-zinc-950"
                          : empate
                            ? "bg-gradient-to-b from-zinc-800/30 to-zinc-950"
                            : "bg-gradient-to-b from-red-950/50 to-zinc-950"
                    }`}
                  >
                    {ultimo ? (
                      <>
                        <div className={`relative flex-shrink-0 overflow-hidden rounded-full border border-white/20 bg-black/40 ${logoSize}`}>
                          {logoRival ? (
                            <Image src={logoRival} alt={rivalNombre} width={48} height={48} className="h-full w-full object-contain p-0.5" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-base">⚽</span>
                          )}
                        </div>
                        <p className={`text-center font-semibold text-zinc-100 ${nameSize}`}>
                          {rivalNombre}
                        </p>
                        <p className={`font-extrabold tabular-nums leading-none text-zinc-50 ${scoreSize}`}>
                          {marcador}
                        </p>
                        <span
                          className={`mt-0.5 rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                            ganamos
                              ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                              : empate
                                ? "border-zinc-500/30 bg-zinc-500/15 text-zinc-400"
                                : "border-red-500/30 bg-red-500/15 text-red-300"
                          }`}
                        >
                          {ganamos ? "Victoria" : empate ? "Empate" : "Derrota"}
                        </span>
                        {ultimo.fecha_partido && (
                          <p className="mt-0.5 text-[10px] text-zinc-500">
                            {formatFechaCard(ultimo.fecha_partido)}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="py-4 text-center text-[11px] text-zinc-500">
                        Sin partidos registrados
                      </p>
                    )}
                  </div>
                </article>
              );

              const cajaProximo = vistaEquipo ? (
                <article className="flex flex-col overflow-hidden rounded-2xl border border-sky-700/40 shadow-lg">
                  <div className="bg-sky-800/30 px-3 py-1.5 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-sky-300">
                      Próximo partido
                    </p>
                  </div>
                  <div className={`flex flex-1 flex-col items-center justify-center gap-1.5 bg-gradient-to-b from-sky-950/30 to-zinc-950 px-2 ${bodyPad}`}>
                    {proximo ? (
                      <>
                        <div className={`relative flex-shrink-0 overflow-hidden rounded-full border border-white/20 bg-black/40 ${logoSize}`}>
                          {proximoLogoRival ? (
                            <Image src={proximoLogoRival} alt={proximoRivalNombre} width={48} height={48} className="h-full w-full object-contain p-0.5" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-base">⚽</span>
                          )}
                        </div>
                        <p className={`text-center font-semibold text-zinc-100 ${nameSize}`}>
                          vs {proximoRivalNombre}
                        </p>
                        <p className={`font-extrabold tabular-nums leading-none text-zinc-500 ${scoreSize}`}>
                          0 - 0
                        </p>
                        <p className="mt-0.5 text-center text-[10px] font-medium text-sky-300">
                          {formatFechaCard(proximo.fecha_partido)}
                          {proximo.hora ? ` · ${proximo.hora}` : ""}
                        </p>
                        {proximo.cancha && (
                          <p className="text-center text-[10px] text-zinc-500">
                            📍 {proximo.cancha}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="py-4 text-center text-[11px] text-zinc-500">
                        Sin partido programado
                      </p>
                    )}
                  </div>
                </article>
              ) : null;

              return (
                <div key={categoria} className="flex h-full flex-col gap-1.5">
                  <span className="inline-flex w-fit rounded-md border border-zinc-600/40 bg-zinc-800/40 px-2 py-0.5 text-[9px] font-medium uppercase tracking-widest text-zinc-500">
                    {etiquetaArriba}
                  </span>

                  <div className={vistaEquipo ? "grid grid-cols-2 gap-2.5" : ""}>
                    {cajaUltimo}
                    {cajaProximo}
                  </div>

                  {vistaEquipo && (
                    <Link
                      href="/asistencia"
                      className="w-full rounded-xl border border-cyan-600/70 bg-cyan-600/25 py-2.5 text-center text-[12px] font-semibold text-cyan-200 transition hover:bg-cyan-600/40"
                    >
                      Confirmar asistencia
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
          </section>

          {/* Tablas de posiciones: 2x2 para menos scroll */}
          <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-50">
            Tablas de posiciones{" "}
            <span className="font-normal italic text-zinc-400">
              (Campeonato Clausura 2025 terminado)
            </span>
          </h2>
          <div className={`grid gap-3 sm:gap-4 ${tab === "general" ? "grid-cols-2" : "grid-cols-1"}`}>
            {categoriasVisibles.map((categoria) => {
              const esSSFutbolito = categoria === "Super Senior Futbolito";
              const esSSMartes = categoria === "Super Senior Fútbol";
              const esSenior = categoria === "Senior Fútbol";
              const esJunior = categoria === "Junior Fútbol";
              const usaClausura = false;
              const tabla = (posicionesPorCategoria[categoria] ?? []).slice(0, 12);
              const filasClausura = tablaClausura2015;
              const vistaExpandida = tab !== "general";

              return (
                <article
                  key={categoria}
                  className={`overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/70 ${vistaExpandida ? "max-w-full" : ""}`}
                >
                    <header className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-3 py-2.5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                        {CATEGORY_LABELS[categoria as CategoryName] ?? categoria}
                      </p>
                    </header>

                    <div className={`overflow-auto ${vistaExpandida ? "max-h-[28rem]" : "max-h-72 sm:max-h-80"}`}>
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
                              const nombreEquipo = esMaestros
                                ? (CATEGORY_LABELS[categoria as CategoryName] ?? "")
                                : formatEquipoLabel(row.equipo) || `Equipo ${row.posicion}`;
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
                      ) : false ? (
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
                              const nombreEquipo = esMaestros ? (CATEGORY_LABELS[categoria as CategoryName] ?? "") : `Equipo ${pos}`;
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
                      ) : false ? (
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
                              const nombreEquipo = esMaestros ? (CATEGORY_LABELS[categoria as CategoryName] ?? "") : `Equipo ${pos}`;
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
                      ) : false ? (
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
                              const nombreEquipo = esMaestros ? (CATEGORY_LABELS[categoria as CategoryName] ?? "") : `Equipo ${pos}`;
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
                      ) : false ? (
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
                              const nombreEquipo = esMaestros ? (CATEGORY_LABELS[categoria as CategoryName] ?? "") : `Equipo ${pos}`;
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
                      ) : vistaExpandida ? (
                        <table className="min-w-full text-left text-xs text-zinc-300">
                          <thead className="sticky top-0 bg-zinc-950">
                            <tr className="border-b border-zinc-800 text-[11px] uppercase tracking-wide text-zinc-500">
                              <th className="px-2 py-2 font-medium">#</th>
                              <th className="min-w-[7rem] px-2 py-2 font-medium text-left">Equipo</th>
                              <th className="px-2 py-2 font-medium text-center">PJ</th>
                              <th className="px-2 py-2 font-medium text-center">PG</th>
                              <th className="px-2 py-2 font-medium text-center">PE</th>
                              <th className="px-2 py-2 font-medium text-center">PP</th>
                              <th className="px-2 py-2 font-medium text-center">Pts</th>
                              <th className="px-2 py-2 font-medium text-center">GF</th>
                              <th className="px-2 py-2 font-medium text-center">GC</th>
                              <th className="w-0 px-2 py-2" aria-label="Estado" />
                            </tr>
                          </thead>
                          <tbody>
                            {tabla.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={10}
                                  className="px-3 py-3 text-center text-[11px] text-zinc-500"
                                >
                                  Aún no hay posiciones registradas.
                                </td>
                              </tr>
                            ) : (
                              tabla.map((row, index) => {
                                const pos = index + 1;
                                const totalEquipos = tabla.length;
                                const esMaestros = isMaestrosTeam(row.equipo);
                                const nombreEquipo = esMaestros
                                  ? (CATEGORY_LABELS[categoria as CategoryName] ?? "")
                                  : formatEquipoLabel(row.equipo) || `Equipo ${pos}`;
                                const campeon = pos === 1;
                                const esSeniorTabla = categoria === "Senior Fútbol";
                                const esJuniorTabla = categoria === "Junior Fútbol";
                                const promocion = esSeniorTabla && pos === 10;
                                const descendido =
                                  (esSeniorTabla || esJuniorTabla) &&
                                  pos >= Math.max(1, totalEquipos - 1);
                                return (
                                  <tr
                                    key={row.id}
                                    className={`border-b border-zinc-900/60 text-[11px] last:border-0 ${
                                      esMaestros
                                        ? "bg-emerald-800 text-white font-bold"
                                        : "bg-zinc-900/40 text-zinc-500 opacity-80 hover:bg-zinc-900/60"
                                    }`}
                                  >
                                    <td className="w-8 shrink-0 px-2 py-1.5">{pos}</td>
                                    <td className="min-w-0 py-1.5 font-medium truncate" title={nombreEquipo}>{nombreEquipo}</td>
                                    <td className="px-2 py-1.5 text-center tabular-nums">{row.pj ?? "-"}</td>
                                    <td className="px-2 py-1.5 text-center tabular-nums">{row.pg ?? "-"}</td>
                                    <td className="px-2 py-1.5 text-center tabular-nums">{row.pe ?? "-"}</td>
                                    <td className="px-2 py-1.5 text-center tabular-nums">{row.pp ?? "-"}</td>
                                    <td className="px-2 py-1.5 text-center tabular-nums font-semibold">{row.pts ?? "-"}</td>
                                    <td className="px-2 py-1.5 text-center tabular-nums">{row.gf ?? "-"}</td>
                                    <td className="px-2 py-1.5 text-center tabular-nums">{row.gc ?? "-"}</td>
                                    <td className="w-8 shrink-0 px-2 py-1.5 text-right">
                                      {campeon ? (
                                        <span className="inline-flex items-center justify-center rounded bg-amber-900/60 px-1 py-0.5 text-[10px] font-medium text-amber-300" title="Campeón" aria-label="Campeón">🏆</span>
                                      ) : promocion ? (
                                        <span className="inline-flex items-center justify-center rounded bg-sky-900/50 px-1 py-0.5 text-[10px] font-medium text-sky-300" title="Juega promoción" aria-label="Promoción">↔</span>
                                      ) : descendido ? (
                                        <span className="inline-flex items-center justify-center rounded bg-rose-900/60 px-1 py-0.5 text-[10px] font-medium text-rose-300" title="Descendido" aria-label="Descendido">↓</span>
                                      ) : null}
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      ) : (
                        <table className="w-full table-fixed text-left text-xs text-zinc-300">
                          <tbody>
                            {tabla.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={3}
                                  className="px-3 py-3 text-center text-[11px] text-zinc-500"
                                >
                                  Aún no hay posiciones registradas.
                                </td>
                              </tr>
                            ) : (
                              tabla.map((row, index) => {
                                const pos = index + 1;
                                const totalEquipos = tabla.length;
                                const esMaestros = isMaestrosTeam(row.equipo);
                                const nombreEquipo = esMaestros
                                  ? (CATEGORY_LABELS[categoria as CategoryName] ?? "")
                                  : formatEquipoLabel(row.equipo) || `Equipo ${pos}`;
                                const campeon = pos === 1;
                                const esSeniorTabla = categoria === "Senior Fútbol";
                                const esJuniorTabla = categoria === "Junior Fútbol";
                                const promocion = esSeniorTabla && pos === 10;
                                const descendido =
                                  (esSeniorTabla || esJuniorTabla) &&
                                  pos >= Math.max(1, totalEquipos - 1);
                                return (
                                  <tr
                                    key={row.id}
                                    className={`border-b border-zinc-900/60 text-[11px] last:border-0 ${
                                      esMaestros
                                        ? "bg-emerald-800 text-white font-bold"
                                        : "bg-zinc-900/40 text-zinc-500 opacity-80 hover:bg-zinc-900/60"
                                    }`}
                                  >
                                    <td className="w-8 shrink-0 px-1 py-1.5">{pos}</td>
                                    <td className="min-w-0 py-1.5 pr-1 font-medium truncate" title={nombreEquipo}>{nombreEquipo}</td>
                                    <td className="w-8 shrink-0 px-0.5 py-1.5 text-right">
                                      {campeon ? (
                                        <span className="inline-flex items-center justify-center rounded bg-amber-900/60 px-1 py-0.5 text-[10px] font-medium text-amber-300" title="Campeón" aria-label="Campeón">🏆</span>
                                      ) : promocion ? (
                                        <span className="inline-flex items-center justify-center rounded bg-sky-900/50 px-1 py-0.5 text-[10px] font-medium text-sky-300" title="Juega promoción" aria-label="Promoción">↔</span>
                                      ) : descendido ? (
                                        <span className="inline-flex items-center justify-center rounded bg-rose-900/60 px-1 py-0.5 text-[10px] font-medium text-rose-300" title="Descendido" aria-label="Descendido">↓</span>
                                      ) : null}
                                    </td>
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
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {categoriasVisibles.map((categoria) => (
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
                              .slice(0, 4)
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
                          : Array.from({ length: 4 }, (_, i) => i + 1).map(
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

          {/* Títulos del club: solo en vista general */}
          {tab === "general" && (
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
                {resumenTitulos.map(({ equipo, cantidad, lista }) => {
                  const label = getEquipoTitulosLabel(equipo);
                  return (
                    <div
                      key={equipo}
                      className="flex items-center gap-3 rounded-lg bg-zinc-900/80 px-3 py-2"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-800 text-sm font-bold text-zinc-100">
                        {cantidad}
                      </span>
                      <span className="min-w-0 flex-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                        {label}
                      </span>
                      <span className="flex shrink-0 items-center gap-0.5">
                        {lista.map((t) =>
                          esTituloAnual(t) ? (
                            <span
                              key={t.id}
                              className="inline-block scale-110 text-amber-300"
                              title="Campeón anual"
                            >
                              ★
                            </span>
                          ) : (
                            <span key={t.id} className="text-yellow-500/55">
                              ⭐
                            </span>
                          )
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Derecha: detalle de títulos con copas */}
            <div className="space-y-1 rounded-2xl bg-zinc-950/60 px-3 py-2 text-[11px] text-zinc-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Detalle de títulos
              </p>
              <TitulosDetalleExpandable titulos={titulosParaDetalle} />
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
                    Junior
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
                    Junior
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
                    Junior
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
                    Junior
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
                    Junior
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
                    Junior
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
                    SS Futbolito
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
                    SS Futbolito
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
                    SS Fútbol
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
                    SS Fútbol
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
                    Senior
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
          )}

        </div>
      </main>
    </div>
  );
}
