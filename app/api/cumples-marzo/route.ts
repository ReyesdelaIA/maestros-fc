import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/** GET /api/cumples-marzo - Jugadores con cumpleaños entre 15 y 30 de marzo */
export async function GET() {
  const { data, error } = await supabase
    .from("jugadores")
    .select("id, categoria, nombre, apodo, apellido, fecha_nacimiento")
    .not("fecha_nacimiento", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const mar15 = 315; // 3*100 + 15
  const mar30 = 330;

  const cumples = (data ?? []).filter((j) => {
    const f = j.fecha_nacimiento as string;
    const m = f?.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return false;
    const [, , mm, dd] = m;
    if (mm !== "03") return false;
    const md = parseInt(mm, 10) * 100 + parseInt(dd, 10);
    return md >= mar15 && md <= mar30;
  });

  cumples.sort((a, b) => {
    const dayA = parseInt((a.fecha_nacimiento as string).slice(8, 10), 10);
    const dayB = parseInt((b.fecha_nacimiento as string).slice(8, 10), 10);
    return dayA - dayB;
  });

  return NextResponse.json({ cumples, total: cumples.length });
}
