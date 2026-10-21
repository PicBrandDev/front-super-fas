import type { CSSProperties } from "react";

/**
 * Tema visual de um ambiente de artista (sistema "Night" do protótipo fanzone).
 * Cada fã clube define o seu; os componentes só usam as variáveis --fc-*
 * (via tokens do Tailwind: bg-night, text-fg, bg-amber, font-grotesk...).
 *
 * Regras do sistema: plano e angular (fios 1px, cantos 2px, sem sombra, sem
 * glow, sem gradiente); cor com economia (só o estado que importa leva cor);
 * tipografia como imagem (serifa pesada ou grotesca caixa alta cortada pela borda).
 */
export type ArtistTheme = {
  bg: string; // fundo da tela
  surface: string; // campos, folhas (sheet)
  surfaceRaised: string; // superfície elevada, lâmina de evento passado
  line: string; // fio 1px padrão
  lineStrong: string; // fio forte (bordas de tag, avatar, input)
  text: string; // texto principal
  textMuted: string; // texto secundário (≥ 4.5:1 sobre bg)
  amber: string; // acento assinatura (botão primário, ativo)
  amberText: string; // acento usado como texto (contraste sobre bg)
  onAmber: string; // texto sobre amber/sun
  sun: string; // amarelo (PicKap, selo do vinil, tag key)
  signalRed: string; // alerta, "últimos lotes", curtida
  lagoon: string; // azul
  lagoonDeep: string; // azul profundo (cartaz, Photo Finder, Loja)
  chrome: string; // cinza metálico (ações do post)
  greyPoster: string; // cinza chapado do cartaz
  mist: string; // claro quase branco (cartaz da loja)
  ink: string; // o mais escuro (texto sobre amber/sun/mist)
  paper: string; // branco
  fontDisplay: string; // serifa pesada (Playfair Display)
  fontGrotesk: string; // grotesca (Archivo)
  fontMono: string; // mono (DM Mono)
};

export const vintageTheme: ArtistTheme = {
  bg: "#120907",
  surface: "#1C1311",
  surfaceRaised: "#281D19",
  line: "#3A2E29",
  lineStrong: "#8A7B73",
  text: "#F6F1EC",
  textMuted: "#B8AAA1",
  amber: "#FE9900",
  amberText: "#FE9900",
  onAmber: "#120907",
  sun: "#FCCA0B",
  signalRed: "#E5574D",
  lagoon: "#4391B8",
  lagoonDeep: "#29495D",
  chrome: "#8C9898",
  greyPoster: "#9E9E9E",
  mist: "#E5E5E8",
  ink: "#120907",
  paper: "#FFFFFF",
  fontDisplay: "var(--font-playfair), 'Bodoni MT', Didot, Georgia, serif",
  fontGrotesk: "var(--font-archivo), 'Helvetica Neue', Arial, sans-serif",
  fontMono: "var(--font-dm-mono), ui-monospace, 'SF Mono', Menlo, monospace",
};

/** Tema padrão para ambientes recém-criados (antes do design próprio): neutro, escuro. */
export const blankTheme: ArtistTheme = {
  bg: "#121214",
  surface: "#1B1B1F",
  surfaceRaised: "#26262C",
  line: "#35353C",
  lineStrong: "#86868F",
  text: "#F4F4F6",
  textMuted: "#B3B3BC",
  amber: "#5B8CFF",
  amberText: "#8FB0FF",
  onAmber: "#121214",
  sun: "#9DB4F0",
  signalRed: "#E5574D",
  lagoon: "#4391B8",
  lagoonDeep: "#29495D",
  chrome: "#8C9898",
  greyPoster: "#9E9E9E",
  mist: "#E5E5E8",
  ink: "#121214",
  paper: "#FFFFFF",
  fontDisplay: vintageTheme.fontDisplay,
  fontGrotesk: vintageTheme.fontGrotesk,
  fontMono: vintageTheme.fontMono,
};

/**
 * Aceita o tema como vier da API (chaves do formato antigo ou parcial) e
 * devolve um tema completo. Chaves desconhecidas são ignoradas.
 */
export function normalizeTheme(raw: unknown): ArtistTheme {
  if (!raw || typeof raw !== "object") return vintageTheme;
  const t = raw as Partial<ArtistTheme>;
  if (!t.bg || !t.amber) return vintageTheme;
  return { ...vintageTheme, ...t };
}

export function themeStyle(t: ArtistTheme): CSSProperties {
  return {
    "--fc-bg": t.bg,
    "--fc-surface": t.surface,
    "--fc-raised": t.surfaceRaised,
    "--fc-line": t.line,
    "--fc-line-strong": t.lineStrong,
    "--fc-fg": t.text,
    "--fc-fg-muted": t.textMuted,
    "--fc-amber": t.amber,
    "--fc-amber-text": t.amberText,
    "--fc-on-amber": t.onAmber,
    "--fc-sun": t.sun,
    "--fc-signal": t.signalRed,
    "--fc-lagoon": t.lagoon,
    "--fc-lagoon-deep": t.lagoonDeep,
    "--fc-chrome": t.chrome,
    "--fc-poster-grey": t.greyPoster,
    "--fc-mist": t.mist,
    "--fc-ink": t.ink,
    "--fc-paper": t.paper,
    "--fc-font-display": t.fontDisplay,
    "--fc-font-grotesk": t.fontGrotesk,
    "--fc-font-mono": t.fontMono,
    colorScheme: "dark",
  } as CSSProperties;
}
