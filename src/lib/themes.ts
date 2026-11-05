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
  sun: string; // amarelo (PicKup, selo do vinil, tag key)
  signalRed: string; // alerta, "últimos lotes", curtida
  lagoon: string; // azul
  lagoonDeep: string; // azul profundo (cartaz, Photo Finder, Loja)
  chrome: string; // cinza metálico (ações do post)
  greyPoster: string; // cinza chapado do cartaz
  mist: string; // claro quase branco (cartaz da loja)
  ink: string; // o mais escuro (texto sobre amber/sun/mist)
  paper: string; // branco
  fontDisplay: string; // títulos (Archivo, a mesma fonte do cabeçalho)
  fontGrotesk: string; // grotesca (Archivo)
  fontMono: string; // rótulos e números (também Archivo)
  /** Opcional: campo e tinta do cabeçalho de tom "mast" (Masthead) e o fio duplo embaixo dele (cor de cima, cor de baixo). */
  mast?: string;
  mastInk?: string;
  mastRule?: [string, string];
  /** Opcional: tema claro (campo de papel, tinta escura). Padrão: escuro. */
  colorScheme?: "light" | "dark";
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
  fontDisplay: "var(--font-archivo), 'Helvetica Neue', Arial, sans-serif",
  fontGrotesk: "var(--font-archivo), 'Helvetica Neue', Arial, sans-serif",
  fontMono: "var(--font-archivo), 'Helvetica Neue', Arial, sans-serif",
};

/*
 * DEPARTAMENTO: duas tintas (azul elétrico #0000FF e branco), papel, preto, cobalt e prata.
 * Valores de departamento-fanzone-refs/05-tokens/tokens.json. Como no protótipo da identidade,
 * a base é o tema `black` e o tema `blue` fica nas telas de assinatura (Mural e PicKup, ver brands.ts).
 * Acento = inversão, nunca cor nova: no preto o botão é azul com texto branco; no azul, branco com texto azul.
 * Sem serifa de display: fontDisplay recebe a grotesca. fontMono é a máquina de escrever do rótulo do vinil,
 * só para metadados (faixa, RPM, série, protocolo).
 * TODO oficial: Inter Tight (alvo) ainda não está em src/fonts; Archivo é o interino da pasta de identidade.
 */
const DP_GROTESK = "var(--font-archivo), 'Inter Tight', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const DP_META = DP_GROTESK; // uma fonte só em todo o site

export const departamentoTheme: ArtistTheme = {
  bg: "#101010",
  surface: "#1A1A1A",
  surfaceRaised: "#242424",
  line: "#333333",
  lineStrong: "#6B6B6B",
  text: "#FFFFFF",
  textMuted: "#B5B5B5",
  amber: "#0000FF",
  amberText: "#6B6BFF", // #0000FF como texto sobre preto mede 2,21:1
  onAmber: "#FFFFFF",
  sun: "#FFFFFF",
  signalRed: "#FFE500", // funcional, fora da marca (GAPS G-06)
  lagoon: "#6B6BFF",
  lagoonDeep: "#0034CC",
  chrome: "#C8C8C8",
  greyPoster: "#C8C8C8",
  mist: "#F0F0F0",
  ink: "#101010",
  paper: "#FFFFFF",
  fontDisplay: DP_GROTESK,
  fontGrotesk: DP_GROTESK,
  fontMono: DP_META,
};

/** Tema `blue` (campo elétrico, tinta branca): Mural e PicKup. */
export const departamentoBlueTheme: ArtistTheme = {
  ...departamentoTheme,
  bg: "#0000FF",
  surface: "#0000E0",
  surfaceRaised: "#0000C2",
  line: "#4747FF",
  lineStrong: "#9999FF",
  textMuted: "#BDBDFF",
  amber: "#FFFFFF",
  amberText: "#FFFFFF",
  onAmber: "#0000FF",
  lagoon: "#9999FF",
};

/*
 * ANITTA (era EQUILIBRIVM II): valores de anitta-fanzone-refs/05-tokens/tokens.json (o site oficial anitta.com.br).
 * O azul é o chão: o tema base (azul-painel) fica nas telas de serviço e o tema `feature` (azul-noite, céu com estrelas)
 * no Mural e no PicKup (ver brands.ts). Vermelho-carta é o acento (botão com texto branco); ouro é texto de destaque e link.
 * Uma fonte só, a do site: Averia Serif Libre (src/fonts, OFL) nos três campos de fonte.
 */
const ANITTA_SERIF = "var(--font-averia), 'Averia Serif Libre', Georgia, serif";

