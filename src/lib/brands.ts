import type { MastTone } from "@/components/fan/Masthead";
import { ANITTA_STAR, ANITTA_SUN, DEPARTAMENTO_STAR, LUDMILLA_SUN, MONO_D, MONO_D_VIEWBOX, VEIGH_GLOBE, type FilledMark } from "@/components/fan/mark-shape";
import {
  anittaFeatureTheme,
  anittaTheme,
  departamentoBlueTheme,
  departamentoTheme,
  ludmillaFeatureTheme,
  ludmillaTheme,
  veighFeatureTheme,
  veighTheme,
  vintageTheme,
  type ArtistTheme,
} from "./themes";

/**
 * Pele de cada artista: o que não cabe nas variáveis --fc-* do tema (marca, roleta,
 * nomes de marca no texto, tom das telas de assinatura). As funções do app são as
 * mesmas para todos; aqui só muda a aparência e a voz. Artista sem pele própria usa
 * a do Vintage Culture (o primeiro artista e o padrão da plataforma).
 */
export type BrandKey = "vintage" | "departamento" | "anitta" | "veigh" | "ludmilla";

/** Os cinco moldes dos cartazes do Mural (A lançamento, B assinatura, C data, D PicKup, E loja). */
export type PosterKind = "lost" | "culture" | "date" | "pick" | "store";

/**
 * Cartazes no padrão do Fanzone Artist Kit (campos A–E): o cantor só preenche os textos; as cores de cada campo
 * vêm das variáveis `--field-a` … `--field-e` (e `-ink`, `-accent`) no bloco `.fan[data-brand="x"]` do globals.css.
 * Sem as variáveis, valem as cores do Departamento (o primeiro cantor nesse padrão).
 */
