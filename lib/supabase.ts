import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // En desarrollo es útil fallar rápido si faltan variables.
  throw new Error(
    "Faltan variables de entorno de Supabase. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local"
  );
}

declare global {
  // Evita recrear el cliente en hot-reloads durante el desarrollo.
  // eslint-disable-next-line no-var
  var supabaseClient: SupabaseClient | undefined;
}

let client: SupabaseClient;

if (typeof globalThis.supabaseClient === "undefined") {
  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
  globalThis.supabaseClient = client;
} else {
  client = globalThis.supabaseClient;
}

export const supabase = client;

