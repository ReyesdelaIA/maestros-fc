"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const STORAGE_KEY = "maestros-recuerdo-visto";

export default function RecuerdoMaestroCard() {
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
        className="group/card flex h-full min-h-[360px] w-full cursor-pointer flex-col rounded-2xl border border-violet-700/50 bg-gradient-to-b from-violet-950/50 to-zinc-950 px-4 pt-3 pb-3 text-left shadow-xl transition active:scale-[0.99]"
      >
        <div className="flex items-center justify-between rounded-xl border border-violet-500/40 bg-violet-950/60 px-3 py-2.5">
          <h2 className="text-[12px] font-bold uppercase tracking-tight text-zinc-50">
            El Recuerdo Maestro
          </h2>
          <span className="relative inline-flex">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`h-5 w-5 ${visto ? "text-violet-400/70" : "text-violet-400"}`} aria-hidden>
              <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
              <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.2.32.58.523.984.523h.908a2.25 2.25 0 0 1 2.25 2.25v7.2a2.25 2.25 0 0 1-2.25 2.25H4.3a2.25 2.25 0 0 1-2.25-2.25v-7.2A2.25 2.25 0 0 1 4.3 6.3h.907c.404 0 .785-.203.984-.523l.821-1.317c.502-.805 1.365-1.338 2.332-1.39ZM12 10.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" clipRule="evenodd" />
            </svg>
            {!visto && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-zinc-950">
                1
              </span>
            )}
          </span>
        </div>

        <div className="mt-3 mx-auto w-full max-w-[85%] overflow-hidden rounded-xl bg-black/40">
          <div className="relative h-44 w-full">
            <Image
              src="/campeones.png"
              alt="El recuerdo Maestro"
              fill
              sizes="240px"
              className="object-cover object-center transition group-hover/card:opacity-90"
            />
          </div>
        </div>

        <div className="mt-3 w-full text-center">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">
            Esto ocurrió en agosto del 2024…
          </p>
          <p className="mt-0.5 inline-block rounded-lg border border-amber-400/50 bg-amber-500/20 px-3 py-1 text-sm font-semibold text-zinc-50 shadow-[0_0_12px_rgba(251,191,36,0.15)]">
            Momento especial en la historia del club
          </p>
        </div>
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-recuerdo-titulo"
          onClick={() => setAbierto(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-4 py-3">
              <h2 id="modal-recuerdo-titulo" className="text-sm font-bold uppercase text-violet-400">
                El recuerdo Maestro
              </h2>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="rounded-full p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
                aria-label="Cerrar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="max-h-[calc(90vh-60px)] overflow-y-auto p-6">
              <p className="mb-4 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                Recuerdo
              </p>
              <div className="mb-5 flex h-[64vh] max-h-[560px] items-center justify-center overflow-hidden rounded-xl bg-zinc-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/celebra.jpg"
                  alt="El recuerdo Maestro - Celebración"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="space-y-4 text-sm italic leading-relaxed text-zinc-300 md:columns-2 md:gap-8 [&>p]:break-inside-avoid">
                <p>
                  Hubo un tiempo en que la copa parecía maldita. Los campeonatos escapaban entre los dedos como agua fría, y la frustración se acumulaba en silencio, piedra sobre piedra, como una montaña que nadie quería nombrar.
                </p>
                <p>
                  Pero en el año 2024, algo cambió. Había una confianza inusitada. Un fuego nuevo. El equipo jugó todo el semestre a alto nivel — y cuando los playoffs amenazaron con apagar la llama, el equipo remontó batalla tras batalla, cuartos, semis, con la garra de quienes saben que su hora ha llegado.
                </p>
                <p>
                  Y llegó el sábado 24 de agosto.
                </p>
                <p>
                  Esa mañana, bajo el mismo cielo de siempre, SS Fútbol no jugó con las piernas… jugaron con el corazón caliente (y cabeza fría), fue una batalla. Y cuando el árbitro hizo sonar el pitazo final, algo que había sido negado durante años cayó por fin sobre sus hombros como luz dorada. ¡Qué desahogo lindo!
                </p>
                <p className="font-semibold text-violet-200 not-italic">
                  La primera estrella.
                </p>
                <p>
                  Vendrían más títulos. Vendrían más glorias. Pero todas nacieron aquí — en esa cancha, con ese grupo de hombres que se negaron a rendirse.
                </p>
                <p className="font-semibold text-violet-200 not-italic">
                  Aquí comenzó la leyenda.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
