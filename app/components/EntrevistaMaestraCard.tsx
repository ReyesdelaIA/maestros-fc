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
      <button
        type="button"
        onClick={abrir}
        className="group/card flex h-full min-h-[360px] w-full cursor-pointer flex-col rounded-2xl border border-sky-700/60 bg-gradient-to-b from-sky-950/80 via-slate-950 to-zinc-950 px-4 pt-3 pb-3 text-left shadow-xl shadow-sky-900/40 transition active:scale-[0.99]"
      >
        <div className="flex items-center justify-between rounded-xl border border-sky-500/40 bg-sky-950/60 px-3 py-2.5">
          <h2 className="text-[12px] font-bold uppercase tracking-tight text-sky-100">
            Entrevista Maestra
          </h2>
          <span className="relative inline-flex">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`h-5 w-5 ${visto ? "text-sky-400/70" : "text-sky-400"}`} aria-hidden>
              <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.29 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.68-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97Z" clipRule="evenodd" />
            </svg>
            {!visto && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-zinc-950">
                1
              </span>
            )}
          </span>
        </div>

        <div className="mt-3 mx-auto w-full max-w-[85%] overflow-hidden rounded-xl bg-black/40">
          <div className="relative h-44 w-full overflow-hidden rounded-xl bg-black/70">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/raullagos.png"
              alt="Entrevistado del mes: Raúl Lagos"
              className="h-full w-full object-cover object-center transition group-hover/card:opacity-90"
            />
          </div>
        </div>

        <div className="mt-3 w-full text-center">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">
            ¿Viste lo que dijo? Léela ya
          </p>
          <p className="mt-0.5 inline-block rounded-lg border border-amber-400/50 bg-amber-500/20 px-3 py-1 text-sm font-semibold text-zinc-50 shadow-[0_0_12px_rgba(251,191,36,0.15)]">
            Raúl Lagos Izquierdo — SS Fútbol
          </p>
        </div>
      </button>

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
                    • ¿Cómo ves al equipo para este campeonato?
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
