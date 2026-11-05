/**
 * Mídia do ambiente de cada artista (fotos, produtos).
 *
 * A API ainda não devolve imagens, então o front guarda aqui os arquivos de
 * cada artista (em public/media/<slug>/) e escolhe a foto certa para cada
 * lugar. Quando a API passar a mandar `image`, ela tem prioridade.
 */
import type { MediaImage, Post, Product } from "./types";

export type { MediaImage };

export type ArtistMedia = {
  /** Foto do artista para o cartaz "Culture is the answer" e para o Início (null: o artista não usa foto). */
  hero: MediaImage | null;
  /** Fotos de imprensa para posts com imagem, Drop News e Photo Finder. */
  press: MediaImage[];
  /** Produtos por id da API/mock e, em fallback, por palavra do nome. */
  products: Record<string, MediaImage>;
  /** Ordem usada quando o produto não bate com nenhum id nem palavra. */
  productFallback: MediaImage[];
};

const vc = (file: string) => `/media/vintage-culture/${file}`;

const teeLost: MediaImage = { src: vc("tee-lost.jpg"), alt: "Camiseta preta oversized com a arte de LOST nas costas" };
const teeFind: MediaImage = {
  src: vc("tee-vntg77.jpg"),
  alt: "Camiseta preta oversized VNTG 77 com os chevrons em rosa nas costas",
};
const teeBootleg: MediaImage = { src: vc("tee-bootleg.jpg"), alt: "Camiseta preta com estampa bootleg Vintage Culture" };
const tee93: MediaImage = { src: vc("tee-93.jpg"), alt: "Camiseta preta estilo jersey com o número 93", cover: true };
const storeLost: MediaImage = { src: vc("store-lost-verso.webp"), alt: "Verso da camiseta oversized LOST" };
const storeFind: MediaImage = { src: vc("store-find-create-moments.webp"), alt: "Verso da camiseta oversized Find Create Moments" };
const store1: MediaImage = { src: vc("store-1.webp"), alt: "Peça da loja Vintage" };

export const media: Record<string, ArtistMedia> = {
  "vintage-culture": {
    hero: { src: vc("artist.jpg"), alt: "Vintage Culture sentado num banco, de boné e roupa preta, em foto preto e branco" },
    press: [
      { src: vc("press-4.webp"), alt: "Vintage Culture tocando ao vivo" },
      { src: vc("press-1.webp"), alt: "Vintage Culture em retrato de imprensa" },
      { src: vc("press-3.jpg"), alt: "Vintage Culture em foto de capa" },
      { src: vc("press-2.webp"), alt: "Vintage Culture em foto de divulgação" },
      { src: vc("press-5.avif"), alt: "Vintage Culture em foto de imprensa" },
    ],
    products: {
      // ids do mock
      p1: teeLost,
      p2: teeFind,
      p3: teeBootleg,
      p4: tee93,
      p5: storeLost,
      p6: storeFind,
      // palavras do nome (API)
      lost: teeLost,
      find: teeFind,
      moments: teeFind,
      bootleg: teeBootleg,
      "93": tee93,
      jersey: tee93,
    },
    productFallback: [teeLost, teeFind, teeBootleg, tee93, storeLost, storeFind, store1],
  },
  departamento: dpMedia(),
  anitta: anittaMedia(),
  veigh: veighMedia(),
};

/**
 * Veigh: fotos oficiais de produto da EVOM Merch (veigh-fanzone-refs/06-store, as 9 peças, todas sem pessoas), achatadas
 * sobre o papel da loja. Sem foto do artista (política da pasta de identidade; as capas dos álbuns mostram o artista): o
 * Início e o Mural usam cartazes de tipo, o logo "evom" e o lustre da home (brands.ts).
 * TODO oficial: confirmar a licença das fotos de produto e do logo com a Supernova Ent.
 */