export type KitPosters = {
  /** Glifo gigante do campo B (o "?" do Departamento, o "IV" da Anitta) e o tamanho dele em cqw (padrão 100). */
  glyph: string;
  glyphSize?: number;
  /** Arte oficial sem pessoa no lugar do glifo do campo B (o lustre do Veigh, em `public/`). */
  photo?: string;
  /** Linha do topo do campo B (o "João 16:33" do Veigh); sem ela, o nome do cantor. */
  kicker?: string;
  /** Linha pequena embaixo da manchete do campo B. */
  micro: string;
  /** Rodapé do campo B (crédito da assinatura). */
  legal: string;
  /** Campo D (PicKup): manchete, etiqueta e linha pequena. */
  pick: { headline: string[]; tag: string; micro: string };
  /** Manchete do cartaz da loja (campo E) a partir do nome do produto. */
  storeHeadline: (productName: string) => string[];
  /** Capa oficial do lançamento (campo A, em `public/`); sem capa, a marca na luva. */
  cover?: string;
  /**
   * Moldura de carta de tarô (Anitta): moldura no acento, numeral romano no topo, plaqueta creme com o título embaixo
   * e o nome do cantor na lateral. `[[trecho]]` na plaqueta pinta o trecho no vermelho da marca.
   */
  card?: {
    side: string;
    numerals: Record<PosterKind, string>;
    plaques: { lost: string; culture: string; pick: string };
    sides: { culture: string; pick: string };
  };
};

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
  /** Como o artista é chamado no texto: "Vintage", "Departamento", "Anitta". */
  short: string;
  /** Com artigo: "o Vintage", "a Anitta". */
  the: string;
  /** Com "de": "do Vintage", "da Anitta". */
  of: string;
  /** Marca (ornamento) do cantor: os chevrons do Vintage (traço) ou um desenho preenchido de `mark-shape.ts`. */
  mark: "chevrons" | FilledMark;
  /** Quadradinho do menu do admin; sem ele, o símbolo do Vintage ou a inicial. */
  adminMark?: { shape: FilledMark; bg: string; fg: string };
  /** Tom do topo (arte) do admin do ambiente. */
  adminMastTone: MastTone;
  /** Troca de tom dos cabeçalhos: cada tela pede um tom e a pele pode trocar (ex.: tudo vira o vermelho do cabeçalho). */
  mastTones?: Partial<Record<MastTone, MastTone>>;
  /** Fundo das telas de assinatura (`toneRoutes`): imagem repetida sobre o campo (ex.: o céu estrelado da Anitta). */
  sky?: { url: string; size: number };
  /** Roleta: o toca-discos (agulha) ou a roda de linhas com o ponteiro-estrela no topo. */
  wheel: "turntable" | "star";
  /** Roda `star`: o texto do selo do centro e o desenho dentro dele (o globo de linhas ou uma marca de `mark-shape.ts`). */
  wheelSeal?: { text: string; center: "globe" | FilledMark };
  /** Vinil (Drops, cartaz do lançamento): disco, sulcos, rótulo e a marca no rótulo; sem isso, o vinil do Vintage. */
  vinyl?: { disc: string; groove: string; grooveOpacity: number; label: string; labelInk: string };
  /** Cartazes no padrão do kit (campos A–E); sem isso, os moldes do Vintage. */
  posters?: KitPosters;
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
  the: "o Vintage",
  of: "do Vintage",
  mark: "chevrons",
  adminMastTone: "night",
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
  the: "o Departamento",
  of: "do Departamento",
  mark: DEPARTAMENTO_STAR,
  // Monograma D em azul no quadrado branco (o menu do Departamento é azul elétrico).
  adminMark: { shape: { d: MONO_D, viewBox: MONO_D_VIEWBOX, fillRule: "evenodd" }, bg: "#FFFFFF", fg: "#0000FF" },
  adminMastTone: "electric",
  // Departamento não tem campo cinza: o tom vira o campo preto (campo C), com tinta branca.
  mastTones: { "poster-grey": "night" },
  wheel: "star",
  wheelSeal: { text: "TROUBLE DANCING? · 1-800-DEPARTAMENTO ·", center: "globe" },
  // 7" cobalt chapado, sulcos em fio, rótulo branco com a estrela azul.
  vinyl: { disc: "var(--fc-lagoon-deep)", groove: "var(--fc-paper)", grooveOpacity: 0.28, label: "var(--fc-paper)", labelInk: "var(--fc-lagoon-deep)" },
  posters: {
    glyph: "?",
    micro: "1-800-Departamento",
    legal: "Worldwide 2027 ®",
    pick: { headline: ["PicKup"], tag: "Aberto", micro: "Dancing Service" },
    // Os itens se chamam `1-800-<ITEM>`; o número de serviço fica numa linha.
    storeHeadline: (name) => {
      const m = name.trim().toUpperCase().match(/^1-800-(.+)$/);
      if (!m) return ["1-800-", "Store"];
      const item = m[1].split("-").filter(Boolean);
      return ["1-800-", item[item.length - 1]];
    },
  },
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


/**
 * ANITTA (era EQUILIBRIVM II): anitta-fanzone-refs (tokens.json, DESIGN.md, VOICE.md) e o Artifact "Fanzone Anitta".
 * Um baralho de tarô sob o céu de Minas: céu azul-noite com estrelas no Mural e no PicKup, azul-painel nas telas de
 * serviço com cabeçalho vermelho e fio ouro/preto, cartazes em cartas de moldura vermelha, Averia Serif Libre em tudo.
 * Proibido: foto da artista (a pasta não tem fotos de pessoas), ilustração das cartas do site, entidades e pontos riscados.
 */
