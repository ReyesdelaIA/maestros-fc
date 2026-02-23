# Desplegar Maestros FC en Vercel

## 1. Conectar el repositorio

1. Entra a **[vercel.com](https://vercel.com)** e inicia sesión (con GitHub).
2. Click en **Add New…** → **Project**.
3. Importa el repo **ReyesdelaIA/maestros-fc** (conectar con GitHub si hace falta).
4. Vercel detectará Next.js; no cambies **Framework Preset** ni **Root Directory**.

## 2. Variables de entorno (obligatorias)

Antes de hacer **Deploy**, en la misma pantalla añade:

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | La URL de tu proyecto Supabase (ej. `https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | La clave anon/public de Supabase (Project Settings → API) |

Sin estas dos variables el build fallará porque la app las usa para conectar con Supabase.

## 3. Deploy

- Click en **Deploy**.
- Espera a que termine el build; te dará una URL tipo `maestros-fc-xxx.vercel.app`.
- Opcional: en **Settings → Domains** puedes agregar un dominio propio.

## 4. Siguientes despliegues

Cada `git push` a la rama que conectaste (p. ej. `main`) generará un nuevo deploy automático.
