"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type Categoria =
  | "Junior Fútbol"
  | "Senior Fútbol"
  | "Super Senior Futbolito"
  | "Super Senior Fútbol";

type Partido = {
  id: string;
  categoria: Categoria | string;
  rival: string;
  fecha_partido: string;
  hora: string | null;
  cancha: string | null;
  estado: string;
};

type ResumenCategoria = {
  categoria: Categoria;
  partido: Partido | null;
};

type Jugador = {
  id: string;
  nombre: string;
  apodo: string | null;
  apellido: string;
  numero: number | null;
  posicion: string | null;
  posicion_2: string | null;
};

type AsistenciaEstado = "disponible" | "en_duda" | "no_disponible";

const CATEGORIAS: Array<{ value: Categoria; label: string }> = [
  { value: "Junior Fútbol", label: "Maestros Junior" },
  { value: "Senior Fútbol", label: "Maestros Senior" },
  { value: "Super Senior Futbolito", label: "Maestros SS futbolito" },
  { value: "Super Senior Fútbol", label: "Maestros SS martes" },
];

function isWeekend(fechaISO: string): boolean {
  const d = new Date(`${fechaISO}T12:00:00`);
  const day = d.getDay();
  return day === 0 || day === 6;
}

function formatFecha(fechaISO: string): string {
  const d = new Date(`${fechaISO}T12:00:00`);
  if (Number.isNaN(d.getTime())) return fechaISO;
  return d.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    weekday: "short",
  });
}

