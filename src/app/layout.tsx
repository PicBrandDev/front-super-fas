import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { CSSProperties } from "react";
import { platform } from "@/lib/platform";
import "./globals.css";

// Fontes hospedadas no próprio projeto (licença OFL, arquivos em src/fonts).
// Fã clube: Playfair Display (serifa pesada), Archivo (grotesca), DM Mono (mono).
const playfair = localFont({
  src: [
    { path: "../fonts/playfair-display-latin-wght-normal.woff2", weight: "400 900", style: "normal" },
    { path: "../fonts/playfair-display-latin-wght-italic.woff2", weight: "400 900", style: "italic" },
  ],
  variable: "--font-playfair",
  display: "swap",
  fallback: ["Bodoni MT", "Didot", "Georgia", "serif"],
});

const archivo = localFont({
  src: [{ path: "../fonts/archivo-latin-wght-normal.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-archivo",
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

const dmMono = localFont({
  src: [
    { path: "../fonts/dm-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/dm-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-dm-mono",
  display: "swap",
  fallback: ["ui-monospace", "SF Mono", "Menlo", "monospace"],
});

// Painéis (white label): IBM Plex.
const plexSans = localFont({
  src: [
    { path: "../fonts/ibm-plex-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/ibm-plex-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/ibm-plex-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/ibm-plex-sans-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-plex-sans",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const plexMono = localFont({
  src: [
    { path: "../fonts/ibm-plex-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/ibm-plex-mono-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-plex-mono",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});

export const metadata: Metadata = {
  title: {
    default: platform.name,
    template: `%s · ${platform.name}`,
  },
  description: platform.description,
};

// Cor da plataforma (white label); sem configuração fica o azul padrão do globals.css.
const brandStyle = platform.color ? ({ "--pf-brand": platform.color } as CSSProperties) : undefined;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#120907",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${playfair.variable} ${archivo.variable} ${dmMono.variable} ${plexSans.variable} ${plexMono.variable}`}
      style={brandStyle}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
