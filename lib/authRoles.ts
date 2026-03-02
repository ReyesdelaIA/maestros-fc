const FALLBACK_ADMIN_EMAILS = [
  "felipe@reyesia.com",
  "benaventelarrain@gmail.com",
  "matiascalvo15@gmail.com",
];

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const fromEnv = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .map(normalizeEmail);
  const admins = fromEnv.length > 0 ? fromEnv : FALLBACK_ADMIN_EMAILS.map(normalizeEmail);
  return admins.includes(normalizeEmail(email));
}

