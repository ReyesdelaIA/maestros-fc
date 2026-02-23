import type { Metadata } from "next";
import { Geist, Geist_Mono, Pacifico } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pacifico = Pacifico({
  variable: "--font-pacifico",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Maestros FC",
  description:
    "Dashboard PWA de Maestros FC: resultados, posiciones y próximas fechas.",
  metadataBase: new URL("https://maestros-fc.vercel.app"),
  icons: {
    icon: "/logo_maestros.png",
    apple: "/logo_maestros.png",
  },
  openGraph: {
    title: "Maestros FC",
    description:
      "Dashboard PWA de Maestros FC: resultados, posiciones y próximas fechas.",
    url: "https://maestros-fc.vercel.app",
    siteName: "Maestros FC",
    images: [
      {
        url: "/logo_maestros.png",
        width: 512,
        height: 512,
        alt: "Escudo Maestros FC",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pacifico.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