const anitta: ArtistBrand = {
  key: "anitta",
  theme: anittaTheme,
  toneTheme: anittaFeatureTheme,
  toneRoutes: ["/mural", "/pickup"],
  adminTheme: null,
  themeColor: "#0A1A31",
  phone: true,
  short: "Anitta",
  the: "a Anitta",
  of: "da Anitta",
  mark: ANITTA_STAR,
  // TODO oficial: sem logo oficial (GAPS A-03), o menu do admin leva a estrela ouro no quadrado azul-noite (o ícone do app).
  adminMark: { shape: ANITTA_STAR, bg: "#0A1A31", fg: "#EAC62E" },
  adminMastTone: "mast",
  // Todo cabeçalho de tela de serviço é vermelho com fio ouro/preto; o Mural e o Início ficam no céu ("sky").
  mastTones: { night: "mast", amber: "mast", sun: "mast", "lagoon-deep": "mast", "poster-grey": "mast" },
  sky: { url: "/media/anitta/ceu.svg", size: 340 },
  wheel: "star",
  wheelSeal: { text: "RODA DA FORTUNA · EQUILIBRIVM II · ANITTA ·", center: ANITTA_SUN },
  vinyl: { disc: "var(--fc-ink)", groove: "var(--fc-line-strong)", grooveOpacity: 0.55, label: "var(--fc-amber)", labelInk: "var(--fc-sun)" },
  store: { name: "Anitta Shop", word: "Anitta", mastTone: "mast", pickupPlace: "lojinha da Anitta" },
  // [P] fora da pasta de identidade: a hashtag e os nomes do ranking seguem o padrão dos outros cantores (GAPS).
  superFan: "Fã Super da Anitta",
  hyperFans: "HyperFans da Anitta",
  hashtag: "EuSouUmSuperFaDaAnitta",
  motto: ["Fé e", "festa"],
  mottoText: "Fé e festa. Esse é o EQUILIBRIVM.",
  pickup: {
    screen: "text-fg", // sem fundo próprio: o céu estrelado do FanFrame aparece atrás da roda
    mastTone: "mast",
    lead: "Gira a roleta e concorre a brinde da fanzone.",
    sub: "text-fg-muted",
    list: "divide-line border-line text-fg",
    listDate: "text-fg-muted",
    outline: "border-fg text-fg",
    keyIdle: "Girar a roleta",
    keyBusy: "Girando",
    pointer: "a estrela",
  },
  posters: {
    glyph: "IV",
    glyphSize: 62,
    micro: "EQUILIBRIVM",
    legal: "Anitta · 2026",
    pick: { headline: ["PicKup"], tag: "Aberto", micro: "Fé e festa" },
    // "EQUILIBRIVM SUN T-SHIRT" → SUN / T-SHIRT (o nome da era fica fora da manchete).
    storeHeadline: (name) => {
      const words = name.trim().split(/\s+/).filter((w) => !/^equilibrivm$/i.test(w));
      if (!words.length) return ["Anitta", "Shop"];
      return words.length > 2 ? [words.slice(0, -1).join(" "), words[words.length - 1]] : words;
    },
    cover: "/media/anitta/capa-equilibrivm-ii.jpg",
    card: {
      side: "Anitta",
      // II o volume II · IV o IV vermelho do logo · XXI o Mundo (a turnê) · X a Roda da Fortuna · XIX o Sol (a camiseta SUN)
      numerals: { lost: "II", culture: "IV", date: "XXI", pick: "X", store: "XIX" },
      plaques: { lost: "Equilibrivm [[II]]", culture: "Fé e festa", pick: "Roda da Fortuna" },
      sides: { culture: "Ato II", pick: "PicKup" },
    },
  },
};

/**
 * VEIGH (era EVOM): veigh-fanzone-refs (tokens.json, DESIGN.md, VOICE.md) e o Artifact "Fanzone Veigh".
 * A loja evom.art em forma de app: papel off-white com tinta vinho no Mural e no PicKup, preto com texto creme nas telas
 * de serviço, cabeçalhos vinho, tag de spray em minúsculas (Sedgwick Ave Display) e máquina de escrever (Courier Prime),
 * raio 0, sem sombra, sem grão, sem gradiente. Ornamento: o globo-lustre com cruz.
 * Proibido: foto do artista (a pasta não tem fotos de pessoas), redesenhar o logo "evom", palavrão e letra explícita.
 */
