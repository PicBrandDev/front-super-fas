import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { CSSProperties } from "react";
import { platform } from "@/lib/platform";
import "./globals.css";

// Fontes hospedadas no próprio projeto (licença OFL, arquivos em src/fonts).
// Uma fonte só em todo o site (fã, admin e plataforma): Archivo, a mesma do cabeçalho. Exceção: a fonte de pele do cantor (abaixo).
const archivo = localFont({
  src: [{ path: "../fonts/archivo-latin-wght-normal.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-archivo",
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

// Fontes de pele: um cantor pode ter a fonte (ou o par display + texto) da identidade dele. Sem preload: só baixa
// onde o tema do cantor usa a variável. Averia Serif Libre = Anitta (a fonte do site oficial);
// Sedgwick Ave Display (tag de spray) + Courier Prime (máquina de escrever da evom.art) = Veigh.
const averia = localFont({
  src: [
    { path: "../fonts/averia-serif-libre-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/averia-serif-libre-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/averia-serif-libre-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-averia",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "serif"],
});
const sedgwick = localFont({
  src: [{ path: "../fonts/sedgwick-ave-display-latin-400-normal.woff2", weight: "400", style: "normal" }],
  variable: "--font-sedgwick",
  display: "swap",
  preload: false,
  fallback: ["Arial Black", "sans-serif"],
});
const courierPrime = localFont({
  src: [
    { path: "../fonts/courier-prime-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/courier-prime-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/courier-prime-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-courier-prime",
  display: "swap",
  preload: false,
  fallback: ["Courier New", "monospace"],
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
      className={`${archivo.variable} ${averia.variable} ${sedgwick.variable} ${courierPrime.variable}`}
      style={brandStyle}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
