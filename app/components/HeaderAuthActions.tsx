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
    return <div className="h-7 w-24 rounded-full bg-zinc-800/50" />;
  }

  if (!user) {
    return (
      <Link
        href="/login?next=%2F"
        className="inline-flex items-center rounded-full border border-emerald-500/50 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-500/20"
      >
        Iniciar sesión
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {isAdminEmail(user.email) && (
        <Link
          href="/admin"
          className="inline-flex items-center rounded-full border border-zinc-700/60 bg-zinc-800/40 px-2.5 py-0.5 text-[10px] font-medium text-zinc-400 transition hover:text-zinc-200"
        >
          Admin
        </Link>
      )}
    </div>
  );
}
