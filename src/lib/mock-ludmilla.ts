/**
 * Modo exemplo da Ludmilla (front sem API_URL): o conteúdo do Artifact "Fanzone Ludmilla" (packs/ludmilla do kit)
 * no formato do app, para a apresentação ao cliente. Com a API ligada, nada daqui aparece.
 *
 * Agenda e lançamentos vêm de fontes públicas (Popline, CNN Brasil, Billboard Brasil); status de venda, números, posts de
 * fã, preços e brindes são de exemplo. Frase da artista só com fonte (VOICE.md).
 *
 * Fotos de pessoas: os fãs dos posts e dos perfis usam fotos de banco de imagens com licença livre (ver `mock-ludmilla-people.ts`),
 * por decisão da PicBrand para a apresentação (cofre: Decisões/2026-11-09 Ludmilla - fotos de pessoas no modo exemplo).
 * Nenhuma é foto da artista.
 */
import { PEOPLE, SCENES } from "./mock-ludmilla-people";
import type { FanClub, MediaImage, Post, Prize, Product, PublicFan, ShowEvent, Track, Viewer } from "./types";

const lud = (file: string) => `/media/ludmilla/${file}`;

type Person = { id: string; name: string; handle: string; initial: string; avatar: string | null; club: string };

/** Fãs de exemplo (nomes do Artifact e da Família). `club` é o slug do fã-clube dele. */
const fan = (id: string, name: string, handle: string, club: string): Person => ({
  id,
  name,
  handle,
  initial: name[0],
  avatar: PEOPLE[id]?.src ?? null,
  club,
});

export const ludFans: Person[] = [
  fan("u-marina", "Marina C.", "@marina.numanice", "fa-clube-rj"),
  fan("u-bia", "Bia S.", "@bia.lud", "fa-clube-rj"),
  fan("u-thiago", "Thiago L.", "@thiago.funkmilla", "ludmillers-sp"),
  fan("u-duda", "Duda R.", "@duda.ssa", "fa-clube-ba"),
  fan("u-carol", "Carol M.", "@carolm.bh", "fa-clube-mg"),
  fan("u-gabi", "Gabi N.", "@gabinunes", "fa-clube-rj"),
  fan("u-rafa", "Rafa C.", "@rafa.copa", "oficial"),
  fan("u-juliana", "Juliana P.", "@ju.pagode", "ludmillers-sp"),
  fan("u-leo", "Léo A.", "@leo.numanice", "oficial"),
  fan("u-pedro", "Pedro H.", "@pedroh", "fa-clube-mg"),
  fan("u-nanda", "Nanda F.", "@nandaf", "fa-clube-ba"),
  fan("u-vitor", "Vitor S.", "@vitor.sp", "ludmillers-sp"),
];

const byId = (id: string) => ludFans.find((f) => f.id === id)!;

export const ludClubs: FanClub[] = [
  { id: "lc1", slug: "oficial", name: "Fã-clube oficial Ludmilla", description: "A família da Lud no Brasil inteiro. Tudo numa nice.", city: "", isMaster: true, status: "active", members: 48210, avatar: SCENES.crowd?.src ?? null, owner: { name: "Rafa C.", handle: "@rafa.copa" }, joined: true, myRole: null },
  { id: "lc2", slug: "fa-clube-rj", name: "Fã-clube RJ", description: "Caravana pro Numanice, ponto marcado na grade e roda de pagode no fim.", city: "Rio de Janeiro", isMaster: false, status: "active", members: 6320, avatar: SCENES.beach?.src ?? null, owner: { name: "Bia S.", handle: "@bia.lud" }, joined: true, myRole: null },
  { id: "lc3", slug: "ludmillers-sp", name: "Ludmillers SP", description: "Paulistas da família: ônibus pros shows e encontro antes do Carnaval na Cidade.", city: "São Paulo", isMaster: false, status: "active", members: 4875, avatar: SCENES.friends?.src ?? null, owner: { name: "Thiago L.", handle: "@thiago.funkmilla" }, joined: false, myRole: null },
  { id: "lc4", slug: "fa-clube-ba", name: "Fã-clube BA", description: "Salvador na Virada e onde mais a Lud for.", city: "Salvador", isMaster: false, status: "active", members: 2140, avatar: SCENES.carnival?.src ?? null, owner: { name: "Duda R.", handle: "@duda.ssa" }, joined: false, myRole: null },
  { id: "lc5", slug: "fa-clube-mg", name: "Fã-clube MG", description: "Domingo é dia de Numanice no talo.", city: "Belo Horizonte", isMaster: false, status: "active", members: 1730, avatar: SCENES.samba?.src ?? null, owner: { name: "Carol M.", handle: "@carolm.bh" }, joined: false, myRole: null },
];

