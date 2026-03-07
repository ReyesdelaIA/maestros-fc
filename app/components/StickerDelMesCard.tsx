"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const STORAGE_KEY = "maestros-sticker-mes-visto";

export default function StickerDelMesCard() {
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
        className="group/card flex h-full min-h-[360px] w-full cursor-pointer flex-col rounded-2xl border-2 border-amber-400/60 bg-gradient-to-br from-amber-950/90 via-orange-950/80 to-yellow-950/70 px-4 pt-3 pb-3 text-left shadow-lg shadow-amber-900/40 transition active:scale-[0.99]"
      >
        <div className="flex items-center justify-between rounded-xl border border-amber-400/50 bg-amber-900/50 px-3 py-2.5">
          <h2 className="text-[12px] font-bold uppercase tracking-tight text-amber-100">
            El Sticker del Mes
          </h2>
          <span className="relative inline-flex">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`h-5 w-5 ${visto ? "text-amber-400/70" : "text-amber-400"}`} aria-hidden>
              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
            </svg>
            {!visto && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-zinc-950">
                1
              </span>
            )}
          </span>
        </div>

        <div className="mt-3 mx-auto block w-full max-w-[85%] overflow-hidden rounded-xl border border-amber-500/40 bg-black/30">
          <div className="relative h-44 w-full">
            <Image
              src="/stikerperro.png"
              alt="Sticker del mes"
              fill
              sizes="240px"
              className="object-cover object-center transition group-hover/card:opacity-90"
            />
          </div>
        </div>

        <div className="mt-3 w-full text-center">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">
            Febrero 2026
          </p>
          <p className="mt-0.5 inline-block rounded-lg border border-amber-400/50 bg-amber-500/20 px-3 py-1 text-sm font-semibold text-zinc-50 shadow-[0_0_12px_rgba(251,191,36,0.15)]">
            El que entiende, entiende
          </p>
        </div>
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-sticker-titulo"
          onClick={() => setAbierto(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border-2 border-amber-500/50 bg-zinc-950 shadow-2xl shadow-amber-900/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-amber-500/30 bg-amber-950/50 px-4 py-3">
              <h2 id="modal-sticker-titulo" className="text-sm font-bold uppercase text-amber-400">
                El sticker del mes
              </h2>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="rounded-full p-1.5 text-amber-200/80 transition hover:bg-amber-900/50 hover:text-amber-100"
                aria-label="Cerrar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="max-h-[calc(90vh-60px)] overflow-y-auto p-6">
              <p className="mb-4 text-[10px] font-medium uppercase tracking-wide text-amber-300/80">
                Febrero 2026
              </p>
              <div className="mb-5 flex h-[64vh] max-h-[560px] items-center justify-center overflow-hidden rounded-xl border border-amber-500/40 bg-black/30">
                <Image
                  src="/stikerperro.png"
                  alt="Sticker del mes"
                  width={400}
                  height={500}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="space-y-3 text-center text-sm italic leading-relaxed text-amber-200/90">
                <p>
                  Hay cosas que no necesitan explicación, otras que sí, el que entiende, entiende, todos conocen las reglas.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
