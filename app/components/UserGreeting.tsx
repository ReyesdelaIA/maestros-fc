"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { isAdminEmail } from "../../lib/authRoles";

type BasicUser = {
  id?: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

function getDisplayName(user: BasicUser | null): string {
  if (!user) return "";
  const metadata = user.user_metadata ?? {};
  const fromMeta =
    (metadata.full_name as string | undefined) ||
    (metadata.name as string | undefined) ||
    (metadata.preferred_username as string | undefined);
  if (fromMeta && fromMeta.trim()) return fromMeta.trim();
  const email = user.email ?? "";
  return email.includes("@") ? email.split("@")[0] ?? "Maestro" : "Maestro";
}

function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

function getGreetingByHour(): { text: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Buenos días", emoji: "👋" };
  if (hour < 20) return { text: "Buenas tardes", emoji: "🤙🏻" };
  return { text: "Buenas noches", emoji: "😎" };
}

function getLastNameToken(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return "";
  return parts[parts.length - 1] ?? "";
}

function capitalizeName(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return "MF";
}

export default function UserGreeting() {
  const [user, setUser] = useState<BasicUser | null>(null);
  const [loadingOut, setLoadingOut] = useState(false);
  const [checking, setChecking] = useState(true);
  const [apodoJugador, setApodoJugador] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      setChecking(false);
    };
    void load();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setChecking(false);
      },
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const displayName = useMemo(() => getDisplayName(user), [user]);
  const firstName = useMemo(() => getFirstName(displayName), [displayName]);
  const initials = useMemo(() => getInitials(displayName), [displayName]);
  const greeting = useMemo(() => getGreetingByHour(), []);
  const aliasMeta = useMemo(() => {
    if (!user?.user_metadata) return "";
    const meta = user.user_metadata;
    const alias =
      (meta.apodo as string | undefined) ||
      (meta.nickname as string | undefined) ||
      "";
    return alias.trim();
  }, [user]);
  const nombreMostrado = capitalizeName(apodoJugador || aliasMeta || firstName);
  const isAdmin = isAdminEmail(user?.email);

  useEffect(() => {
    if (!user) return;
    const fullName = getDisplayName(user);
    const nombre = getFirstName(fullName);
    const apellidoToken = getLastNameToken(fullName);
    if (!nombre || !apellidoToken) return;

    const loadApodo = async () => {
      const { data } = await supabase
        .from("jugadores")
        .select("apodo")
        .ilike("nombre", nombre)
        .ilike("apellido", `%${apellidoToken}%`)
        .not("apodo", "is", null)
        .limit(1)
        .maybeSingle();

      const apodo = (data?.apodo as string | null | undefined)?.trim() ?? null;
      setApodoJugador(apodo || null);
    };

    void loadApodo();
  }, [user]);

  if (checking) return null;
  if (!user) {
    return (
      <Link
        href="/login?next=%2F"
        className="inline-flex items-center rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-700 transition hover:bg-zinc-200"
      >
        Iniciar sesión
      </Link>
    );
  }

  const badgeLabel = isAdmin ? "God mode" : "Jugador";

  return (
    <div className="flex w-full items-center justify-between gap-2">
      <div className="flex min-w-0 flex-1 items-center gap-2">
<div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-emerald-400 bg-emerald-600 text-[12px] font-bold text-white shadow-sm">
            {initials}
          </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-[15px] font-bold leading-none text-zinc-900">
              {greeting.text} {nombreMostrado}! {greeting.emoji}
            </p>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide ${
                isAdmin
                  ? "border border-violet-300 bg-violet-100 text-violet-700"
                  : "border border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {badgeLabel}
            </span>
          </div>
          <button
            type="button"
            disabled={loadingOut}
            onClick={async () => {
              setLoadingOut(true);
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
            className="w-fit rounded border border-zinc-300 px-1.5 py-0.5 text-[8px] text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-60"
          >
            {loadingOut ? "Saliendo..." : "Cerrar sesión"}
          </button>
        </div>
      </div>
      <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-300 bg-emerald-50 shadow-sm">
        <Image
          src="/logo_maestros.png"
          alt="Logo Maestros FC"
          fill
          sizes="44px"
          className="object-contain p-1"
        />
      </div>
    </div>
  );
}
