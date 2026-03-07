"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CumplePhoto from "./CumplePhoto";

const STORAGE_PREFIX = "maestros-cumple-visto";

type CumpleCardProps = {
  jugador: {
    id: string;
    nombre: string;
    apodo: string | null;
    apellido: string;
  } | null;
  foto: string | null;
  fechaEtiqueta: string;
  diasRestantes: number;
};

export default function CumpleCard({
  jugador,
  foto,
  fechaEtiqueta,
  diasRestantes,
}: CumpleCardProps) {
  const [visto, setVisto] = useState(false);
  const storageKey = jugador ? `${STORAGE_PREFIX}-${jugador.id}` : null;

  useEffect(() => {
    if (!storageKey) return;
    try {
      setVisto(localStorage.getItem(storageKey) === "1");
    } catch {
      setVisto(false);
    }
  }, [storageKey]);

  const marcarVisto = () => {
    if (!storageKey) return;
    setVisto(true);
    try {
      localStorage.setItem(storageKey, "1");
    } catch {}
  };

  if (!jugador) {
    return (
      <section className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-2xl border border-emerald-700/60 bg-gradient-to-b from-emerald-950/90 via-emerald-950/70 to-zinc-950 px-4 pt-3 pb-3 shadow-md shadow-emerald-900/50">
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-950/60 px-3 py-2.5 w-full">
          <h2 className="text-[12px] font-bold uppercase tracking-tight text-zinc-50">
            Maestro Cumpleañero
          </h2>
        </div>
        <p className="mt-4 text-sm text-zinc-400 text-center">
          Aún no hay fechas de nacimiento registradas.
        </p>
      </section>
    );
  }

  return (
    <Link
      href={`/jugadores/${jugador.id}`}
      onClick={marcarVisto}
      className="group/card flex h-full min-h-[360px] cursor-pointer flex-col rounded-2xl border border-emerald-700/60 bg-gradient-to-b from-emerald-950/90 via-emerald-950/70 to-zinc-950 px-4 pt-3 pb-3 shadow-md shadow-emerald-900/50 transition active:scale-[0.99]"
    >
      <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-950/60 px-3 py-2.5">
        <h2 className="text-[12px] font-bold uppercase tracking-tight text-zinc-50">
          Maestro Cumpleañero
        </h2>
        <span className="relative inline-flex">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`h-5 w-5 ${visto ? "text-emerald-400/70" : "text-emerald-400"}`} aria-hidden>
            <path d="M15 1.784l-.796.796a1.125 1.125 0 1 0 1.591 0L15 1.784ZM9.75 7.547c.498-.02.998-.035 1.5-.042V6.75a.75.75 0 0 1 1.5 0v.755c.502.007 1.002.021 1.5.042V6.75a.75.75 0 0 1 1.5 0v.88l.307.022c1.55.117 2.693 1.427 2.693 2.946v1.018a62.182 62.182 0 0 0-13.5 0v-1.018c0-1.519 1.143-2.829 2.693-2.946l.307-.022v-.88a.75.75 0 0 1 1.5 0v.836ZM12 12.75c-2.472 0-4.9.184-7.274.54-1.454.217-2.476 1.482-2.476 2.916v.384a4.104 4.104 0 0 1 2.585.364 2.605 2.605 0 0 0 2.33 0 4.104 4.104 0 0 1 3.67 0 2.605 2.605 0 0 0 2.33 0 4.104 4.104 0 0 1 3.67 0 2.605 2.605 0 0 0 2.33 0 4.104 4.104 0 0 1 2.585-.364v-.384c0-1.434-1.022-2.7-2.476-2.917A49.138 49.138 0 0 0 12 12.75ZM21.75 18.131a2.604 2.604 0 0 0-1.915.165 4.104 4.104 0 0 1-3.67 0 2.605 2.605 0 0 0-2.33 0 4.104 4.104 0 0 1-3.67 0 2.605 2.605 0 0 0-2.33 0 4.104 4.104 0 0 1-3.67 0 2.604 2.604 0 0 0-1.915-.165v2.494c0 1.036.84 1.875 1.875 1.875h15.75c1.035 0 1.875-.84 1.875-1.875v-2.494Z" />
          </svg>
          {!visto && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-zinc-950">
              1
            </span>
          )}
        </span>
      </div>

      <div className="mt-3 mx-auto block w-full max-w-[260px] overflow-hidden rounded-xl bg-black/60">
        <div className="relative h-44 w-full">
          {foto ? (
            <CumplePhoto
              src={foto}
              alt={`${jugador.nombre} ${jugador.apellido}`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-center text-xs text-zinc-400">
              Foto pendiente
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 w-full text-center">
        <p className="text-[10px] uppercase tracking-wide text-zinc-500">
          Un gran cumpleañero
        </p>
        <p className="mt-0.5 inline-block rounded-lg border border-amber-400/50 bg-amber-500/20 px-3 py-1 text-sm font-semibold text-zinc-50 shadow-[0_0_12px_rgba(251,191,36,0.15)]">
          {jugador.apodo ? (
            <>
              <span className="font-bold italic text-amber-200">
                {jugador.apodo}
              </span>{" "}
              {jugador.apellido}
            </>
          ) : (
            <>
              {jugador.nombre} {jugador.apellido}
            </>
          )}
        </p>
      </div>

      <div className="mt-2 flex items-end justify-between gap-4 px-1">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">
            Fecha
          </p>
          <p className="text-sm font-medium text-zinc-100">{fechaEtiqueta}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wide text-emerald-300">
            Cuenta regresiva
          </p>
          <p className="text-xl font-extrabold tracking-tight text-emerald-200">
            {diasRestantes === 0
              ? "¡Hoy!"
              : `${diasRestantes} ${diasRestantes === 1 ? "día" : "días"}`}
          </p>
        </div>
      </div>
    </Link>
  );
}
