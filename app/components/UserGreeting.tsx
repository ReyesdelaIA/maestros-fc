"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type BasicUser = {
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

function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  if (parts.length === 1) return `${parts[0]!.slice(0, 2)}`.toUpperCase();
  return "MF";
}

export default function UserGreeting() {
  const [user, setUser] = useState<BasicUser | null>(null);
  const [loadingOut, setLoadingOut] = useState(false);
  const [checking, setChecking] = useState(true);

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
  if (checking) return null;
  if (!user) return null;

  return (
    <div className="-mt-2 rounded-2xl bg-slate-100/95 px-4 py-3 text-slate-900 shadow-md shadow-black/25">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-3xl font-extrabold tracking-tight">
            ¡Hola {firstName}! <span aria-hidden>👋</span>
          </p>
          <button
            type="button"
            disabled={loadingOut}
            onClick={async () => {
              setLoadingOut(true);
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
            className="mt-1 text-xs font-semibold text-slate-500 underline decoration-slate-400 underline-offset-2 hover:text-slate-700 disabled:opacity-60"
          >
            {loadingOut ? "Saliendo..." : "Cerrar sesión"}
          </button>
        </div>
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white shadow-[0_8px_18px_rgba(37,99,235,0.35)]">
            {initials}
          </div>
          <span className="absolute -right-1 -top-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-slate-100 bg-rose-500 px-1 text-xs font-bold leading-none text-white shadow-sm">
            10
          </span>
        </div>
      </div>
    </div>
  );
}
