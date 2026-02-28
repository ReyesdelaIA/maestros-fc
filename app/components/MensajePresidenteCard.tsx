"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const STORAGE_KEY = "maestros-mensaje-presidente-visto";

export default function MensajePresidenteCard() {
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
      <section className="flex h-full min-h-[420px] flex-col rounded-2xl border border-zinc-700/80 bg-gradient-to-b from-zinc-900 to-zinc-950 p-4 shadow-xl">
        <div className="mb-2 flex justify-start">
          <span className="inline-flex items-center rounded-full border border-zinc-600/70 bg-zinc-900/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-300">
            Febrero&nbsp;26
          </span>
        </div>
        <button
          type="button"
          onClick={abrir}
          className="group mx-auto w-full max-w-[85%] overflow-hidden rounded-2xl bg-black/40 transition active:scale-[0.98]"
          aria-label="Abrir mensaje"
        >
          <div className="relative h-44 w-full">
            <Image
              src="/presidente.png"
              alt="Presidente del club"
              fill
              sizes="240px"
              className="h-full w-full object-cover object-top group-hover:opacity-90"
              priority
            />
          </div>
        </button>

        {/* Sobre con badge de mensaje no leído */}
        <button
          type="button"
          onClick={abrir}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-600/50 bg-emerald-950/40 py-2.5 transition hover:bg-emerald-900/50 hover:border-emerald-500/60 active:scale-[0.98]"
          aria-label="Abrir mensaje del presidente"
        >
          <span className="relative inline-flex">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6 text-emerald-400"
              aria-hidden
            >
              <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
              <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
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
          <span className="text-xs font-semibold text-emerald-300">
            Nuevo mensaje — ¡Toca para leer!
          </span>
        </button>

        <h2 className="mt-3 text-center text-sm font-bold uppercase tracking-tight text-zinc-50 md:text-base">
          MENSAJE DEL PRESIDENTE
        </h2>
        <p className="mt-2 text-center text-xs italic leading-relaxed text-zinc-400 md:text-sm">
          Toca el sobre para ver el mensaje mensual.
        </p>
      </section>

      {/* Modal / Pop-up */}
      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-titulo"
          onClick={() => setAbierto(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header con cerrar */}
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-4 py-3">
              <h2 id="modal-titulo" className="text-sm font-bold uppercase text-emerald-400">
                Mensaje del presidente
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

            {/* Contenido desplazable — más ancho, menos scroll */}
            <div className="max-h-[calc(90vh-60px)] overflow-y-auto p-6">
              <p className="mb-4 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                Febrero 2026
              </p>
              <div className="mb-5 flex h-[64vh] max-h-[560px] items-center justify-center overflow-hidden rounded-xl bg-zinc-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/camisetas.jpg"
                  alt="Nuevas camisetas Maestros FC"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="space-y-4 text-sm italic leading-relaxed text-zinc-300 md:columns-2 md:gap-8 [&>p]:break-inside-avoid">
                <p>
                  Hoy presentamos nuestras nuevas pieles… y la renovación de nuestro escudo.
                </p>
                <p>
                  Este año, todas las categorías del Club estrenan camiseta. No es solo un cambio de diseño. Es una señal clara de que seguimos creciendo, evolucionando y proyectándonos sin perder nuestra esencia.
                </p>
                <p>
                  Presentamos oficialmente la evolución de nuestro escudo, el que nos representa desde el año 2000 y que ahora acompañará esta nueva etapa impreso en cada camiseta. Es el mismo corazón albiverde de siempre, con más fuerza, más identidad y la convicción de todo lo que hemos construido juntos.
                </p>
                <p>
                  Cada franja verde y blanca cuenta una historia.
                  <br />
                  Cada escudo en el pecho nos recuerda quiénes somos y lo que defendemos.
                </p>
                <p>
                  Preparémonos para este 2026 como corresponde. Con compromiso, con respeto por nuestros colores y con la responsabilidad de representar al Club dentro y fuera de la cancha.
                </p>
                <p>
                  Pero que nunca se nos olvide lo más importante: el principal objetivo siempre será disfrutar. Disfrutar el fútbol, la competencia, el tercer tiempo y, sobre todo, compartir con esta linda familia albiverde que hemos formado a lo largo de los años.
                </p>
                <p className="font-semibold text-emerald-300/90">
                  La vamos a vestir con orgullo.
                  <br />
                  La vamos a defender con carácter.
                  <br />
                  La vamos a honrar jugando juntos.
                </p>
                <p>
                  Gracias a quienes hacen posible que este proyecto siga creciendo:
                </p>
                <p className="font-medium text-zinc-200">
                  A Punto
                  <br />
                  Smartycar
                  <br />
                  Actual
                  <br />
                  Varvacoa
                </p>
                <p>
                  Gracias por creer en el Club y acompañarnos un año más.
                </p>
                <p>
                  Ahora nos toca a nosotros.
                  <br />
                  Estar a la altura de esta camiseta… y de nuestro escudo.
                </p>
                <p className="pt-2 text-zinc-400">
                  Les saluda cordialmente,
                  <br />
                  <span className="not-italic font-semibold text-zinc-200">Sebastián Benavente</span>
                  <br />
                  <span className="not-italic text-zinc-200">Presidente de Maestros</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
