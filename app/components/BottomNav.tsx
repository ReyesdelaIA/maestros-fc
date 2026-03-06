"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const LEFT_TABS = [
  { slug: "junior", label: "Junior", href: "/?tab=junior" },
  { slug: "senior", label: "Senior", href: "/?tab=senior" },
] as const;

const RIGHT_TABS = [
  { slug: "super-senior-futbolito", label: "SS Futbolito", href: "/?tab=super-senior-futbolito" },
  { slug: "super-senior-futbol", label: "SS Fútbol", href: "/?tab=super-senior-futbol" },
] as const;

const BAR_BG = "rgb(18,18,21)";
const PAGE_BG = "rgb(3,7,18)";

function BottomNavContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get("tab") ?? "general";
  const currentTab =
    tabParam === "junior" ||
    tabParam === "senior" ||
    tabParam === "super-senior-futbolito" ||
    tabParam === "super-senior-futbol"
      ? tabParam
      : "general";

  const activeGeneral = currentTab === "general";

  return (
    <nav
      className="fixed inset-x-0 bottom-0 flex w-full flex-col items-center overflow-visible"
      style={{
        zIndex: 9999,
        paddingBottom: "max(env(safe-area-inset-bottom), 0px)",
      }}
      aria-label="Navegación principal"
    >
      {/* Fondo sólido bajo la barra para tapar contenido al hacer scroll */}
      <div
        className="absolute inset-x-0 bottom-0 h-24"
        style={{ background: BAR_BG }}
        aria-hidden
      />

      {/* Contenedor principal */}
      <div className="relative mx-auto flex w-full max-w-4xl items-end justify-center overflow-visible">
        {/* ─── Panel izquierdo ─── */}
        <div
          className="relative flex h-[4rem] flex-1 items-stretch overflow-hidden"
          style={{
            background: BAR_BG,
            borderRadius: "1.25rem 0 0 0",
            boxShadow: "0 -1px 0 rgba(16,185,129,0.3), inset 0 1px 0 rgba(52,211,153,0.06)",
          }}
        >
          {/* Línea verde superior */}
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.5) 40%, rgba(16,185,129,0.6) 100%)",
            }}
            aria-hidden
          />
          {LEFT_TABS.map((t, idx) => {
            const active = currentTab === t.slug;
            return (
              <Link
                key={t.slug}
                href={t.href}
                className={`relative flex flex-1 flex-col items-center justify-center transition-all duration-300 ${
                  active
                    ? "text-emerald-200"
                    : "text-zinc-400 hover:text-emerald-200"
                }`}
                style={
                  active
                    ? {
                        background:
                          "linear-gradient(180deg, rgba(6,78,59,0.5) 0%, rgba(5,46,22,0.35) 100%)",
                        boxShadow: "inset 0 0 0 1px rgba(16,185,129,0.35)",
                      }
                    : undefined
                }
              >
                {idx < LEFT_TABS.length - 1 && (
                  <div
                    className="absolute right-0 top-1/2 h-8 w-px -translate-y-1/2"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent, rgba(16,185,129,0.25), transparent)",
                    }}
                    aria-hidden
                  />
                )}
                <span
                  className={`text-[10px] font-semibold tracking-wide sm:text-[11px] ${
                    active ? "drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]" : ""
                  }`}
                >
                  {t.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* ─── Zona central con notch ─── */}
        <div className="relative z-10 flex flex-shrink-0 flex-col items-center overflow-visible" style={{ width: 96 }}>
          {/* Círculo de fondo que crea el "hueco" en la barra */}
          <div
            className="absolute overflow-hidden rounded-full"
            style={{
              width: 96,
              height: 96,
              bottom: 4,
              background: PAGE_BG,
              boxShadow: `0 0 0 3px ${BAR_BG}`,
            }}
            aria-hidden
          />

          {/* Curvas conectoras izquierda */}
          <div
            className="absolute overflow-hidden"
            style={{
              width: 20,
              height: 20,
              bottom: "4rem",
              left: -1,
            }}
            aria-hidden
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                position: "absolute",
                bottom: 0,
                right: 0,
                boxShadow: `12px 12px 0 0 ${BAR_BG}`,
              }}
            />
          </div>

          {/* Curvas conectoras derecha */}
          <div
            className="absolute overflow-hidden"
            style={{
              width: 20,
              height: 20,
              bottom: "4rem",
              right: -1,
            }}
            aria-hidden
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                position: "absolute",
                bottom: 0,
                left: 0,
                boxShadow: `-12px 12px 0 0 ${BAR_BG}`,
              }}
            />
          </div>

          {/* Línea verde sobre las curvas */}
          <div
            className="absolute left-0 right-0 overflow-hidden rounded-full"
            style={{
              width: 96,
              height: 96,
              bottom: 4,
            }}
            aria-hidden
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: "inset 0 0 0 1px rgba(16,185,129,0.2)",
              }}
            />
          </div>

          {/* Botón central */}
          <Link
            href="/"
            aria-label="Temas varios"
            className={`relative z-20 mb-[12px] flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${
              activeGeneral
                ? "shadow-[0_0_0_3px_rgba(16,185,129,0.7),0_0_40px_rgba(16,185,129,0.35)]"
                : "shadow-[0_0_0_2px_rgba(82,82,91,0.5),0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_0_2px_rgba(16,185,129,0.5),0_0_24px_rgba(16,185,129,0.15)]"
            }`}
            style={{
              background: activeGeneral
                ? "linear-gradient(145deg, #10b981 0%, #059669 50%, #047857 100%)"
                : "linear-gradient(145deg, #3f3f46 0%, #27272a 60%, #18181b 100%)",
            }}
          >
            <div
              className="pointer-events-none absolute inset-x-3 top-1.5 h-[35%] rounded-full"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 100%)",
              }}
              aria-hidden
            />
            <Image
              src="/logo_maestros.png"
              alt="Maestros FC"
              width={44}
              height={44}
              className="relative z-10 h-11 w-11 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
            />
          </Link>
        </div>

        {/* ─── Panel derecho ─── */}
        <div
          className="relative flex h-[4rem] flex-1 items-stretch overflow-hidden"
          style={{
            background: BAR_BG,
            borderRadius: "0 1.25rem 0 0",
            boxShadow: "0 -1px 0 rgba(16,185,129,0.3), inset 0 1px 0 rgba(52,211,153,0.06)",
          }}
        >
          {/* Línea verde superior */}
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, rgba(16,185,129,0.6) 0%, rgba(16,185,129,0.5) 60%, transparent 100%)",
            }}
            aria-hidden
          />
          {RIGHT_TABS.map((t, idx) => {
            const active = currentTab === t.slug;
            return (
              <Link
                key={t.slug}
                href={t.href}
                className={`relative flex flex-1 flex-col items-center justify-center transition-all duration-300 ${
                  active
                    ? "text-emerald-200"
                    : "text-zinc-400 hover:text-emerald-200"
                }`}
                style={
                  active
                    ? {
                        background:
                          "linear-gradient(180deg, rgba(6,78,59,0.5) 0%, rgba(5,46,22,0.35) 100%)",
                        boxShadow: "inset 0 0 0 1px rgba(16,185,129,0.35)",
                      }
                    : undefined
                }
              >
                {idx < RIGHT_TABS.length - 1 && (
                  <div
                    className="absolute right-0 top-1/2 h-8 w-px -translate-y-1/2"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent, rgba(16,185,129,0.25), transparent)",
                    }}
                    aria-hidden
                  />
                )}
                <span
                  className={`text-[10px] font-semibold tracking-wide sm:text-[11px] ${
                    active ? "drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]" : ""
                  }`}
                >
                  {t.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function BottomNavFallback() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 flex h-16 w-full items-center justify-center border-t border-zinc-800 bg-zinc-950"
      style={{ zIndex: 9999 }}
      aria-hidden
    >
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        Junior · Senior · General · SS Futbolito · SS Fútbol
      </div>
    </nav>
  );
}

export default function BottomNav() {
  return (
    <Suspense fallback={<BottomNavFallback />}>
      <BottomNavContent />
    </Suspense>
  );
}
