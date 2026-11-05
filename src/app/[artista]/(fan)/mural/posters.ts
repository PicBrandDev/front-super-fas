/**
 * Cartazes do Mural: dados prontos para o cliente, montados no servidor
 * (page.tsx) a partir da API. Sem imports de lib/api aqui.
 */
import { brandByKey, type ArtistBrand, type PosterKind } from "@/lib/brands";
import type { MediaImage, Post, Product, ShowEvent, Track } from "@/lib/types";

export type { PosterKind };

export type Poster = {
  id: string;
  /** Id do Drop News de origem (só nos cartazes de post oficial; é o que dá para compartilhar no Instagram). */
  postId?: string;
  kind: PosterKind;
  /** Nome curto do cartaz (aria-label, "Drop novo", "PicKup"...). */
  cap: string;
  /** Quem assina a faixa de leitura. */
  by: string;
  /** Frase legível (até 2 linhas). */
  text: string;
  /** Palavras da manchete (cada uma vira uma linha nos moldes em Archivo). */
  headline: string[];
  /** Créditos em mono no cartaz (linhas). */
  credits: string[];
  /** Molde `date`: dia e mês. */
  day?: string;
  month?: string;
  /** Foto (artista no `culture`, camiseta no `store`). */
  image?: MediaImage | null;
  /** Ação primária: `listen` toca o primeiro Drop; os outros são links relativos ao ambiente. */
  cta?: { label: string; href?: string; act?: "listen" } | null;
  likes: number;
  comments: number;
  reposts: number;
  /** Carta de tarô (pele com `posters.card`): numeral do topo, plaqueta embaixo e texto da lateral direita. */
  numeral?: string;
  plaque?: string;
  side?: string;
};

/** "2,4 mil" como no protótipo. */
export const fmtShort = (n: number) =>
  n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "").replace(".", ",") + " mil" : String(n);

const clean = (w: string) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");

/** Título curto: o campo `quote` ou as primeiras 1–2 palavras do texto. */
export function headlineOf(post: Post, max: 1 | 2): string[] {
  const src = (post.quote?.trim() || post.text).split(/\s+/).map(clean).filter(Boolean);
  if (!src.length) return ["Drop"];
  const words = [src[0]];
  if (max === 2 && src[1] && src[0].length <= 8) words.push(src[1]);
  return words;
}

const MONTHS: Record<string, string> = {
  jan: "janeiro",
  fev: "fevereiro",
  mar: "março",
  abr: "abril",
  mai: "maio",
  jun: "junho",
  jul: "julho",
  ago: "agosto",
  set: "setembro",
  out: "outubro",
  nov: "novembro",
  dez: "dezembro",
};

