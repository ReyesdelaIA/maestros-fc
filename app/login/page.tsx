"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as unknown as Record<string, unknown>).Capacitor;
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams?.get("next") ?? "/";
  const nextPath = useMemo(
    () => (nextParam.startsWith("/") ? nextParam : "/"),
    [nextParam],
  );

  const [email, setEmail] = useState("");
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) router.replace(nextPath);
    };
    void check();
  }, [nextPath, router]);

  // En la app nativa, escuchar el deep link de vuelta tras OAuth
  useEffect(() => {
    if (!isNativeApp()) return;

    let cleanup: (() => void) | undefined;

    const setup = async () => {
      try {
        const { App } = await import("@capacitor/app");
        const listener = await App.addListener("appUrlOpen", async ({ url }) => {
          if (!url.includes("login-callback")) return;

          // Cerrar el browser in-app
          try {
            const { Browser } = await import("@capacitor/browser");
            await Browser.close();
          } catch {}

          // Extraer tokens del URL (hash fragment o query params)
          const parsed = new URL(url.replace("com.maestrosfc.app://", "https://placeholder/"));

          // PKCE flow: Supabase pone el code en query params
          const code = parsed.searchParams.get("code");
          if (code) {
            const { error: exchangeError } =
              await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) {
              setError(exchangeError.message);
              setLoadingGoogle(false);
              return;
            }
            router.replace(nextPath);
            return;
          }

          // Implicit flow: tokens en hash
          const hashParams = new URLSearchParams(
            parsed.hash.startsWith("#") ? parsed.hash.slice(1) : parsed.hash,
          );
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");
          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (sessionError) {
              setError(sessionError.message);
              setLoadingGoogle(false);
              return;
            }
            router.replace(nextPath);
            return;
          }

          setError("No se pudo completar el inicio de sesión.");
          setLoadingGoogle(false);
        });
        cleanup = () => listener.remove();
      } catch {}
    };

    void setup();
    return () => cleanup?.();
  }, [nextPath, router]);

  const signInGoogle = async () => {
    setLoadingGoogle(true);
    setError(null);
    setInfo(null);

    if (isNativeApp()) {
      // Nativo: abrir browser seguro in-app (ASWebAuthenticationSession)
      const redirectTo = "com.maestrosfc.app://login-callback";
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (authError || !data.url) {
        setError(authError?.message ?? "Error al conectar con Google");
        setLoadingGoogle(false);
        return;
      }
      try {
        const { Browser } = await import("@capacitor/browser");
        await Browser.open({ url: data.url, presentationStyle: "popover" });
      } catch (e) {
        setError("No se pudo abrir el navegador de autenticación.");
        setLoadingGoogle(false);
      }
    } else {
      // Web: redirect normal
      const origin = window.location.origin;
      const redirectTo = `${origin}/login`;
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (authError) {
        setError(authError.message);
        setLoadingGoogle(false);
      }
    }
  };

  const signInEmail = async (e: FormEvent) => {
    e.preventDefault();
    setLoadingEmail(true);
    setError(null);
    setInfo(null);
    const origin = isNativeApp()
      ? "https://maestros-fc.vercel.app"
      : window.location.origin;
    const redirectTo = `${origin}/login`;
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });
    if (otpError) setError(otpError.message);
    else setInfo("Te enviamos un link de acceso a tu correo.");
    setLoadingEmail(false);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-50">
      <main
        className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 pb-10"
        style={{ paddingTop: "max(env(safe-area-inset-top), 2.75rem)" }}
      >
        <div className="mb-4 flex justify-center">
          <Image
            src="/logo_maestros.png"
            alt="Escudo Maestros FC"
            width={140}
            height={140}
            sizes="140px"
            className="h-28 w-28 object-contain sm:h-32 sm:w-32"
            priority
          />
        </div>
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-emerald-400">
            Maestros FC
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-50">
            Iniciar sesión
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Entra con Google o con link mágico por correo.
          </p>

          <button
            type="button"
            onClick={() => void signInGoogle()}
            disabled={loadingGoogle}
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-800 disabled:opacity-60"
          >
            {loadingGoogle ? "Conectando..." : "Continuar con Google"}
          </button>

          <div className="my-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-[11px] uppercase text-zinc-500">o</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          <form onSubmit={signInEmail} className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Correo
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loadingEmail}
              className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-60"
            >
              {loadingEmail ? "Enviando..." : "Enviar link de acceso"}
            </button>
          </form>

          {info && <p className="mt-3 text-xs text-emerald-300">{info}</p>}
          {error && <p className="mt-3 text-xs text-rose-300">{error}</p>}
        </section>

        <p className="mt-4 text-center text-xs text-zinc-500">
          Si ya abriste el link del correo, vuelve aquí y entrarás automáticamente.
        </p>
        <Link href="/" className="mt-2 text-center text-xs text-zinc-500 underline">
          Ir al inicio
        </Link>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-zinc-50">
          <main
            className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 pb-10"
            style={{ paddingTop: "max(env(safe-area-inset-top), 2.75rem)" }}
          >
            <section className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 shadow-xl">
              <p className="text-sm text-zinc-400">Cargando acceso...</p>
            </section>
          </main>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