const clubOf = (slug: string) => {
  const c = ludClubs.find((x) => x.slug === slug)!;
  return { slug: c.slug, name: c.name, avatar: c.avatar ?? null, isMaster: c.isMaster };
};

const official = { name: "Ludmilla", handle: "Artista", initial: "L", official: true };

const galera = (
  id: string,
  who: string,
  timeLabel: string,
  text: string,
  n: [number, number, number],
  extra: Partial<Post> = {},
): Post => {
  const f = byId(who);
  return {
    id,
    kind: "galera",
    author: { name: f.name, handle: f.handle, initial: f.initial, id: f.id, avatar: f.avatar, verified: ludClubs.some((c) => c.owner?.handle === f.handle) },
    timeLabel,
    text,
    club: clubOf(f.club),
    likes: n[0],
    comments: n[1],
    reposts: n[2],
    ...extra,
  };
};

const img = (m: MediaImage | undefined): Pick<Post, "hasImage" | "image"> => (m ? { hasImage: true, image: m } : {});

export const ludPosts: Post[] = [
  {
    id: "ld1",
    kind: "drop",
    author: official,
    timeLabel: "05/11",
    text: "Bi Festinha chegou: o primeiro single do EP Fervo da Lud, com Puterrier e HITMAKER. O FunkMilla tá de volta e é pra tocar alto.",
    likes: 214000,
    comments: 18300,
    reposts: 26400,
  },
  {
    id: "ld2",
    kind: "drop",
    author: official,
    timeLabel: "26/07",
    // Fala real (Billboard Brasil, 26/07/2025).
    text: "\"O Numanice começou como um sonho e virou um movimento.\"",
    likes: 388000,
    comments: 41200,
    reposts: 52700,
  },
  {
    id: "ld3",
    kind: "drop",
    author: { ...official, name: "Fanzone" },
    timeLabel: "ontem",
    text: "Manda o vídeo do teu melhor momento num Numanice. Os mais bonitos entram no Mural da família.",
    likes: 14800,
    comments: 3100,
    reposts: 920,
  },
  galera("lg1", "u-bia", "há 12 min", "Ingresso do CarnaRildy garantido antes de esgotar. Quem é do fã-clube RJ, bora marcar o ponto na Marina da Glória.", [312, 74, 18], {
    quote: "CarnaRildy, 13 de fevereiro, Axia Marina da Glória.",
  }),
  galera("lg2", "u-thiago", "há 40 min", "Bi Festinha no repeat desde quinta. O FunkMilla voltou e eu não tô bem.", [528, 96, 41], img(SCENES.party)),
  galera("lg3", "u-duda", "há 2 h", "Alguém já sabe o horário da Lud no Festival da Virada? Salvador inteira vai tá lá no dia 2.", [141, 58, 6], img(SCENES.carnival)),
  galera("lg4", "u-carol", "há 5 h", "Domingo sem Numanice #2 no talo não é domingo. O pagodinho virou religião mesmo.", [233, 31, 12], img(SCENES.samba)),
  galera("lg5", "u-gabi", "há 6 h", "Óculos da coleção chegou! Quadrado caramelo com a assinatura dela na haste. Tô me sentindo a própria.", [904, 122, 37], img(SCENES.sunglasses)),
  galera("lg6", "u-rafa", "ontem", "Pôr do sol em Ipanema e Numanice no fone. Não tem como ser mais carioca que isso.", [1210, 88, 64], img(SCENES.sunset)),
  galera("lg7", "u-juliana", "ontem", "Caravana Ludmillers SP pro Carnaval na Cidade: 2 ônibus já lotados, abrimos o terceiro. Chama no privado.", [377, 145, 52], img(SCENES.friends)),
  galera("lg8", "u-leo", "há 2 dias", "Fiz o cartaz pro Repique. Será que ela lê?", [688, 93, 21], img(SCENES.sign)),
  galera("lg9", "u-nanda", "há 3 dias", "Primeira vez na grade num show dela. A proximidade que ela fala é real, gente.", [1543, 201, 88], img(SCENES.crowd)),
  galera("lg10", "u-pedro", "há 3 dias", "Repostando porque isso aqui é a cara do Numanice.", [96, 12, 9], {
    quote: "\"O Numanice começou como um sonho e virou um movimento.\"",
  }),
  {
    id: "li1",
    kind: "instagram",
    author: { name: byId("u-marina").name, handle: byId("u-marina").handle, initial: "M", id: "u-marina", avatar: byId("u-marina").avatar },
    timeLabel: "há 3 h",
    text: "Trouxe esse post do Instagram dela pra família comentar aqui.",
    club: clubOf("fa-clube-rj"),
    likes: 301,
    comments: 45,
    reposts: 20,
  },
];

