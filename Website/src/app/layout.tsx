import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Omniprise — Plataforma de Marcas Gastronómicas",
  description:
    "Omniprise es un operador gastronómico creado para desarrollar, operar e integrar marcas de alto impacto en Paraguay.",
  keywords: [
    "Omniprise",
    "gastronomía",
    "Paraguay",
    "franquicia",
    "restaurantes",
    "delivery",
    "food service",
  ],
  openGraph: {
    title: "Omniprise — Plataforma de Marcas Gastronómicas",
    description:
      "Operador gastronómico con 7 marcas, 17 locales y presencia en 6 ciudades.",
    url: "https://www.omniprise.com.py",
    siteName: "Omniprise",
    locale: "es_PY",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${barlowCondensed.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