export function buildPosters({
  artistName,
  drops,
  event,
  product,
  hero,
  productImg,
  tracks,
  demo,
  brand = brandByKey("vintage"),
}: {
  artistName: string;
  drops: Post[];
  event: ShowEvent | null;
  product: Product | null;
  hero: MediaImage | null;
  productImg: MediaImage | null;
  tracks: Track[];
  demo: boolean;
  /** Pele do artista: assinatura, PicKup e loja mudam de voz (as funções dos cartazes são as mesmas). */
  brand?: ArtistBrand;
}): Poster[] {
  const kit = brand.posters; // cartazes no padrão do kit (Departamento, Anitta); sem isso, os moldes do Vintage
  const out: Poster[] = [];
  const molds: PosterKind[] = ["lost", "culture"];
  const ex = demo ? " · Exemplo" : "";

  drops.forEach((p, i) => {
    const kind = molds[i % molds.length];
    out.push({
      id: `drop-${p.id}`,
      postId: p.id,
      kind,
      cap: "Drop novo",
      by: p.author.name || artistName,
      text: p.text,
      headline: headlineOf(p, kind === "lost" ? 1 : 2),
      credits: kind === "lost" ? [p.author.name || artistName, p.timeLabel] : [artistName, p.timeLabel],
      image: kind === "culture" ? hero : null,
      cta: kind === "lost" && tracks.length ? { label: "Ouvir", act: "listen" } : null,
      likes: p.likes,
      comments: p.comments,
      reposts: p.reposts,
    });
  });

  // A foto do artista sempre aparece: se nenhum Drop caiu no molde `culture`, entra o cartaz fixo.
  if (!out.some((p) => p.kind === "culture")) {
    out.push({
      id: "culture",
      kind: "culture",
      cap: "Oficial",
      by: artistName,
      text: brand.mottoText,
      headline: brand.motto,
      credits: [kit?.kicker ?? artistName, kit ? kit.legal : "Fanzone"],
      image: kit ? null : hero, // no padrão do kit o cartaz é tipo + glifo, sem foto do artista
      cta: null,
      likes: 5100,
      comments: 902,
      reposts: 1300,
    });
  }

  if (event) {
    const month = MONTHS[event.monthKey] ?? event.month.toLowerCase();
    out.push({
      id: `event-${event.id}`,
      kind: "date",
      cap: "Nova data",
      by: "Fanzone",
      text: `${event.city}, ${event.day} de ${month}: ${event.venue}.${
        event.giftsCount > 0 ? " Brinde antes e depois da compra para quem é da fanzone." : ""
      }`,
      headline: [event.day],
      credits: [`${event.city} · ${event.venue}`, event.giftsCount > 0 ? "Brinde antes e depois" : event.time],
      day: event.day,
      month: event.month,
      cta: { label: "Ver evento", href: `/eventos/${event.id}` },
      likes: 1800,
      comments: 244,
      reposts: 410,
    });
  }

  out.push({
    id: "pick",
    kind: "pick",
    cap: "PicKup",
    by: "Fanzone",
    text: `${kit ? "PicKup" : "PicKup da sorte"} aberto para todos os fãs. Gira, concorre e vê o seu brinde na hora.`,
    headline: kit ? kit.pick.headline : ["Tente", "a", "sorte"],
    credits: kit ? [kit.pick.tag, kit.pick.micro] : ["PicKup da sorte"],
    cta: { label: "Girar", href: "/pickup" },
    likes: 960,
    comments: 120,
    reposts: 88,
  });

  out.push({
    id: "store",
    kind: "store",
    cap: "Loja",
    by: "Fanzone",
    text: kit
      ? `${product?.name ?? "A coleção"} na ${brand.store.name}: a marca de ${artistName}, direto para o fan club.`
      : `Loja VINTAGE na fanzone: a marca de ${artistName}, direto para o fan club.`,
    headline: kit ? kit.storeHeadline(product?.name ?? "") : ["Vin", "tage"],
    credits: kit ? [brand.store.name + ex, product?.priceLabel ?? "Fanzone"] : ["Loja oficial" + ex, product?.name ?? "Fanzone"],
    image: productImg,
    cta: { label: "Ver loja", href: "/loja" },
    likes: 1200,
    comments: 96,
    reposts: 150,
  });

  // Cartas de tarô: cada molde tem o seu numeral; a plaqueta dá o nome da carta e a lateral, a data ou o lugar.
  const card = kit?.card;
  if (card) {
    for (const p of out) {
      p.numeral = card.numerals[p.kind];
      if (p.kind === "lost") Object.assign(p, { plaque: card.plaques.lost, side: p.credits[1] });
      if (p.kind === "culture") Object.assign(p, { plaque: card.plaques.culture, side: card.sides.culture });
      if (p.kind === "date" && event) Object.assign(p, { plaque: event.venue, side: event.city });
      if (p.kind === "pick") Object.assign(p, { plaque: card.plaques.pick, side: card.sides.pick });
      if (p.kind === "store") Object.assign(p, { plaque: brand.store.name, side: product?.priceLabel ?? "" });
    }
  }

  // PicKup e Loja (os dois últimos) abrem o Mural; os Drops, a data e a foto do artista vêm depois.
  const [pickup, store] = out.splice(-2);
  return [pickup, store, ...out];
}
