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
      <section className="flex h-full min-h-[420px] flex-col rounded-2xl border-2 border-amber-400/60 bg-gradient-to-br from-amber-950/90 via-orange-950/80 to-yellow-950/70 p-4 shadow-lg shadow-amber-900/40">
        <div className="mb-2 flex justify-start">
          <span className="inline-flex items-center rounded-full border border-amber-400/80 bg-amber-900/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-100">
            Febrero&nbsp;26
          </span>
        </div>
        <button
          type="button"
          onClick={abrir}
          className="group mx-auto block w-full max-w-[85%] overflow-hidden rounded-2xl border border-amber-500/60 bg-black/30 transition active:scale-[0.98]"
          aria-label="Abrir sticker del mes"
        >
          <div className="relative h-44 w-full">
            <Image
              src="/stikerperro.png"
              alt="Sticker del mes"
              fill
              sizes="240px"
              className="h-full w-full object-cover object-center group-hover:opacity-90"
            />
          </div>
        </button>
        <button
          type="button"
          onClick={abrir}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/60 bg-amber-950/50 py-2.5 transition hover:bg-amber-900/60 hover:border-amber-400/70 active:scale-[0.98]"
          aria-label="Ver sticker"
        >
          <span className="relative inline-flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5 text-amber-400"
              aria-hidden
            >
              <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
              <path fillRule="evenodd" d="M9.344 3.07a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.732 1.235a.75.75 0 0 1-.326 1.378A51.76 51.76 0 0 0 9.574 5.17a.75.75 0 0 1-.23-1.1Z" clipRule="evenodd" />
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
          <span className="text-xs font-semibold text-amber-200">
            Toca para ver el sticker
          </span>
        </button>
        <h2 className="mt-3 text-center text-sm font-bold uppercase tracking-tight text-amber-100 md:text-base">
          EL STICKER DEL MES
        </h2>
        <p className="mt-2 text-center text-xs italic leading-relaxed text-amber-200/90 md:text-sm">
          Toca para ver el sticker del mes.
        </p>
      </section>

      {/* Modal / Pop-up */}
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