export const anittaTheme: ArtistTheme = {
  bg: "#20293A", // azul-painel
  surface: "#283349",
  surfaceRaised: "#303C55",
  line: "#3B4864",
  lineStrong: "#7D8BA8",
  text: "#FAF8EC", // creme
  textMuted: "#BCC4D4",
  amber: "#DD2325", // vermelho-carta
  amberText: "#EAC62E", // ouro (vermelho como texto sobre azul não passa em contraste)
  onAmber: "#FFFFFF",
  sun: "#EAC62E",
  signalRed: "#FF9A8C",
  lagoon: "#DD2325",
  lagoonDeep: "#A61D1D", // vermelho-numeral
  chrome: "#BCC4D4",
  greyPoster: "#13243F",
  mist: "#FAF8EC",
  ink: "#0A1A31", // azul-noite
  paper: "#FAF8EC",
  fontDisplay: ANITTA_SERIF,
  fontGrotesk: ANITTA_SERIF,
  fontMono: ANITTA_SERIF,
  mast: "#B22E2A", // vermelho-cabeçalho
  mastInk: "#FAF8EC",
  mastRule: ["#DEBF44", "#000000"], // fio duplo ouro/preto do site
};

/** Tema `feature` (céu azul-noite com estrelas): Mural e PicKup. */
export const anittaFeatureTheme: ArtistTheme = {
  ...anittaTheme,
  bg: "#0A1A31",
  surface: "#13243F",
  surfaceRaised: "#1C2E4D",
  line: "#2B3E60",
  lineStrong: "#7184A8",
  textMuted: "#B3BDD1",
  chrome: "#B3BDD1",
};

/*
 * VEIGH (era EVOM): valores de veigh-fanzone-refs/05-tokens/tokens.json (a loja oficial evom.art).
 * Dois tons, como a loja e a merch: preto com texto creme nas telas de serviço (base) e papel off-white com tinta vinho
 * no Mural e no PicKup (feature, tema claro). Cabeçalhos vinho com palavra creme. Duas fontes da identidade:
 * Sedgwick Ave Display (tag de spray, em minúsculas) no display e Courier Prime (máquina de escrever) no resto.
 */
const VEIGH_TAG = "var(--font-sedgwick), 'Sedgwick Ave Display', 'Arial Black', sans-serif";
const VEIGH_TYPE = "var(--font-courier-prime), 'Courier Prime', 'Courier New', monospace";

export const veighTheme: ArtistTheme = {
  bg: "#0E0B0B", // preto
  surface: "#1A1414",
  surfaceRaised: "#241C1C",
  line: "#2F2626",
  lineStrong: "#6E5F5C",
  text: "#F3EEE7", // creme
  textMuted: "#B9AEA6",
  amber: "#8E1A22", // botão no escuro (texto creme 7,8:1)
  amberText: "#D7AE98", // ouro-rose claro: link e ativo no escuro
  onAmber: "#F3EEE7",
  sun: "#D7AE98",
  signalRed: "#FF8A80",
  lagoon: "#56070C", // vinho
  lagoonDeep: "#3B0508", // vinho-escuro
  chrome: "#B9AEA6",
  greyPoster: "#0E0B0B",
  mist: "#EDEBE7", // papel
  ink: "#0E0B0B",
  paper: "#F3EEE7",
  fontDisplay: VEIGH_TAG,
  fontGrotesk: VEIGH_TYPE,
  fontMono: VEIGH_TYPE,
  mast: "#56070C",
  mastInk: "#F3EEE7",
};

/** Tema `feature` (papel off-white, tinta vinho, claro): Mural e PicKup. */
export const veighFeatureTheme: ArtistTheme = {
  ...veighTheme,
  bg: "#EDEBE7",
  surface: "#E3DFD9",
  surfaceRaised: "#D9D4CC",
  line: "#D3CEC5", // areia
  lineStrong: "#8C7F78",
  text: "#3B0508",
  textMuted: "#6B4A4C",
  amber: "#56070C",
  amberText: "#56070C",
  onAmber: "#F3EEE7",
  sun: "#56070C",
  signalRed: "#B3121F",
  chrome: "#6B4A4C",
  colorScheme: "light",
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
 * devolve um tema completo. Chaves desconhecidas são ignoradas. Sem tema
 * válido vale o `fallback` (o tema da marca do artista, ver brands.ts).
 */
export function normalizeTheme(raw: unknown, fallback: ArtistTheme = vintageTheme): ArtistTheme {
  if (!raw || typeof raw !== "object") return fallback;
  const t = raw as Partial<ArtistTheme>;
  if (!t.bg || !t.amber) return fallback;
  return { ...fallback, ...t };
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
    ...(t.mast && { "--fc-mast": t.mast, "--fc-mast-ink": t.mastInk ?? t.text }),
    ...(t.mastRule && { "--fc-mast-rule-1": t.mastRule[0], "--fc-mast-rule-2": t.mastRule[1] }),
    colorScheme: t.colorScheme ?? "dark",
  } as CSSProperties;
}
