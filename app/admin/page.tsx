"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

const CATEGORIAS = [
  "Maestros Junior",
  "Maestros Senior",
  "Maestros SS Futbolito",
  "Maestros SS Martes",
] as const;

type CategoriaAdmin = (typeof CATEGORIAS)[number];

export default function AdminPage() {
  const router = useRouter();
  const [categoria, setCategoria] = useState<CategoriaAdmin>("Maestros SS Futbolito");
  const [rival, setRival] = useState("");
  const [golesMaestros, setGolesMaestros] = useState("0");
  const [golesRival, setGolesRival] = useState("0");
  const [detalleGoles, setDetalleGoles] = useState("");
  const [detalleAsistencias, setDetalleAsistencias] = useState("");
  const [fechaPartido, setFechaPartido] = useState<string>(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
  });
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);
    setError(null);

    try {
      const golesLocal = Number.isNaN(Number(golesMaestros))
        ? 0
        : Number(golesMaestros);
      const golesVisita = Number.isNaN(Number(golesRival))
        ? 0
        : Number(golesRival);

      const { error: insertError } = await supabase.from("resultados_maestros").insert({
        categoria,
        rival: rival || null,
        goles_maestros: golesLocal,
        goles_rival: golesVisita,
        detalle_goles: detalleGoles || null,
        detalle_asistencias: detalleAsistencias || null,
        fecha_partido: fechaPartido ? new Date(fechaPartido).toISOString() : new Date().toISOString(),
      });

      if (insertError) {
        throw insertError;
      }

      setMensaje("Resultado guardado ✅");
      // reset rápido para el siguiente partido
      setRival("");
      setGolesMaestros("0");
      setGolesRival("0");
      setDetalleGoles("");
      setDetalleAsistencias("");
      // Forzar refresco de la página principal cuando vuelvas
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Error inesperado al guardar el resultado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-zinc-50">
      <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 pb-10 pt-6">
        <header className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-400">
              Admin
            </p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-zinc-50">
              Registrar resultado
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Formulario rápido pensado para usar desde el teléfono.
            </p>
          </div>
          <Link
            href="/"
            className="text-[11px] font-medium text-emerald-300 hover:text-emerald-200"
          >
            ← Volver
          </Link>
        </header>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Categoría
            </label>
            <select
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
              value={categoria}
              onChange={(e) =>
                setCategoria(e.target.value as CategoriaAdmin)
              }
            >
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Rival
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
              placeholder="Nombre del rival"
              value={rival}
              onChange={(e) => setRival(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                Goles Maestros
              </label>
              <input
                type="number"
                min={0}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
                value={golesMaestros}
                onChange={(e) => setGolesMaestros(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                Goles rival
              </label>
              <input
                type="number"
                min={0}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
                value={golesRival}
                onChange={(e) => setGolesRival(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Fecha y hora del partido
            </label>
            <input
              type="datetime-local"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
              value={fechaPartido}
              onChange={(e) => setFechaPartido(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Goles (texto rápido)
            </label>
            <textarea
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
              rows={2}
              placeholder="Ej: Felipe Reyes x2, Raúl Lagos x1"
              value={detalleGoles}
              onChange={(e) => setDetalleGoles(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Asistencias (texto rápido)
            </label>
            <textarea
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
              rows={2}
              placeholder="Ej: Huaso x1, Chumi x2"
              value={detalleAsistencias}
              onChange={(e) => setDetalleAsistencias(e.target.value)}
            />
          </div>

          {mensaje && (
            <p className="text-[11px] font-medium text-emerald-400">
              {mensaje}
            </p>
          )}
          {error && (
            <p className="text-[11px] font-medium text-rose-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black shadow-md shadow-emerald-700/40 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Guardar resultado"}
          </button>
        </form>
      </main>
    </div>
  );
}

