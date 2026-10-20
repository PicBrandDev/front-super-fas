import type { CSSProperties } from "react";

/**
 * Tema visual de um ambiente de artista.
 * Cada fã clube define o seu; os componentes só usam as variáveis --fc-*.
 */
export type ArtistTheme = {
  paper: string; // fundo principal
  paper2: string; // fundo secundário / cards apagados
  cream: string; // superfícies claras e texto sobre fundos escuros
  ink: string; // texto e bordas
  inkSoft: string; // texto secundário (contraste ≥ 4.5:1 sobre paper)
  accent: string; // cor de ação (botões principais)
  accentFg: string; // texto sobre accent
  accent2: string; // destaque secundário
  accent3: string; // banda intermediária das listras
  deep: string; // tom profundo (placeholders, última listra)
  fontDisplay: string;
  fontBody: string;
  fontLabel: string;
};

export const vintageTheme: ArtistTheme = {
  paper: "#F2E8D5",
  paper2: "#E9DCC3",
  cream: "#FFF8EC",
  ink: "#211B16",
  inkSoft: "#5A4B3E",
  accent: "#B8461A",
  accentFg: "#FFF8EC",
  accent2: "#E0A526",
  accent3: "#D9782A",
  deep: "#6B3A1F",
  fontDisplay: "var(--font-shrikhand), Georgia, serif",
  fontBody: "var(--font-fraunces), Georgia, serif",
  fontLabel: "var(--font-space-mono), ui-monospace, monospace",
};

/** Tema padrão para ambientes recém-criados (antes do design próprio). */
export const blankTheme: ArtistTheme = {
  paper: "#F6F7F9",
  paper2: "#E6E9EE",
  cream: "#FFFFFF",
  ink: "#14171C",
  inkSoft: "#5B6370",
  accent: "#2F5BD3",
  accentFg: "#FFFFFF",
  accent2: "#9DB4F0",
  accent3: "#5F82E0",
  deep: "#1E3F9E",
  fontDisplay: "var(--font-plex-sans), system-ui, sans-serif",
  fontBody: "var(--font-plex-sans), system-ui, sans-serif",
  fontLabel: "var(--font-plex-mono), ui-monospace, monospace",
};

export function themeStyle(t: ArtistTheme): CSSProperties {
  return {
    "--fc-paper": t.paper,
    "--fc-paper-2": t.paper2,
    "--fc-cream": t.cream,
    "--fc-ink": t.ink,
    "--fc-ink-soft": t.inkSoft,
    "--fc-accent": t.accent,
    "--fc-accent-fg": t.accentFg,
    "--fc-accent-2": t.accent2,
    "--fc-accent-3": t.accent3,
    "--fc-deep": t.deep,
    "--fc-font-display": t.fontDisplay,
    "--fc-font-body": t.fontBody,
    "--fc-font-label": t.fontLabel,
  } as CSSProperties;
}