const veigh: ArtistBrand = {
  key: "veigh",
  theme: veighTheme,
  toneTheme: veighFeatureTheme,
  toneRoutes: ["/mural", "/pickup"],
  adminTheme: null,
  themeColor: "#0E0B0B",
  phone: true,
  short: "Veigh",
  the: "o Veigh",
  of: "do Veigh",
  mark: VEIGH_GLOBE,
  // TODO oficial: o menu do admin leva o globo-lustre vinho no quadrado papel (o ícone do app, 00-brand/icons).
  adminMark: { shape: VEIGH_GLOBE, bg: "#EDEBE7", fg: "#56070C" },
  adminMastTone: "mast",
  // Cabeçalhos vinho com a palavra creme em toda tela de serviço; o Mural e o Início ficam no campo ("sky").
  mastTones: { night: "mast", amber: "mast", sun: "mast", "lagoon-deep": "mast", "poster-grey": "mast" },
  wheel: "star",
  wheelSeal: { text: "EU VENCI O MUNDO · EVOM · VEIGH ·", center: VEIGH_GLOBE },
  // Disco preto, sulcos em fio, rótulo vinho com o globo em ouro-rose (tokens.json > roles.disc*).
  vinyl: { disc: "#0E0B0B", groove: "#2F2626", grooveOpacity: 1, label: "#56070C", labelInk: "#D7AE98" },
  store: { name: "EVOM Merch", word: "EVOM Merch", mastTone: "mast", pickupPlace: "lojinha do Veigh" },
  // [P] fora da pasta de identidade: a hashtag e os nomes do ranking seguem o padrão dos outros cantores (GAPS).
  superFan: "Fã Super do Veigh",
  hyperFans: "HyperFans do Veigh",
  hashtag: "EuSouUmSuperFaDoVeigh",
  motto: ["Eu venci", "o mundo"],
  // Fala real do Veigh (VOICE.md, S21).
  mottoText: "\"Eu venci o mundo. Só de pronunciar isso já te traz uma força e uma vontade de vencer absurda assim.\"",
  pickup: {
    screen: "text-fg", // sem fundo próprio: o papel do tema de tom aparece atrás da roda
    mastTone: "mast",
    lead: "Gira a roleta e concorre a brinde da fanzone, rapaziada.",
    sub: "text-fg-muted",
    list: "divide-line border-line text-fg",
    listDate: "text-fg-muted",
    outline: "border-fg text-fg",
    keyIdle: "Girar a roleta",
    keyBusy: "Girando",
    pointer: "o globo",
  },
  posters: {
    glyph: "evom",
    photo: "/media/veigh/lustre-evom.png",
    kicker: "João 16:33",
    micro: "Supernova Ent.",
    legal: "Veigh · 2025",
    pick: { headline: ["PicKup"], tag: "Aberto", micro: "Hora certa" },
    // "Blusa de Moletom Hoodie EVOM Vinho - Veigh Merch Oficial" → MOLETOM / EVOM (sem o sufixo da loja, o tipo e a cor).
    storeHeadline: (name) => {
      const words = name
        .split(" - ")[0]
        .trim()
        .split(/\s+/)
        .filter((w) => w && !/^(blusa|de|hoodie|vinho|preta|preto|branca|branco)$/i.test(w));
      if (!words.length) return ["EVOM", "Merch"];
      return words.length > 2 ? [words.slice(0, -1).join(" "), words[words.length - 1]] : words;
    },
    cover: "/media/veigh/evom-logo-branco.png",
  },
};

/**
 * LUDMILLA (era Numanice): Ludmila-fanzone-refs (05-tokens, VOICE.md) e o Artifact "Fanzone Ludmilla" (packs/ludmilla).
 * Uma noite de Numanice: roxo do sunset na base, neon rosa, sol amarelo; Mural, Família (Comunidade) e Loja no papel das
 * capas, cabeçalhos em papel com tinta roxa e o PicKup no amarelo. Voz carioca de igual para igual ("família", "numa nice",
 * "Deu bom", "Hoje não."), sem emoji e sem "diva". Ornamento: o sol de raios (TODO oficial).
 * Sem foto da artista (política da pasta de identidade): o Início e o Mural usam cartazes de tipo e as capas desenhadas.
 */
