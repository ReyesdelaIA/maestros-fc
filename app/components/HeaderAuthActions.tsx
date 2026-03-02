"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { isAdminEmail } from "../../lib/authRoles";

type BasicUser = {
  email?: string;
};

export default function HeaderAuthActions() {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<BasicUser | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      setChecking(false);
    };
    void load();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setChecking(false);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (checking) {
    return <div className="h-8 w-32 rounded-full bg-zinc-900/70" />;
  }

  if (!user) {
    return (
      <Link
        href="/login?next=%2F"
        className="inline-flex items-center rounded-full border border-sky-500/70 bg-sky-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-200 hover:bg-sky-500/30"
      >
        Iniciar sesión
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/asistencia"
        className="inline-flex items-center rounded-full border border-sky-500/70 bg-sky-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-200 hover:bg-sky-500/30"
      >
        Confirmar asistencia
      </Link>
      {isAdminEmail(user.email) && (
        <Link
          href="/admin"
          className="inline-flex items-center rounded-full border border-emerald-500/70 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300 hover:bg-emerald-500/20"
        >
          Registrar resultado
        </Link>
      )}
    </div>
  );
}