function formatFechaLarga(fechaISO: string): string {
  const d = new Date(`${fechaISO}T12:00:00`);
  if (Number.isNaN(d.getTime())) return fechaISO;
  return d.toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function dayNumber(fechaISO: string): string {
  const d = new Date(`${fechaISO}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleDateString("es-CL", { day: "2-digit" });
}

function apellidoPaterno(apellidos: string): string {
  return (apellidos ?? "").trim().split(/\s+/)[0] ?? "";
}

function normalizarPosicion(pos: string | null | undefined): "POR" | "DEF" | "MED" | "DEL" | null {
  if (!pos) return null;
  const clean = pos.trim().toUpperCase();
  if (clean === "VOL" || clean === "NED") return "MED";
  if (clean === "POR" || clean === "DEF" || clean === "MED" || clean === "DEL") return clean;
  return null;
}

export default function FixtureCard() {
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [selectedPartido, setSelectedPartido] = useState<Partido | null>(null);
  const [resumenCategorias, setResumenCategorias] = useState<ResumenCategoria[]>([]);
  const [jugadoresCount, setJugadoresCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [abierto, setAbierto] = useState<boolean>(false);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [asistenciaByJugador, setAsistenciaByJugador] = useState<
    Record<string, AsistenciaEstado>
  >({});
  const [savingJugadorId, setSavingJugadorId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const disponibles = useMemo(
    () => Object.values(asistenciaByJugador).filter((v) => v === "disponible").length,
    [asistenciaByJugador],
  );
  const enDuda = useMemo(
    () => Object.values(asistenciaByJugador).filter((v) => v === "en_duda").length,
    [asistenciaByJugador],
  );
  const noDisponibles = useMemo(
    () => Object.values(asistenciaByJugador).filter((v) => v === "no_disponible").length,
    [asistenciaByJugador],
  );

  const sinResponder = useMemo(() => {
    const v = jugadoresCount - disponibles - enDuda - noDisponibles;
    return v < 0 ? 0 : v;
  }, [jugadoresCount, disponibles, enDuda, noDisponibles]);

  const jugadoresAgrupados = useMemo(() => {
    const base = [...jugadores].sort((a, b) =>
      `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, "es"),
    );
    const confirmados: Jugador[] = [];
    const porResponder: Jugador[] = [];
    const enDudaList: Jugador[] = [];
    const noIran: Jugador[] = [];

    for (const j of base) {
      const estado = asistenciaByJugador[j.id];
      if (estado === "disponible") confirmados.push(j);
      else if (estado === "en_duda") enDudaList.push(j);
      else if (estado === "no_disponible") noIran.push(j);
      else porResponder.push(j);
    }
    return { confirmados, enDudaList, porResponder, noIran };
  }, [jugadores, asistenciaByJugador]);

  const dashboardPosiciones = useMemo(() => {
    const base = { POR: { total: 0, voy: 0 }, DEF: { total: 0, voy: 0 }, MED: { total: 0, voy: 0 }, DEL: { total: 0, voy: 0 } };
    for (const j of jugadores) {
      const pos = normalizarPosicion(j.posicion) ?? normalizarPosicion(j.posicion_2);
      if (!pos) continue;
      base[pos].total += 1;
      if (asistenciaByJugador[j.id] === "disponible") base[pos].voy += 1;
    }
    return base;
  }, [jugadores, asistenciaByJugador]);

  const porcentajeVoy = useMemo(() => {
    if (jugadoresCount <= 0) return 0;
    return Math.round((disponibles / jugadoresCount) * 100);
  }, [disponibles, jugadoresCount]);

  const respondidos = useMemo(
    () => disponibles + enDuda + noDisponibles,
    [disponibles, enDuda, noDisponibles],
  );
  const porcentajeRespondidos = useMemo(() => {
    if (jugadoresCount <= 0) return 0;
    return Math.round((respondidos / jugadoresCount) * 100);
  }, [respondidos, jugadoresCount]);
  const porcentajeNoVoy = useMemo(() => {
    if (jugadoresCount <= 0) return 0;
    return Math.round((noDisponibles / jugadoresCount) * 100);
  }, [noDisponibles, jugadoresCount]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const hoy = new Date().toISOString().slice(0, 10);

      // Resumen rápido: próximo partido por cada categoría.
      const resumenPromises = CATEGORIAS.map(async (cat) => {
        const res = await supabase
          .from("fixture_partidos")
          .select("id, categoria, rival, fecha_partido, hora, cancha, estado")
          .eq("categoria", cat.value)
          .eq("estado", "programado")
          .gte("fecha_partido", hoy)
          .order("fecha_partido", { ascending: true })
          .limit(5);
        const lista = (res.data ?? []) as Partido[];
        const next = lista.find((p) => isWeekend(p.fecha_partido)) ?? lista[0] ?? null;
        return { categoria: cat.value, partido: next } as ResumenCategoria;
      });
      const resumen = await Promise.all(resumenPromises);
      setResumenCategorias(resumen);

      setLoading(false);
    };

    void load();
  }, []);

  const openModal = async (categoria: Categoria, partido: Partido) => {
    setSelectedCategoria(categoria);
    setSelectedPartido(partido);
    setAbierto(true);
    setSaveError(null);
    setAsistenciaByJugador({});
    setJugadores([]);
    setJugadoresCount(0);

    const [jugadoresRes, asistenciaRes] = await Promise.all([
      supabase
        .from("jugadores")
          .select("id, nombre, apodo, apellido, numero, posicion, posicion_2")
        .eq("categoria", categoria)
        .order("apellido", { ascending: true }),
      supabase
        .from("asistencias_partido")
        .select("jugador_id, estado_asistencia")
        .eq("partido_id", partido.id),
    ]);

    const players = (jugadoresRes.data ?? []) as Jugador[];
    const asist = (asistenciaRes.data ?? []) as Array<{
      jugador_id: string;
      estado_asistencia: AsistenciaEstado;
    }>;

    const map: Record<string, AsistenciaEstado> = {};
    for (const row of asist) map[row.jugador_id] = row.estado_asistencia;

    setJugadores(players);
    setJugadoresCount(players.length);
    setAsistenciaByJugador(map);
  };

  const upsertAsistencia = async (
    jugadorId: string,
    nuevoEstado: AsistenciaEstado,
  ) => {
    if (!selectedPartido) return;
    const prev = asistenciaByJugador[jugadorId];

    setSavingJugadorId(jugadorId);
    const nextMap = { ...asistenciaByJugador, [jugadorId]: nuevoEstado };
    setAsistenciaByJugador(nextMap);

    const { error } = await supabase.from("asistencias_partido").upsert(
      {
        partido_id: selectedPartido.id,
        jugador_id: jugadorId,
        estado_asistencia: nuevoEstado,
      },
      { onConflict: "partido_id,jugador_id" },
    );

    if (error) {
      setSaveError(
        "No se pudo guardar la asistencia. Si falla solo 'En duda', ejecuta la migración SQL de 'en_duda'.",
      );
      const rollbackMap = { ...nextMap };
      if (prev) rollbackMap[jugadorId] = prev;
      else delete rollbackMap[jugadorId];
      setAsistenciaByJugador(rollbackMap);
    } else {
      setSaveError(null);
    }

    setSavingJugadorId(null);
  };

  return (
    <>
      <article className="flex h-full min-h-[420px] flex-col rounded-2xl border border-cyan-700/60 bg-gradient-to-b from-cyan-950/70 via-zinc-950 to-zinc-950 p-4 shadow-md shadow-cyan-900/40">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-300">
            Fixture
          </p>
          <span className="text-[10px] text-zinc-400">Vista previa por categoría</span>
        </div>

        <div className="mt-3 flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
          {loading ? (
            <p className="text-xs text-zinc-400">Cargando fixtures...</p>
          ) : (
            <div className="space-y-2">
              {CATEGORIAS.map((cat) => {
                const item = resumenCategorias.find((r) => r.categoria === cat.value);
                const p = item?.partido ?? null;
                return (
                  <div
                    key={cat.value}
                    className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-2.5 py-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-semibold text-cyan-300">{cat.label}</p>
                      <button
                        type="button"
                        disabled={!p}
                        onClick={() => p && void openModal(cat.value, p)}
                        className="rounded-lg bg-cyan-500 px-2 py-1 text-[10px] font-semibold text-black shadow-sm transition hover:-translate-y-[1px] hover:bg-cyan-400 hover:shadow-[0_0_10px_rgba(34,211,238,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 active:translate-y-0 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                      >
                        Ir a confirmar
                      </button>
                    </div>
                    {p ? (
                      <div className="mt-1 flex items-center gap-1 overflow-hidden">
                        <span className="inline-flex h-6 min-w-8 items-center justify-center rounded-md border border-cyan-500/40 bg-cyan-950/30 px-1 text-[11px] font-bold text-cyan-100">
                          {dayNumber(p.fecha_partido)}
                        </span>
                        <span className="inline-flex h-6 items-center justify-center rounded-md border border-sky-700/50 bg-sky-950/40 px-2 text-[10px] font-medium text-sky-200">
                          {p.hora ?? "--:--"}
                        </span>
                        <span className="inline-flex h-6 items-center justify-center rounded-md border border-emerald-700/50 bg-emerald-950/35 px-2 text-[10px] font-medium text-emerald-200">
                          {p.cancha ?? "-"}
                        </span>
                        <span className="inline-flex h-6 min-w-0 items-center gap-1 rounded-md border border-violet-700/45 bg-violet-950/25 px-2 text-[10px] font-medium text-violet-200">
                          <span className="truncate whitespace-nowrap">vs {p.rival}</span>
                        </span>
                      </div>
                    ) : (
                      <p className="mt-1 truncate text-[10px] text-zinc-500">
                        Sin partido programado
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </article>

      {abierto && selectedPartido && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setAbierto(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/70 px-4 py-3">
              <div>
                <p className="text-xs uppercase text-cyan-300">Confirmar asistencia</p>
                <p className="text-sm text-zinc-300">
                  {(CATEGORIAS.find((c) => c.value === selectedCategoria)?.label ??
                    selectedCategoria) ||
                    "Categoría"}{" "}
                  • {selectedPartido.rival} • {formatFecha(selectedPartido.fecha_partido)}
                </p>
              </div>
              <button
                type="button"
                className="rounded px-2 py-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                onClick={() => setAbierto(false)}
              >
                Cerrar
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-3">
              <section className="mb-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-zinc-500">Avance confirmación</p>
                    <p className="text-lg font-bold text-zinc-100">
                      Han respondido {respondidos}{" "}
                      <span className="text-sm font-medium text-zinc-400">de {jugadoresCount}</span>
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-zinc-200">{porcentajeRespondidos}%</p>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-cyan-400 transition-all"
                    style={{ width: `${porcentajeRespondidos}%` }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-emerald-700/40 bg-emerald-950/20 p-2">
                    <div className="mb-1 flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-emerald-300">Confirmado</span>
                      <span className="text-zinc-300">
                        {disponibles}/{jugadoresCount}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${porcentajeVoy}%` }}
                      />
                    </div>
                  </div>
                  <div className="rounded-lg border border-amber-700/40 bg-amber-950/20 p-2">
                    <div className="mb-1 flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-amber-300">En duda</span>
                      <span className="text-zinc-300">
                        {enDuda}/{jugadoresCount}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all"
                        style={{ width: `${jugadoresCount > 0 ? Math.round((enDuda / jugadoresCount) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="rounded-lg border border-rose-700/40 bg-rose-950/20 p-2">
                    <div className="mb-1 flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-rose-300">No juega</span>
                      <span className="text-zinc-300">
                        {noDisponibles}/{jugadoresCount}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-rose-500 transition-all"
                        style={{ width: `${porcentajeNoVoy}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(["POR", "DEF", "MED", "DEL"] as const).map((pos) => {
                    const total = dashboardPosiciones[pos].total;
                    const voy = dashboardPosiciones[pos].voy;
                    const pendientes = Math.max(0, total - voy);
                    return (
                      <div key={pos} className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-2">
                        <p className="text-[10px] font-semibold text-cyan-300">{pos}</p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {Array.from({ length: voy }, (_, i) => (
                            <span
                              key={`ok-${pos}-${i}`}
                              className="inline-flex h-2.5 w-5 rounded-full border border-emerald-400/70 bg-emerald-500/80 shadow-[0_0_5px_rgba(16,185,129,0.4)]"
                              title="Confirmado"
                            />
                          ))}
                          {Array.from({ length: pendientes }, (_, i) => (
                            <span
                              key={`pend-${pos}-${i}`}
                              className="inline-flex h-2.5 w-5 rounded-full border border-zinc-300/70 bg-transparent"
                              title="Pendiente por confirmar"
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {saveError && (
                <div className="mb-3 rounded-lg border border-rose-700/40 bg-rose-950/30 px-3 py-2 text-[11px] text-rose-200">
                  {saveError}
                </div>
              )}
              {(
                [
                  ["Confirmados", jugadoresAgrupados.confirmados],
                  ["En duda", jugadoresAgrupados.enDudaList],
                  ["No irán", jugadoresAgrupados.noIran],
                  ["Por responder", jugadoresAgrupados.porResponder],
                ] as const
              ).map(([titulo, lista]) => (
                <section key={titulo} className="mb-3 last:mb-0">
                  <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                    {titulo} ({lista.length})
                  </p>
                  <ul className="space-y-1.5">
                    {lista.map((j) => {
                      const checked = asistenciaByJugador[j.id] === "disponible";
                      return (
                        <li
                          key={j.id}
                          className={`flex items-center justify-between rounded-lg border px-2 py-1.5 ${
                            titulo === "Confirmados"
                              ? "border-emerald-700/40 bg-emerald-950/20"
                              : titulo === "No irán"
                              ? "border-rose-700/40 bg-rose-950/20"
                              : titulo === "En duda"
                              ? "border-amber-700/40 bg-amber-950/20"
                              : "border-zinc-800 bg-zinc-900/60"
                          }`}
                        >
                          <div className="min-w-0 pr-2 text-xs">
                            <p className="truncate text-zinc-100">
                              {j.nombre}{" "}
                              {j.apodo ? <span className="italic text-amber-300">{j.apodo}</span> : null}{" "}
                              {apellidoPaterno(j.apellido)}
                            </p>
                            <p className="text-[10px] text-zinc-500">#{j.numero ?? "-"}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={savingJugadorId === j.id}
                              onClick={() => void upsertAsistencia(j.id, "disponible")}
                              className={`rounded border px-2 py-1 text-[10px] ${
                                checked
                                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-200"
                                  : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                              }`}
                            >
                              Voy
                            </button>
                            <button
                              type="button"
                              disabled={savingJugadorId === j.id}
                              onClick={() => void upsertAsistencia(j.id, "en_duda")}
                              className={`rounded border px-2 py-1 text-[10px] ${
                                asistenciaByJugador[j.id] === "en_duda"
                                  ? "border-amber-500 bg-amber-500/20 text-amber-200"
                                  : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                              }`}
                            >
                              En duda
                            </button>
                            <button
                              type="button"
                              disabled={savingJugadorId === j.id}
                              onClick={() => void upsertAsistencia(j.id, "no_disponible")}
                              className={`rounded border px-2 py-1 text-[10px] ${
                                asistenciaByJugador[j.id] === "no_disponible"
                                  ? "border-rose-500 bg-rose-500/20 text-rose-200"
                                  : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                              }`}
                            >
                              No voy
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
