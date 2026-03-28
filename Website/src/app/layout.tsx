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
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Omniprise — Plataforma de Marcas Gastronómicas",
    description:
      "Operador gastronómico con 7 marcas, 17 locales y presencia en 6 ciudades.",
    url: "https://www.omniprise.com.py",
    siteName: "Omniprise",
    locale: "es_PY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Omniprise — Plataforma de Marcas Gastronómicas",
    description:
      "Operador gastronómico con 7 marcas, 17 locales y presencia en 6 ciudades en Paraguay.",
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
