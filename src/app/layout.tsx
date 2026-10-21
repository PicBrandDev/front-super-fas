import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { CSSProperties } from "react";
import { platform } from "@/lib/platform";
import "./globals.css";

// Fontes hospedadas no próprio projeto (licença OFL, arquivos em src/fonts).
const fraunces = localFont({
  src: [{ path: "../fonts/fraunces-latin-opsz-normal.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-fraunces",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

const shrikhand = localFont({
  src: [{ path: "../fonts/shrikhand-latin-400-normal.woff2", weight: "400", style: "normal" }],
  variable: "--font-shrikhand",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

const spaceMono = localFont({
  src: [
    { path: "../fonts/space-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/space-mono-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-space-mono",
  display: "swap",
  fallback: ["ui-monospace", "monospace"],
});

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
  themeColor: "#211B16",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${shrikhand.variable} ${spaceMono.variable} ${plexSans.variable} ${plexMono.variable}`}
      style={brandStyle}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
