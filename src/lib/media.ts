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
  /** Foto do artista para o cartaz "Culture is the answer" e para o Início. */
  hero: MediaImage;
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
};

export const mediaFor = (slug: string): ArtistMedia | null => media[slug] ?? null;

/** Imagem de um produto: a da API, a do id/palavra do nome, ou uma da fila (pelo índice). */
export function productImage(slug: string, product: Product, index = 0): MediaImage | null {
  if (product.image) return product.image;
  const m = mediaFor(slug);
  if (!m) return null;
  const byId = m.products[product.id];
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
