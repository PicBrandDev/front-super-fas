import type { MastTone } from "@/components/fan/Masthead";
import { departamentoBlueTheme, departamentoTheme, vintageTheme, type ArtistTheme } from "./themes";

/**
 * Pele de cada artista: o que não cabe nas variáveis --fc-* do tema (marca, roleta,
 * nomes de marca no texto, tom das telas de assinatura). As funções do app são as
 * mesmas para todos; aqui só muda a aparência e a voz. Artista sem pele própria usa
 * a do Vintage Culture (o primeiro artista e o padrão da plataforma).
 */
export type BrandKey = "vintage" | "departamento";

export type ArtistBrand = {
  key: BrandKey;
  /** Tema do ambiente quando a API não manda um no formato novo. */
  theme: ArtistTheme;
  /** Tema das telas de assinatura (`toneRoutes`, relativos ao ambiente); null = o tema do ambiente em tudo. */
  toneTheme: ArtistTheme | null;
  toneRoutes: string[];
  /** Tema do painel do ambiente (admin), quando o do fã não serve para os botões do painel. */
  adminTheme: ArtistTheme | null;
  /** Cor da barra do navegador no celular. */
  themeColor: string;
  /** No computador, a área do fã fica numa coluna de celular (430 px) com o topo e o menu de baixo, sem o menu lateral (hoje todos os cantores). */
  phone?: boolean;
  /** Como o artista é chamado no texto: "o Vintage", "o Departamento". */
  short: string;
  /** Roleta: o toca-discos (agulha) ou a roda de linhas com o ponteiro-estrela no topo. */
  wheel: "turntable" | "star";
  store: {
    /** Nome da loja no menu, no Início e no cabeçalho. */
    name: string;
    /** Palavra cortada no cabeçalho da Loja. */
    word: string;
    mastTone: MastTone;
    /** Onde se retira o pedido no show. */
    pickupPlace: string;
  };
  /** Ranking de compartilhamentos no Instagram. */
  superFan: string;
  hyperFans: string;
  hashtag: string;
  /** Assinatura da marca no cartaz de abertura (uma linha por item). */
  motto: string[];
  mottoText: string;
  pickup: {
    screen: string;
    mastTone: MastTone;
    lead: string;
    sub: string;
    list: string;
    listDate: string;
    outline: string;
    keyIdle: string;
    keyBusy: string;
    /** O que aponta o prêmio ("a agulha", "a estrela"). */
    pointer: string;
  };
};

const vintage: ArtistBrand = {
  key: "vintage",
  theme: vintageTheme,
  toneTheme: null,
  toneRoutes: [],
  adminTheme: null,
  themeColor: "#120907",
  phone: true,
  short: "Vintage",
  wheel: "turntable",
  store: { name: "Loja Vintage", word: "Vintage", mastTone: "lagoon-deep", pickupPlace: "lojinha do Vintage" },
  superFan: "Fã Super do Vintage",
  hyperFans: "HyperFans do Vintage",
  hashtag: "EuSouUmSuperFaDoVintage",
  motto: ["Culture", "is", "the", "answer"],
  mottoText: "Culture is the answer.",
  pickup: {
    screen: "bg-sun text-ink",
    mastTone: "sun",
    lead: "Solte a agulha e concorra a brindes da fanzone.",
    sub: "text-on-amber/75",
    list: "divide-on-amber/25 border-on-amber/25 text-on-amber",
    listDate: "text-on-amber/70",
    outline: "border-on-amber text-on-amber",
    keyIdle: "Girar o disco",
    keyBusy: "Tocando",
    pointer: "a agulha",
  },
};

/** DEPARTAMENTO: departamento-fanzone-refs (tokens.json, DESIGN.md, VOICE.md) e o protótipo da identidade. */
const departamento: ArtistBrand = {
  key: "departamento",
  theme: departamentoTheme,
  toneTheme: departamentoBlueTheme,
  toneRoutes: ["/mural", "/drops", "/pickup"],
  // No painel o acento vira branco: botão branco com texto escuro (azul sobre preto não passa em contraste).
  adminTheme: { ...departamentoTheme, amber: "#FFFFFF", amberText: "#FFFFFF", onAmber: "#0000FF" },
  themeColor: "#101010",
  phone: true,
  short: "Departamento",
  wheel: "star",
  store: { name: "Loja Trouble Dancing?", word: "Trouble Dancing?", mastTone: "night", pickupPlace: "lojinha do Departamento" },
  superFan: "Fã Super do Departamento",
  hyperFans: "HyperFans do Departamento",
  hashtag: "EuSouUmSuperFaDoDepartamento",
  motto: ["Trouble", "Dancing?"],
  mottoText: "TROUBLE DANCING? 1-800-DEPARTAMENTO.",
  pickup: {
    screen: "bg-night text-fg",
    mastTone: "lagoon-deep",
    lead: "Gire a roleta e concorra a brindes da fanzone.",
    sub: "text-fg-muted",
    list: "divide-line border-line text-fg",
    listDate: "text-fg-muted",
    outline: "border-fg text-fg",
    keyIdle: "Girar a roleta",
    keyBusy: "Girando",
    pointer: "a estrela",
  },
};

const BRANDS: Record<BrandKey, ArtistBrand> = { vintage, departamento };

const BY_SLUG: Record<string, BrandKey> = { departamento: "departamento" };

export const brandKeyFor = (slug: string): BrandKey => BY_SLUG[slug] ?? "vintage";
export const brandFor = (slug: string): ArtistBrand => BRANDS[brandKeyFor(slug)];
export const brandByKey = (key: BrandKey): ArtistBrand => BRANDS[key];

/** A tela atual é de assinatura (usa o `toneTheme`)? */
export function usesTone(brand: ArtistBrand, pathname: string, base: string) {
  if (!brand.toneTheme) return false;
  return brand.toneRoutes.some((r) => pathname === base + r || pathname.startsWith(`${base + r}/`));
}