const ludmilla: ArtistBrand = {
  key: "ludmilla",
  theme: ludmillaTheme,
  toneTheme: ludmillaFeatureTheme,
  toneRoutes: ["/mural", "/comunidade", "/loja"],
  adminTheme: null,
  themeColor: "#3A0F4A",
  phone: true,
  short: "Lud",
  the: "a Lud",
  of: "da Lud",
  mark: LUDMILLA_SUN,
  // TODO oficial: sem assinatura em vetor (GAPS G-01), o menu do admin leva o sol amarelo no quadrado roxo.
  adminMark: { shape: LUDMILLA_SUN, bg: "#3A0F4A", fg: "#F8D808" },
  adminMastTone: "mast",
  // Todo cabeçalho em papel com tinta roxa (decisão "menos roxo"); o PicKup fica no sol amarelo.
  mastTones: { night: "mast", sky: "mast", amber: "mast", "lagoon-deep": "mast", "poster-grey": "mast" },
  wheel: "star",
  wheelSeal: { text: "TÁ TUDO NUMA NICE · FANZONE DA LUD · ", center: LUDMILLA_SUN },
  // Disco roxo-claro, sulcos no roxo da base, rótulo amarelo com o sol roxo (pack > roles.disc*).
  vinyl: { disc: "#681898", groove: "#3A0F4A", grooveOpacity: 1, label: "#F8D808", labelInk: "#3A0F4A" },
  store: { name: "Loja da Lud", word: "loja da lud", mastTone: "mast", pickupPlace: "lojinha da Lud" },
  // [P] fora da pasta de identidade: a hashtag e os nomes do ranking seguem o padrão dos outros cantores (GAPS).
  superFan: "Fã Super da Lud",
  hyperFans: "HyperFans da Lud",
  hashtag: "EuSouUmSuperFaDaLud",
  motto: ["Numa", "nice"],
  // Fala real da Ludmilla (VOICE.md; Billboard Brasil, 26/07/2025).
  mottoText: "\"O Numanice começou como um sonho e virou um movimento.\"",
  pickup: {
    screen: "bg-sun text-ink",
    mastTone: "sun",
    lead: "Gira a roleta e deixa o brinde vir. Tudo numa nice.",
    sub: "text-ink/75",
    list: "divide-ink/25 border-ink/25 text-ink",
    listDate: "text-ink/70",
    outline: "border-ink text-ink",
    keyIdle: "Girar a roleta",
    keyBusy: "Girando",
    pointer: "o sol",
  },
  posters: {
    glyph: "Lud",
    glyphSize: 70,
    kicker: "Numanice",
    micro: "Pagode de domingo",
    legal: "Ludmilla · Numanice · Ao vivo",
    pick: { headline: ["PicKup"], tag: "Aberto", micro: "Tudo numa nice" },
    // "Quadrado Caramelo" → ÓCULOS / CARAMELO (a coleção Chilli Beans × Ludmilla é toda de óculos).
    storeHeadline: (name) => {
      const words = name.trim().split(/\s+/).filter(Boolean);
      return ["Óculos", words[words.length - 1] ?? "da Lud"];
    },
    cover: "/media/ludmilla/capa-bi-festinha.svg",
  },
};

const BRANDS: Record<BrandKey, ArtistBrand> = { vintage, departamento, anitta, veigh, ludmilla };

/** Slug do ambiente (como o admin master criou) → pele. Slug fora daqui usa a pele do Vintage. */
const BY_SLUG: Record<string, BrandKey> = { departamento: "departamento", anitta: "anitta", veigh: "veigh", ludmilla: "ludmilla" };

export const brandKeyFor = (slug: string): BrandKey => BY_SLUG[slug] ?? "vintage";
export const brandFor = (slug: string): ArtistBrand => BRANDS[brandKeyFor(slug)];
export const brandByKey = (key: BrandKey): ArtistBrand => BRANDS[key];

/** A tela atual é de assinatura (usa o `toneTheme`)? */
export function usesTone(brand: ArtistBrand, pathname: string, base: string) {
  if (!brand.toneTheme) return false;
  return brand.toneRoutes.some((r) => pathname === base + r || pathname.startsWith(`${base + r}/`));
}