/** Agenda: datas de fontes públicas (pack.json > events); status e brindes de exemplo. */
export const ludEvents: ShowEvent[] = [
  { id: "repique-1205", date: "2026-12-05", weekday: "SÁB", day: "05", month: "DEZ", monthKey: "dez", city: "Ribeirão Preto", venue: "Festival Repique · Estádio do Comercial", time: "22h", address: "Estádio do Comercial, Ribeirão Preto · SP", doorsOpen: "18h", ageRating: "18+", lineup: "Ludmilla e convidados", giftsCount: 6, status: "last_batches", ticketingName: "Ingresse", ticketingUrl: "https://www.ingresse.com/" },
  { id: "virada-0102", date: "2027-01-02", weekday: "SÁB", day: "02", month: "JAN", monthKey: "jan", city: "Salvador", venue: "Festival da Virada · Arena O Canto da Cidade", time: "21h", address: "Arena O Canto da Cidade, Salvador · BA", doorsOpen: "16h", ageRating: "Livre", lineup: "Ludmilla e convidados", giftsCount: 0, status: "on_sale" },
  { id: "sfx-0123", date: "2027-01-23", weekday: "SÁB", day: "23", month: "JAN", monthKey: "jan", city: "São Paulo", venue: "Spotify Superfans Experience · Distrito Anhembi", time: "20h", address: "Distrito Anhembi, São Paulo · SP", doorsOpen: "17h", ageRating: "16+", lineup: "Ludmilla e convidados", giftsCount: 5, status: "on_sale", ticketingName: "Mundo Ticket", ticketingUrl: "https://www.mundoticket.com.br/" },
  { id: "carnaval-0207", date: "2027-02-07", weekday: "DOM", day: "07", month: "FEV", monthKey: "fev", city: "São Paulo", venue: "Carnaval na Cidade · local a confirmar", time: "16h", address: "Local a confirmar, São Paulo · SP", doorsOpen: "14h", ageRating: "18+", lineup: "Ludmilla e convidados", giftsCount: 4, status: "soon", ticketingName: "Ingresse", ticketingUrl: "https://www.ingresse.com/" },
  { id: "carnarildy-0213", date: "2027-02-13", weekday: "SÁB", day: "13", month: "FEV", monthKey: "fev", city: "Rio de Janeiro", venue: "CarnaRildy · Axia Marina da Glória", time: "18h", address: "Axia Marina da Glória, Rio de Janeiro · RJ", doorsOpen: "15h", ageRating: "18+", lineup: "Ludmilla", giftsCount: 3, status: "last_batches", ticketingName: "Ingresse", ticketingUrl: "https://www.ingresse.com/" },
];

/** Loja da Lud: coleção Chilli Beans × Ludmilla (fotos oficiais de produto, sem pessoas; preços de exemplo). */
const glasses = (id: string, name: string, cents: number, soldOut = false): Product => ({
  id,
  name,
  category: "acessorios",
  priceLabel: `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`,
  priceCents: cents,
  color: "#F8E8D8",
  soldOut,
});

export const ludProducts: Product[] = [
  glasses("oc-cl-4926", "Quadrado Caramelo", 21999),
  glasses("oc-cl-3825", "Cat Rosé", 21999),
  glasses("oc-cl-4945", "Quadrado Preto Dourado", 21999),
  glasses("oc-cl-4944", "Bossa Nova Preto", 21999, true),
  glasses("oc-cl-4947", "Retangular Rosado", 21999),
  glasses("oc-cl-4950", "Cat Marrom", 21999),
  glasses("oc-mt-4156", "Cat Dourado", 27499),
  glasses("oc-mt-4251", "Quadrado Dourado", 27499),
  glasses("oc-mt-4159", "Redondo Grafite", 27499),
  glasses("oc-mt-4150", "Sem Aro Lilás", 27499),
  glasses("oc-mt-4161", "Flat-top Marrom", 27499),
];

