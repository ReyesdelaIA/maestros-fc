"use client";

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

type Jugador = {
  id: string;
  nombre: string;
  apodo: string | null;
  apellido: string;
  numero: number | null;
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

function apellidoPaterno(apellidos: string): string {
  return (apellidos ?? "").trim().split(/\s+/)[0] ?? "";
}

export default function FixtureCard() {
  const [categoria, setCategoria] = useState<Categoria>("Super Senior Futbolito");
  const [partido, setPartido] = useState<Partido | null>(null);
  const [jugadoresCount, setJugadoresCount] = useState<number>(0);
  const [disponibles, setDisponibles] = useState<number>(0);
  const [enDuda, setEnDuda] = useState<number>(0);
  const [noDisponibles, setNoDisponibles] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [abierto, setAbierto] = useState<boolean>(false);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [asistenciaByJugador, setAsistenciaByJugador] = useState<
    Record<string, AsistenciaEstado>
  >({});
  const [savingJugadorId, setSavingJugadorId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setPartido(null);
      setDisponibles(0);
      setEnDuda(0);
      setNoDisponibles(0);

      const hoy = new Date().toISOString().slice(0, 10);
      const [partidosRes, jugadoresCountRes] = await Promise.all([
        supabase
          .from("fixture_partidos")
          .select("id, categoria, rival, fecha_partido, hora, cancha, estado")
          .eq("categoria", categoria)
          .eq("estado", "programado")
          .gte("fecha_partido", hoy)
          .order("fecha_partido", { ascending: true })
          .limit(8),
        supabase
          .from("jugadores")
          .select("id", { count: "exact", head: true })
          .eq("categoria", categoria),
      ]);

      setJugadoresCount(jugadoresCountRes.count ?? 0);

      const partidos = (partidosRes.data ?? []) as Partido[];
      const proximo = partidos.find((p) => isWeekend(p.fecha_partido)) ?? partidos[0] ?? null;
      setPartido(proximo);

      if (proximo) {
        const asistenciaRes = await supabase
          .from("asistencias_partido")
          .select("estado_asistencia")
          .eq("partido_id", proximo.id);
        const rows = (asistenciaRes.data ?? []) as Array<{ estado_asistencia: AsistenciaEstado }>;
        setDisponibles(rows.filter((r) => r.estado_asistencia === "disponible").length);
        setEnDuda(rows.filter((r) => r.estado_asistencia === "en_duda").length);
        setNoDisponibles(rows.filter((r) => r.estado_asistencia === "no_disponible").length);
      }

      setLoading(false);
    };

    void load();
  }, [categoria]);

  const openModal = async () => {
    if (!partido) return;
    setAbierto(true);
    setSaveError(null);

    const [jugadoresRes, asistenciaRes] = await Promise.all([
      supabase
        .from("jugadores")
        .select("id, nombre, apodo, apellido, numero")
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
    setAsistenciaByJugador(map);
  };

  const upsertAsistencia = async (
    jugadorId: string,
    nuevoEstado: AsistenciaEstado,
  ) => {
    if (!partido) return;
    const prev = asistenciaByJugador[jugadorId];

    setSavingJugadorId(jugadorId);
    const nextMap = { ...asistenciaByJugador, [jugadorId]: nuevoEstado };
    setAsistenciaByJugador(nextMap);

    const disponiblesNext = Object.values(nextMap).filter((v) => v === "disponible").length;
    const enDudaNext = Object.values(nextMap).filter((v) => v === "en_duda").length;
    const noDisponiblesNext = Object.values(nextMap).filter((v) => v === "no_disponible").length;
    setDisponibles(disponiblesNext);
    setEnDuda(enDudaNext);
    setNoDisponibles(noDisponiblesNext);

    const { error } = await supabase.from("asistencias_partido").upsert(
      {
        partido_id: partido.id,
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
      setDisponibles(Object.values(rollbackMap).filter((v) => v === "disponible").length);
      setEnDuda(Object.values(rollbackMap).filter((v) => v === "en_duda").length);
      setNoDisponibles(Object.values(rollbackMap).filter((v) => v === "no_disponible").length);
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
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as Categoria)}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-[10px] text-zinc-200"
          >
            {CATEGORIAS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
          {loading ? (
            <p className="text-xs text-zinc-400">Cargando próximo partido...</p>
          ) : !partido ? (
            <p className="text-xs text-zinc-400">
              No hay partidos programados para esta categoría.
            </p>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-zinc-500">Próximo partido</p>
                <p className="text-sm font-semibold text-zinc-100">{partido.rival}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className="rounded-lg bg-zinc-950/70 px-2 py-1.5">
                  <p className="uppercase text-zinc-500">Fecha</p>
                  <p className="font-medium text-zinc-200">{formatFecha(partido.fecha_partido)}</p>
                </div>
                <div className="rounded-lg bg-zinc-950/70 px-2 py-1.5">
                  <p className="uppercase text-zinc-500">Hora</p>
                  <p className="font-medium text-zinc-200">{partido.hora ?? "-"}</p>
                </div>
                <div className="rounded-lg bg-zinc-950/70 px-2 py-1.5">
                  <p className="uppercase text-zinc-500">Cancha</p>
                  <p className="font-medium text-zinc-200">{partido.cancha ?? "-"}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                <div className="rounded-lg border border-emerald-700/50 bg-emerald-950/40 px-2 py-1.5">
                  <p className="text-zinc-400">Voy</p>
                  <p className="text-base font-bold text-emerald-300">{disponibles}</p>
                </div>
                <div className="rounded-lg border border-amber-700/50 bg-amber-950/30 px-2 py-1.5">
                  <p className="text-zinc-400">En duda</p>
                  <p className="text-base font-bold text-amber-300">{enDuda}</p>
                </div>
                <div className="rounded-lg border border-rose-700/40 bg-rose-950/30 px-2 py-1.5">
                  <p className="text-zinc-400">No voy</p>
                  <p className="text-base font-bold text-rose-300">{noDisponibles}</p>
                </div>
                <div className="rounded-lg border border-zinc-700 bg-zinc-900/70 px-2 py-1.5">
                  <p className="text-zinc-400">Sin resp.</p>
                  <p className="text-base font-bold text-zinc-200">{sinResponder}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => void openModal()}
          disabled={!partido}
          className="mt-3 rounded-xl bg-cyan-500 px-3 py-2 text-xs font-semibold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-300"
        >
          Confirmar asistencia
        </button>
      </article>

      {abierto && partido && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setAbierto(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
              <div>
                <p className="text-xs uppercase text-cyan-300">Confirmar asistencia</p>
                <p className="text-sm text-zinc-300">
                  {partido.rival} • {formatFecha(partido.fecha_partido)}
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
