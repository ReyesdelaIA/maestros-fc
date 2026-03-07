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
      <button
        type="button"
        onClick={abrir}
        className="group/card flex h-full min-h-[360px] w-full cursor-pointer flex-col rounded-2xl border border-zinc-700/80 bg-gradient-to-b from-zinc-900 to-zinc-950 px-4 pt-3 pb-3 text-left shadow-xl transition active:scale-[0.99]"
      >
        <div className="flex items-center justify-between rounded-xl border border-zinc-600/60 bg-zinc-900/80 px-3 py-2.5">
          <h2 className="text-[12px] font-bold uppercase tracking-tight text-zinc-50">
            Mensaje del Presidente
          </h2>
          <span className="relative inline-flex">
            {visto ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-emerald-400/80" aria-hidden>
                <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
              </svg>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-emerald-400" aria-hidden>
                  <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
                  <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
                </svg>
                <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-zinc-950">
                  1
                </span>
              </>
            )}
          </span>
        </div>

        <div className="mt-3 mx-auto w-full max-w-[85%] overflow-hidden rounded-xl bg-black/40">
          <div className="relative h-44 w-full">
            <Image
              src="/presidente.png"
              alt="Presidente del club"
              fill
              sizes="240px"
              className="object-cover object-top transition group-hover/card:opacity-90"
              priority
            />
          </div>
        </div>

        <div className="mt-3 w-full text-center">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">
            Febrero 2026
          </p>
          <p className="mt-0.5 inline-block rounded-lg border border-amber-400/50 bg-amber-500/20 px-3 py-1 text-sm font-semibold text-zinc-50 shadow-[0_0_12px_rgba(251,191,36,0.15)]">
            Sebastián Benavente
          </p>
        </div>
      </button>

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
