"use client";

import Image from "next/image";
import { useState } from "react";

export type TituloItem = {
  id: string;
  equipo: string;
  detalle: string;
  anio: number;
  esAnual: boolean;
};

const VISIBLE_INITIAL = 5;

export default function TitulosDetalleExpandable({
  titulos,
}: {
  titulos: TituloItem[];
}) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = titulos.length > VISIBLE_INITIAL;
  const visible = expanded ? titulos : titulos.slice(0, VISIBLE_INITIAL);
  const restCount = titulos.length - VISIBLE_INITIAL;

  return (
    <div className="space-y-1">
      {visible.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-2 rounded-xl bg-zinc-900/70 px-2.5 py-1"
        >
          <div className="relative flex h-4 w-4 flex-shrink-0 items-center justify-center overflow-hidden">
            <Image
              src="/copa.png"
              alt="Copa"
              fill
              sizes="36px"
              className="object-contain invert"
            />
          </div>
          <div className="flex min-w-0 flex-1 items-center justify-between gap-2 text-[10px]">
            <span className="truncate font-semibold uppercase tracking-wide text-emerald-300">
              {t.equipo}
            </span>
            <span className="flex-shrink-0 text-zinc-200">
              {t.detalle} {t.anio}{" "}
              {t.esAnual ? (
                <span className="ml-1 inline-block scale-110 text-amber-300" title="Campeón anual">
                  ★
                </span>
              ) : (
                <span className="ml-1 text-yellow-500/55">⭐</span>
              )}
            </span>
          </div>
        </div>
      ))}
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-zinc-700/80 bg-zinc-800/50 py-2 text-[11px] font-medium text-emerald-300 transition hover:bg-zinc-800/80 hover:border-emerald-500/50"
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              <span>Ver menos</span>
              <span className="rotate-180 transition-transform">▼</span>
            </>
          ) : (
            <>
              <span>Ver {restCount} más</span>
              <span className="text-emerald-400">▼</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