export const ludProductImages: Record<string, MediaImage> = {
  "oc-cl-4926": { src: lud("oc-cl-4926.jpg"), alt: "Óculos quadrado de acetato caramelo translúcido com a assinatura Ludmilla dourada na haste" },
  "oc-cl-3825": { src: lud("oc-cl-3825.jpg"), alt: "Óculos gatinho de acetato rosa-nude com lente degradê" },
  "oc-cl-4945": { src: lud("oc-cl-4945.jpg"), alt: "Óculos quadrado preto brilhante com emblema redondo dourado" },
  "oc-cl-4944": { src: lud("oc-cl-4944.jpg"), alt: "Óculos quadrado preto fosco de haste larga" },
  "oc-cl-4947": { src: lud("oc-cl-4947.jpg"), alt: "Óculos retangular marrom-claro com lente rosada" },
  "oc-cl-4950": { src: lud("oc-cl-4950.jpg"), alt: "Óculos gatinho de acetato marrom translúcido" },
  "oc-mt-4156": { src: lud("oc-mt-4156.jpg"), alt: "Óculos gatinho de metal dourado com detalhe na ponte" },
  "oc-mt-4251": { src: lud("oc-mt-4251.jpg"), alt: "Óculos quadrado de metal dourado com lente degradê marrom" },
  "oc-mt-4159": { src: lud("oc-mt-4159.jpg"), alt: "Óculos redondo de metal grafite com lente degradê marrom" },
  "oc-mt-4150": { src: lud("oc-mt-4150.jpg"), alt: "Óculos sem aro com lente degradê cinza-roxo" },
  "oc-mt-4161": { src: lud("oc-mt-4161.jpg"), alt: "Óculos máscara flat-top de metal marrom" },
};

/** Drops Hits: lançamentos reais (pack.json > drops); votos de exemplo. */
export const ludTracks: Track[] = [
  { id: "lt1", num: "01", title: "Bi Festinha", meta: "Single · Fervo da Lud · esta semana", votes: 18420, releaseLabel: "05/11/2026", durationSec: 30 },
  { id: "lt2", num: "02", title: "Fragmentos · A Experiência", meta: "Ao vivo · Qualistage", votes: 12730, releaseLabel: "2026", durationSec: 30 },
  { id: "lt3", num: "03", title: "Numanice #3 (Ao Vivo)", meta: "Ao vivo", votes: 9904, releaseLabel: "2024", durationSec: 30 },
  { id: "lt4", num: "04", title: "Numanice #2", meta: "Álbum", votes: 8611, releaseLabel: "2022", durationSec: 30 },
];

/** Roleta (pack.json > prizes). */
export const ludPrizes: Prize[] = [
  { id: "lp1", label: "Ingresso" },
  { id: "lp2", label: "Óculos da Lud" },
  { id: "lp3", label: "Front stage" },
  { id: "lp4", label: "Cupom 15%" },
  { id: "lp5", label: "Pôster" },
  { id: "lp6", label: "Tente de novo", isRetry: true },
  { id: "lp7", label: "Abadá" },
  { id: "lp8", label: "Pré-escuta" },
];

const me = byId("u-marina");
export const ludViewer: Viewer = {
  name: me.name,
  handle: me.handle,
  initial: me.initial,
  avatar: me.avatar,
  luckPoints: 1240,
  spins: 3,
  pendingGifts: 2,
  isMember: false,
  clubs: ["oficial", "fa-clube-rj"],
};

/** Perfil público de um fã de exemplo (abre pelo nome no post). */
export function ludPublicFan(id: string): PublicFan | null {
  const i = ludFans.findIndex((f) => f.id === id);
  if (i < 0) return null;
  const f = ludFans[i];
  return {
    id: f.id,
    name: f.name,
    handle: f.handle,
    avatar: f.avatar,
    club: (({ slug, name, avatar }) => ({ slug, name, avatar }))(clubOf(f.club)),
    points: 2400 - i * 170,
    rank: i + 1,
    isMe: f.id === "u-marina",
    posts: ludPosts.filter((p) => p.author.id === f.id),
  };
}