function veighMedia(): ArtistMedia {
  const vg = (file: string) => `/media/veigh/${file}`;
  const hoodieVinho: MediaImage = { src: vg("hoodie-evom-vinho.jpg"), alt: "Moletom vinho com tag EVOM em spray e globo-lustre no peito" };
  const hoodiePreta: MediaImage = { src: vg("hoodie-evom-preta.jpg"), alt: "Moletom preto com tag EVOM vermelha e costuras vinho" };
  const tee: MediaImage = { src: vg("camiseta-evom.jpg"), alt: "Camiseta branca com tag EVOM em spray vinho" };
  const astro: MediaImage = { src: vg("camiseta-astro.jpg"), alt: "Camiseta preta com estrela amarela e tag EVOM" };
  const regata: MediaImage = { src: vg("regata-evom.jpg"), alt: "Regata off-white com globo-lustre e tag EVOM" };
  const calcaVinho: MediaImage = { src: vg("calca-moletom-evom-vinho.jpg"), alt: "Calça de moletom vinho com costuras pretas" };
  const calcaPreta: MediaImage = { src: vg("calca-moletom-evom-preta.jpg"), alt: "Calça de moletom EVOM preta" };
  const kitVinho: MediaImage = { src: vg("kit-moletom-evom-vinho.jpg"), alt: "Kit moletom EVOM vinho" };
  const kitPreta: MediaImage = { src: vg("kit-moletom-evom-preta.jpg"), alt: "Kit moletom EVOM preto" };
  return {
    hero: null,
    press: [],
    products: {
      // ids do catálogo da evom.art
      "hoodie-evom-vinho": hoodieVinho,
      "hoodie-evom-preta": hoodiePreta,
      "camiseta-evom": tee,
      "camiseta-astro": astro,
      "regata-evom": regata,
      "calca-moletom-evom-vinho": calcaVinho,
      "calca-moletom-evom-preta": calcaPreta,
      "kit-moletom-evom-vinho": kitVinho,
      "kit-moletom-evom-preta": kitPreta,
      // palavras do nome (API)
      hoodie: hoodieVinho,
      moletom: hoodieVinho,
      astro,
      regata,
      cal: calcaVinho, // "calça" vira "cal" + "a" na busca por palavra
      kit: kitVinho,
      camiseta: tee,
    },
    productFallback: [hoodieVinho, hoodiePreta, tee, astro, regata, calcaVinho, calcaPreta, kitVinho, kitPreta],
  };
}

/**
 * Anitta: fotos oficiais de produto da Anitta Shop (anitta-fanzone-refs/06-store, só peças sem pessoas) e a capa de
 * EQUILIBRIVM II (cartaz do lançamento, em brands.ts). Sem foto da artista (política da pasta de identidade): o Início e o
 * Mural usam cartas de tipo, e os posts com foto ficam sem imagem até o press kit da Rodamoinho.
 * TODO oficial: confirmar a licença das fotos de produto e pedir a capa em alta (GAPS A-01, A-05).
 */
function anittaMedia(): ArtistMedia {
  const an = (file: string) => `/media/anitta/${file}`;
  const sun: MediaImage = { src: an("equilibrivm-sun-tee.jpg"), alt: "Camiseta rosa EQUILIBRIVM SUN, frente e costas, com o sol da era" };
  const water: MediaImage = { src: an("equilibrivm-water-tee.jpg"), alt: "Camiseta EQUILIBRIVM WATER, frente e costas, com jarros d'água" };
  const moon: MediaImage = { src: an("equilibrivm-moon-tee.jpg"), alt: "Camiseta EQUILIBRIVM MOON, frente e costas, com a lua" };
  const hand: MediaImage = { src: an("equilibrivm-hand-sweatshirt.jpg"), alt: "Moletom EQUILIBRIVM HAND, frente e costas" };
  const hoodie: MediaImage = { src: an("baile-funk-hoodie.jpg"), alt: "Moletom com capuz BAILE FUNK" };
  const bandana: MediaImage = { src: an("sao-paulo-bandana.jpg"), alt: "Bandana São Paulo Game" };
  return {
    hero: null,
    press: [],
    products: {
      // ids e nomes inteiros do catálogo da Anitta Shop
      "equilibrivm-sun-t-shirt": sun,
      "equilibrivm-water-t-shirt": water,
      "equilibrivm-moon-t-shirt": moon,
      "equilibrivm-hand-sweatshirt": hand,
      "baile-funk-hoodie": hoodie,
      "sao-paulo-game-bandana": bandana,
      // palavras do nome (API)
      sun,
      water,
      moon,
      sweatshirt: hand,
      hoodie,
      moletom: hoodie,
      bandana,
    },
    productFallback: [sun, water, moon, hand, hoodie, bandana],
  };
}

/**
 * Departamento: fotos oficiais de produto da loja Trouble Dancing? (departamento-fanzone-refs/06-store),
 * peça centralizada sobre fundo chapado. Sem foto dos integrantes (política da pasta de identidade):
 * o Início e o Mural usam cartaz de tipo, e os posts com foto ficam sem imagem até o press kit.
 * TODO oficial: confirmar a licença das fotos de produto (GAPS G-03).
 */
