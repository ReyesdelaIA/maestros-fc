"use client";

import Link from "next/link";
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
  posicion: string | null;
  posicion_2: string | null;
};

type AsistenciaEstado = "disponible" | "en_duda" | "no_disponible";

const CATEGORIAS: Array<{ value: Categoria; label: string }> = [
  { value: "Junior Fútbol", label: "Junior" },
  { value: "Senior Fútbol", label: "Senior" },
  { value: "Super Senior Futbolito", label: "Super Senior futbolito" },
  { value: "Super Senior Fútbol", label: "Super Senior fútbol" },
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
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function apellidoPaterno(apellidos: string): string {
  return (apellidos ?? "").trim().split(/\s+/)[0] ?? "";
}

export default function AsistenciaPage() {
  const [authChecking, setAuthChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [selectedPartido, setSelectedPartido] = useState<Partido | null>(null);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [asistenciaByJugador, setAsistenciaByJugador] = useState<Record<string, AsistenciaEstado>>({});
  const [savingJugadorId, setSavingJugadorId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setIsLoggedIn(Boolean(data.session));
      setAuthChecking(false);
    };
    void check();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session));
      setAuthChecking(false);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (authChecking) {
    return (
      <div className="min-h-screen bg-black text-zinc-50">
        <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4">
          <p className="text-sm text-zinc-300">Validando sesión...</p>
        </main>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black text-zinc-50">
        <main
          className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-3 px-4 text-center"
          style={{ paddingTop: "max(env(safe-area-inset-top), 2.75rem)" }}
        >
          <p className="text-sm text-zinc-300">
            Debes iniciar sesión para confirmar asistencia.
          </p>
          <Link
            href="/login?next=%2Fasistencia"
            className="inline-flex items-center rounded-full border border-sky-500/70 bg-sky-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-sky-200 hover:bg-sky-500/30"
          >
            Iniciar sesión
          </Link>
          <Link href="/" className="text-xs text-zinc-500 underline">
            Volver al inicio
          </Link>
        </main>
      </div>
    );
  }

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
  const respondidos = useMemo(
    () => disponibles + enDuda + noDisponibles,
    [disponibles, enDuda, noDisponibles],
  );

  const jugadoresAgrupados = useMemo(() => {
    const base = [...jugadores].sort((a, b) =>
      `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, "es"),
    );
    const confirmados: Jugador[] = [];
    const enDudaList: Jugador[] = [];
    const noIran: Jugador[] = [];
    const porResponder: Jugador[] = [];

    for (const j of base) {
      const estado = asistenciaByJugador[j.id];
      if (estado === "disponible") confirmados.push(j);
      else if (estado === "en_duda") enDudaList.push(j);
      else if (estado === "no_disponible") noIran.push(j);
      else porResponder.push(j);
    }
    return { confirmados, enDudaList, noIran, porResponder };
  }, [jugadores, asistenciaByJugador]);

  const loadCategoria = async (categoria: Categoria) => {
    setLoading(true);
    setSaveError(null);
    setGeneralError(null);
    setSelectedCategoria(categoria);
    setSelectedPartido(null);
    setJugadores([]);
    setAsistenciaByJugador({});

    try {
      const hoy = new Date().toISOString().slice(0, 10);
      const partidoRes = await supabase
        .from("fixture_partidos")
        .select("id, categoria, rival, fecha_partido, hora, cancha, estado")
        .eq("categoria", categoria)
        .eq("estado", "programado")
        .gte("fecha_partido", hoy)
        .order("fecha_partido", { ascending: true })
        .limit(5);

      const lista = (partidoRes.data ?? []) as Partido[];
      const partido = lista.find((p) => isWeekend(p.fecha_partido)) ?? lista[0] ?? null;
      setSelectedPartido(partido);

      if (!partido) {
        setLoading(false);
        return;
      }

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
      setAsistenciaByJugador(map);
    } catch (_err) {
      setGeneralError("No se pudo cargar la vista de asistencia. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const upsertAsistencia = async (jugadorId: string, nuevoEstado: AsistenciaEstado) => {
    if (!selectedPartido) return;
    const prev = asistenciaByJugador[jugadorId];
    const nextMap = { ...asistenciaByJugador, [jugadorId]: nuevoEstado };

    setSavingJugadorId(jugadorId);
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
    <div className="min-h-screen bg-black text-zinc-50">
      <main
        className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-4 px-4 pb-10"
        style={{ paddingTop: "max(env(safe-area-inset-top), 2.75rem)" }}
      >
        <header className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-3">
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-emerald-500/70 bg-emerald-500/10 px-4 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/20"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-base leading-none">
              ←
            </span>
            <span>Volver al dashboard</span>
          </Link>
        </header>

        <section className="rounded-2xl border border-sky-700/50 bg-gradient-to-b from-sky-950/50 via-zinc-950 to-zinc-950 p-4">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-base font-semibold text-sky-200">Confirmar asistencia</h1>
            {selectedCategoria && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategoria(null);
                  setSelectedPartido(null);
                  setJugadores([]);
                  setAsistenciaByJugador({});
                  setGeneralError(null);
                }}
                className="rounded-lg border border-zinc-700 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800"
              >
                Cambiar categoría
              </button>
            )}
          </div>

          {!selectedCategoria ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => void loadCategoria(cat.value)}
                  className="rounded-xl border border-zinc-700 bg-zinc-900/70 px-3 py-3 text-left text-sm font-semibold text-zinc-100 hover:border-sky-500/60 hover:bg-zinc-800"
                >
                  {cat.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {loading ? (
                <p className="text-sm text-zinc-400">Cargando asistencia...</p>
              ) : !selectedPartido ? (
                <p className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-400">
                  No hay partido programado para {CATEGORIAS.find((c) => c.value === selectedCategoria)?.label}.
                </p>
              ) : (
                <>
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2">
                    <p className="text-xs text-cyan-300">
                      {CATEGORIAS.find((c) => c.value === selectedCategoria)?.label} • vs{" "}
                      {selectedPartido.rival}
                    </p>
                    <p className="text-sm text-zinc-300">
                      {formatFecha(selectedPartido.fecha_partido)} • {selectedPartido.hora ?? "--:--"} •{" "}
                      {selectedPartido.cancha ?? "Cancha por definir"}
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      Han respondido {respondidos} de {jugadores.length}
                    </p>
                  </div>

                  {saveError && (
                    <div className="rounded-lg border border-rose-700/40 bg-rose-950/30 px-3 py-2 text-[11px] text-rose-200">
                      {saveError}
                    </div>
                  )}
                  {generalError && (
                    <div className="rounded-lg border border-rose-700/40 bg-rose-950/30 px-3 py-2 text-[11px] text-rose-200">
                      {generalError}
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
                    <section key={titulo}>
                      <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                        {titulo} ({lista.length})
                      </p>
                      <ul className="space-y-1.5">
                        {lista.map((j) => (
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
                                  asistenciaByJugador[j.id] === "disponible"
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
                        ))}
                      </ul>
                    </section>
                  ))}
                </>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
