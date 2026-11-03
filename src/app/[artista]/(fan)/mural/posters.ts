/**
 * Cartazes do Mural: dados prontos para o cliente, montados no servidor
 * (page.tsx) a partir da API. Sem imports de lib/api aqui.
 */
import { brandByKey, type ArtistBrand } from "@/lib/brands";
import type { MediaImage, Post, Product, ShowEvent, Track } from "@/lib/types";

export type PosterKind = "lost" | "culture" | "date" | "pick" | "store";

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

/** Manchete da loja do Departamento: os itens se chamam `1-800-<ITEM>`; o número de serviço fica numa linha. */
function storeHeadline(product: Product | null): string[] {
  const name = product?.name.trim().toUpperCase() ?? "";
  const m = name.match(/^1-800-(.+)$/);
  if (!m) return ["1-800-", "Store"];
  const item = m[1].split("-").filter(Boolean);
  return ["1-800-", item[item.length - 1]];
}

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
  const dp = brand.key === "departamento";
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
      credits: [artistName, dp ? "Worldwide 2027 ®" : "Fanzone"],
      image: dp ? null : hero, // o Departamento não usa foto dos integrantes: o cartaz é tipo + "?"
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
    text: `${dp ? "PicKup" : "PicKup da sorte"} aberto para todos os fãs. Gira, concorre e vê o seu brinde na hora.`,
    headline: dp ? ["PicKup"] : ["Tente", "a", "sorte"],
    credits: dp ? ["Aberto", "Dancing Service"] : ["PicKup da sorte"],
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
    text: dp
      ? `${product?.name ?? "A coleção"} na ${brand.store.name}: a marca de ${artistName}, direto para o fan club.`
      : `Loja VINTAGE na fanzone: a marca de ${artistName}, direto para o fan club.`,
    headline: dp ? storeHeadline(product) : ["Vin", "tage"],
    credits: dp ? [brand.store.name + ex, product?.priceLabel ?? "Fanzone"] : ["Loja oficial" + ex, product?.name ?? "Fanzone"],
    image: productImg,
    cta: { label: "Ver loja", href: "/loja" },
    likes: 1200,
    comments: 96,
    reposts: 150,
  });

  return out;
}
