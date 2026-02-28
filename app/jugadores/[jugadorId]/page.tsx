import Image from "next/image";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { getPlayerPhotoSrc } from "../../../lib/playerPhotos";

type PageProps = {
  params: Promise<{
    jugadorId: string;
  }>;
};

type Jugador = {
  id: string;
  categoria: string | null;
  nombre: string;
  apodo: string | null;
  apellido: string;
  fecha_nacimiento: string | null;
  numero: number | null;
  posicion: string | null;
  posicion_2: string | null;
};

const SLUG_BY_CATEGORIA: Record<string, string> = {
  "Junior Fútbol": "junior",
  "Senior Fútbol": "senior",
  "Super Senior Futbolito": "ss-futbolito",
  "Super Senior Fútbol": "ss-martes",
};

function formatFecha(fecha: string | null): string {
  if (!fecha) return "-";
  const d = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(d.getTime())) return fecha;
  return d.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function JugadorPage({ params }: PageProps) {
  const { jugadorId } = await params;

  const { data } = await supabase
    .from("jugadores")
    .select(
      "id, categoria, nombre, apodo, apellido, fecha_nacimiento, numero, posicion, posicion_2",
    )
    .eq("id", jugadorId)
    .maybeSingle();

  const jugador = data as Jugador | null;
  const fotoSrc = jugador ? getPlayerPhotoSrc(jugador) : null;
  const backSlug = jugador?.categoria ? SLUG_BY_CATEGORIA[jugador.categoria] : null;

  if (!jugador) {
    return (
      <div className="min-h-screen bg-black text-zinc-50">
        <main className="mx-auto max-w-xl px-4 py-8">
          <Link href="/" className="text-sm text-emerald-300 hover:text-emerald-200">
            ← Volver al dashboard
          </Link>
          <p className="mt-6 text-sm text-zinc-400">Jugador no encontrado.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-50">
      <main className="mx-auto max-w-xl px-4 py-8">
        <Link
          href={backSlug ? `/equipos/${backSlug}` : "/"}
          className="text-sm text-emerald-300 hover:text-emerald-200"
        >
          ← Volver
        </Link>

        <section className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
          <div className="relative mx-auto h-44 w-44 overflow-hidden rounded-2xl bg-zinc-900">
            {fotoSrc ? (
              <Image
                src={fotoSrc}
                alt={`${jugador.nombre} ${jugador.apellido}`}
                fill
                sizes="176px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
                Foto pendiente
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <h1 className="text-xl font-bold">
              {jugador.nombre} {jugador.apellido}
            </h1>
            {jugador.apodo ? (
              <p className="text-sm italic text-amber-300">"{jugador.apodo}"</p>
            ) : null}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-zinc-900/80 p-2">
              <p className="text-[10px] uppercase text-zinc-500">Categoría</p>
              <p className="text-zinc-200">{jugador.categoria ?? "-"}</p>
            </div>
            <div className="rounded-lg bg-zinc-900/80 p-2">
              <p className="text-[10px] uppercase text-zinc-500">Dorsal</p>
              <p className="text-zinc-200">{jugador.numero ?? "-"}</p>
            </div>
            <div className="rounded-lg bg-zinc-900/80 p-2">
              <p className="text-[10px] uppercase text-zinc-500">Posición</p>
              <p className="text-zinc-200">{jugador.posicion ?? "-"}</p>
            </div>
            <div className="rounded-lg bg-zinc-900/80 p-2">
              <p className="text-[10px] uppercase text-zinc-500">Posición 2</p>
              <p className="text-zinc-200">{jugador.posicion_2 ?? "-"}</p>
            </div>
            <div className="col-span-2 rounded-lg bg-zinc-900/80 p-2">
              <p className="text-[10px] uppercase text-zinc-500">Nacimiento</p>
              <p className="text-zinc-200">{formatFecha(jugador.fecha_nacimiento)}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
