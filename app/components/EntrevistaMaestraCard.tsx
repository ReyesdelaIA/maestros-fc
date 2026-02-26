"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "maestros-entrevista-maestra-visto";

export default function EntrevistaMaestraCard() {
  const [abierto, setAbierto] = useState(false);
  const [visto, setVisto] = useState(false);

  useEffect(() => {
    try {
      setVisto(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setVisto(false);
    }
  }, []);

  const abrir = () => {
    setAbierto(true);
    setVisto(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  };

  return (
    <>
      <section className="flex h-full min-h-[420px] flex-col rounded-2xl border border-sky-700/60 bg-gradient-to-b from-sky-950/80 via-slate-950 to-zinc-950 p-4 shadow-xl shadow-sky-900/40">
        <div className="mb-2 flex justify-start">
          <span className="inline-flex items-center rounded-full border border-sky-500/70 bg-sky-950/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-200">
            Entrevista
          </span>
        </div>

        <button
          type="button"
          onClick={abrir}
          className="group mx-auto w-full max-w-[85%] overflow-hidden rounded-2xl bg-black/40 transition active:scale-[0.98]"
          aria-label="Abrir entrevista Maestra"
        >
          <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-black/70">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/raullagos.png"
              alt="Entrevistado del mes: Raúl Lagos"
              className="h-full w-full object-cover object-center group-hover:opacity-90"
            />
          </div>
        </button>

        <button
          type="button"
          onClick={abrir}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-sky-500/60 bg-sky-950/40 py-2.5 transition hover:bg-sky-900/60 hover:border-sky-400/70 active:scale-[0.98]"
          aria-label="Ver entrevista"
        >
          <span className="relative inline-flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5 text-sky-300"
              aria-hidden
            >
              <path d="M4.5 5.25A3.75 3.75 0 0 1 8.25 1.5h7.5a3.75 3.75 0 0 1 3.75 3.75v8.25a3.75 3.75 0 0 1-3.75 3.75h-1.757l-2.771 2.771A.75.75 0 0 1 9 18.75V17.25H8.25A3.75 3.75 0 0 1 4.5 13.5v-8.25Z" />
            </svg>
            {!visto && (
              <span
                className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg shadow-red-900/50 ring-2 ring-zinc-900"
                aria-hidden
              >
                1
              </span>
            )}
          </span>
          <span className="text-xs font-semibold text-sky-200">
            Toca para ver la entrevista
          </span>
        </button>

        <h2 className="mt-3 text-center text-sm font-bold uppercase tracking-tight text-sky-100 md:text-base">
          ENTREVISTA MAESTRA
        </h2>
        <p className="mt-2 text-center text-xs italic leading-relaxed text-sky-100/80 md:text-sm">
          Raúl Lagos Izquierdo – Jugador de Maestros SS.
        </p>
      </section>

      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-entrevista-titulo"
          onClick={() => setAbierto(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-sky-700 bg-zinc-950 shadow-2xl shadow-sky-900/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-sky-800/70 bg-sky-950/60 px-4 py-3">
              <h2
                id="modal-entrevista-titulo"
                className="text-sm font-bold uppercase text-sky-200"
              >
                Entrevista Maestra
              </h2>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="rounded-full p-1.5 text-sky-200/80 transition hover:bg-sky-900/60 hover:text-sky-50"
                aria-label="Cerrar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <div className="max-h-[calc(90vh-60px)] overflow-y-auto p-6">
              <p className="mb-4 text-[10px] font-medium uppercase tracking-wide text-sky-300/80">
                Entrevistado del mes: Raúl Lagos
              </p>
              <div className="space-y-4 text-sm leading-relaxed text-sky-100/90">
                <div>
                  <p className="font-semibold text-sky-100">
                    • ¿Cómo ves a Maestros para este campeonato?
                  </p>
                  <p className="mt-1 italic text-sky-100/80">
                    Lorem ipsum dolor sit amet consectetur adipiscing elit
                    convallis id leo risus natoque neque, pretium massa egestas
                    condimentum auctor purus conubia.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-sky-100">
                    • ¿Cuáles crees que serán los rivales más duros?
                  </p>
                  <p className="mt-1 italic text-sky-100/80">
                    Lorem ipsum dolor sit amet consectetur adipiscing elit
                    convallis id leo risus natoque neque, pretium massa egestas
                    condimentum auctor purus conubia.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-sky-100">
                    • ¿Quién crees que serán los jugadores más destacados?
                  </p>
                  <p className="mt-1 italic text-sky-100/80">
                    Lorem ipsum dolor sit amet consectetur adipiscing elit
                    convallis id leo risus natoque neque, pretium massa egestas
                    condimentum auctor purus conubia.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-sky-100">
                    • ¿Algún mensaje para los compañeros o para el Club…?
                  </p>
                  <p className="mt-1 italic text-sky-100/80">
                    Lorem ipsum dolor sit amet consectetur adipiscing elit
                    convallis id leo risus natoque neque, pretium massa egestas
                    condimentum auctor purus conubia.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