function dpMedia(): ArtistMedia {
  const dp = (file: string) => `/media/departamento/${file}`;
  const tee: MediaImage = { src: dp("tee-blue-back.jpg"), alt: "Camiseta azul, costas com TROUBLE DANCING? e 1-800-DEPARTAMENTO" };
  const teeWhite: MediaImage = { src: dp("tee-white-front.jpg"), alt: "Camiseta branca com a estrela azul no peito" };
  const hoodieBlue: MediaImage = { src: dp("hoodie-blue-back.jpg"), alt: "Moletom azul, costas com o selo do globo e To dance and serve" };
  const hoodie: MediaImage = { src: dp("hoodie-black-front.jpg"), alt: "Moletom preto com estrela branca no peito e cordão azul" };
  const jersey: MediaImage = { src: dp("jersey-blue-front.jpg"), alt: "Jersey azul com estrela e selo no peito" };
  const hat: MediaImage = { src: dp("hat-front.jpg"), alt: "Boné azul com patch TROUBLE DANCING? em caixa de contorno duplo" };
  const scarf: MediaImage = { src: dp("scarf.jpg"), alt: "Lenço azul com estrelas e DEPARTAMENTO na diagonal" };
  const purse: MediaImage = { src: dp("purse-a.jpg"), alt: "Bolsa azul acetinada com TROUBLE DANCING?" };
  const tag: MediaImage = { src: dp("tag-front.jpg"), alt: "Fita-chaveiro azul com 1-800-DEPARTAMENTO" };
  const bottle: MediaImage = { src: dp("bottle-a.jpg"), alt: "Garrafa azul-marinho com o selo do globo e cinco estrelas" };
  const stickers: MediaImage = { src: dp("sticker-pack.jpg"), alt: "Embalagem holográfica com adesivos azuis" };
  const vinyl: MediaImage = { src: dp("vinyl-secret-sleeve.jpg"), alt: "Capa quadrada azul com estrela branca no canto superior esquerdo" };
  return {
    hero: null,
    press: [],
    products: {
      // nomes inteiros do catálogo (1-800-<ITEM>)
      "1-800-t-shirt": tee,
      "1-800-t-shirt-reverse": teeWhite,
      "1-800-blue-hoodie": hoodieBlue,
      "1-800-hoodie": hoodie,
      "1-800-jersey": jersey,
      "1-800-hat": hat,
      "1-800-scarf": scarf,
      "1-800-purse": purse,
      "1-800-tag": tag,
      "1-800-bottle-service": bottle,
      "sticker pack": stickers,
      "secret vinyl": vinyl,
      // palavras do nome (API)
      shirt: tee,
      camiseta: tee,
      hoodie,
      moletom: hoodie,
      jersey,
      hat,
      bone: hat,
      scarf,
      lenco: scarf,
      purse,
      bolsa: purse,
      tag,
      chaveiro: tag,
      bottle,
      garrafa: bottle,
      sticker: stickers,
      adesivos: stickers,
      vinyl,
      vinil: vinyl,
    },
    productFallback: [tee, hoodieBlue, hat, scarf, teeWhite, jersey, purse, vinyl],
  };
}

export const mediaFor = (slug: string): ArtistMedia | null => media[slug] ?? null;

/** Imagem de um produto: a da API, a do id/nome inteiro/palavra do nome, ou uma da fila (pelo índice). */
export function productImage(slug: string, product: Product, index = 0): MediaImage | null {
  if (product.image) return product.image;
  const m = mediaFor(slug);
  if (!m) return null;
  const byId = m.products[product.id] ?? m.products[product.name.trim().toLowerCase()];
  if (byId) return byId;
  const words = product.name.toLowerCase().split(/[^a-z0-9]+/);
  for (const w of words) if (w && m.products[w]) return m.products[w];
  return m.productFallback[index % m.productFallback.length] ?? null;
}

/** Foto de um post com imagem (pelo índice, para variar entre posts). */
export function postImage(slug: string, post: Post, index = 0): MediaImage | null {
  if (post.image) return post.image;
  if (!post.hasImage) return null;
  const m = mediaFor(slug);
  if (!m) return null;
  return m.press[index % m.press.length] ?? null;
}

/** Foto "do evento" para o Photo Finder e páginas de evento (pelo índice). */
export function eventPhoto(slug: string, index = 0): MediaImage | null {
  const m = mediaFor(slug);
  if (!m) return null;
  return m.press[index % m.press.length] ?? null;
}
