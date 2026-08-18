import { Barlow_Condensed, Inter } from "next/font/google";
import { ReducedMotionProvider } from "@/components/ReducedMotionProvider";
import { getLocale } from "next-intl/server";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${barlowCondensed.variable} ${inter.variable}`}>
      <body>
        <ReducedMotionProvider>
          {children}
        </ReducedMotionProvider>
      </body>
    </html>
  );
}
