import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { CSSProperties } from "react";
import { platform } from "@/lib/platform";
import "./globals.css";

// Fontes hospedadas no próprio projeto (licença OFL, arquivos em src/fonts).
// Uma fonte só em todo o site (fã, admin e plataforma): Archivo, a mesma do cabeçalho.
const archivo = localFont({
  src: [{ path: "../fonts/archivo-latin-wght-normal.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-archivo",
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
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
      className={archivo.variable}
      style={brandStyle}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
