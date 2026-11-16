/**
 * Modo exemplo do João Gomes (front sem API_URL): o conteúdo do pacote packs/joao-gomes do Fanzone Artist Kit no formato do app,
 * gerado por .claude/skills/subir-pele-cantor/gerar-pele.mjs. Com a API ligada, nada daqui aparece.
 *
 * Agenda e lançamentos vêm do pacote (fontes em pack.json > events[].src e sources); horários, status de venda, números,
 * posts de fã, preços e brindes são de exemplo. Sem foto de pessoa (regra 4 do cofre): os fãs aparecem com a inicial.
 */
import type { FanClub, MediaImage, Post, Prize, Product, PublicFan, ShowEvent, Track, Viewer } from "./types";

const m = (file: string) => `/media/joao-gomes/${file}`;

type Person = { id: string; name: string; handle: string; initial: string; avatar: string | null; club: string };

/** Fãs de exemplo (nomes do pacote). `club` é o slug do fã-clube dele. */
const fan = (id: string, name: string, handle: string, club: string): Person => ({ id, name, handle, initial: name[0], avatar: null, club });

export const joaoGomesFans: Person[] = [
  fan("u-malu", "Malu S.", "@malu.jg", "forrozeiros-pe"),
  fan("u-caio", "Caio R.", "@caio.jg", "forrozeiros-ba"),
  fan("u-bia", "Bia L.", "@bia.jg", "forrozeiros-sp"),
];

const byId = (id: string) => joaoGomesFans.find((f) => f.id === id)!;

export const joaoGomesClubs: FanClub[] = [
  { id: "joaoGomesc1", slug: "oficial", name: "Fã-clube oficial João Gomes", description: "Fã-clube do João no Brasil inteiro.", city: "", isMaster: true, status: "active", members: 48210, avatar: null, owner: null, joined: true, myRole: null },
  { id: "joaoGomesc2", slug: "forrozeiros-pe", name: "Forrozeiros PE", description: "Fã-clube do João · Recife. Descrição de exemplo.", city: "Recife", isMaster: false, status: "active", members: 6320, avatar: null, owner: null, joined: true, myRole: null },
  { id: "joaoGomesc3", slug: "forrozeiros-ba", name: "Forrozeiros BA", description: "Fã-clube do João · Salvador. Descrição de exemplo.", city: "Salvador", isMaster: false, status: "active", members: 4875, avatar: null, owner: { name: "Caio R.", handle: "@caio.jg" }, joined: false, myRole: null },
  { id: "joaoGomesc4", slug: "forrozeiros-sp", name: "SP Forrozeiros", description: "Fã-clube do João · São Paulo. Descrição de exemplo.", city: "São Paulo", isMaster: false, status: "active", members: 2140, avatar: null, owner: { name: "Bia L.", handle: "@bia.jg" }, joined: false, myRole: null },
];

const clubOf = (slug: string) => {
  const c = joaoGomesClubs.find((x) => x.slug === slug)!;
  return { slug: c.slug, name: c.name, avatar: c.avatar ?? null, isMaster: c.isMaster };
};

const official = { name: "João Gomes", handle: "Artista", initial: "J", official: true };

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
    author: { name: f.name, handle: f.handle, initial: f.initial, id: f.id, avatar: f.avatar, verified: joaoGomesClubs.some((c) => c.owner?.handle === f.handle) },
    timeLabel,
    text,
    club: clubOf(f.club),
    likes: n[0],
    comments: n[1],
    reposts: n[2],
    ...extra,
  };
};

export const joaoGomesPosts: Post[] = [
  {
    id: "joaoGomesd1",
    kind: "drop",
    author: official,
    timeLabel: "19/04",
    text: "Meu Piseiro Brasileiro (Ao Vivo) tá em todas as plataformas: 22 faixas gravadas nos Arcos da Lapa, no Rio.",
    likes: 214000,
    comments: 11800,
    reposts: 26400,
  },
  {
    id: "joaoGomesd2",
    kind: "drop",
    author: official,
    timeLabel: "Mural",
    text: "\"Eu devo a minha vida a vocês que me abraçaram.\"",
    likes: 268000,
    comments: 14100,
    reposts: 33700,
  },
  {
    id: "joaoGomesd3",
    kind: "drop",
    author: { ...official, name: "Fanzone" },
    timeLabel: "ontem",
    text: "Manda a foto dos forrozeiros no próximo show. As melhores entram no Mural.",
    likes: 9300,
    comments: 1500,
    reposts: 820,
  },
  galera("joaoGomesg1", "u-malu", "há 12 min", "Ingresso pra Salvador garantido. Quem dos forrozeiros vai, bora marcar o ponto de encontro.", [231, 64, 14], {
    quote: "A Turnê Dominguinho chega a Salvador: 28 de novembro, na Arena Fonte Nova.",
  }),
  galera("joaoGomesg2", "u-caio", "há 1 h", "Vi o DVD da Lapa de novo. Quando ele fala \"Calma, gente! Que vai começar o piseiro\" eu arrepio.", [147, 31, 6]),
  galera("joaoGomesg3", "u-bia", "há 3 h", "Alguém sabe o local do show de São Paulo em janeiro? Ainda não saiu.", [62, 35, 2]),
];

/** Agenda: datas do pacote (pack.json > events, fontes em src); horários, status e brindes de exemplo. */
export const joaoGomesEvents: ShowEvent[] = [
  { id: "salvador-1128", date: "2026-11-28", weekday: "SÁB", day: "28", month: "NOV", monthKey: "nov", city: "Salvador", venue: "Turnê Dominguinho · Arena Fonte Nova", time: "21h", address: "Arena Fonte Nova, Salvador · BA", doorsOpen: "18h", ageRating: "Livre", lineup: "João Gomes e convidados", giftsCount: 4, status: "last_batches", ticketingName: "Ingresse", ticketingUrl: "https://www.ingresse.com/" },
  { id: "bh-1205", date: "2026-12-05", weekday: "SÁB", day: "05", month: "DEZ", monthKey: "dez", city: "Belo Horizonte", venue: "Turnê Dominguinho · Esplanada do Mineirão", time: "21h", address: "Esplanada do Mineirão, Belo Horizonte · MG", doorsOpen: "16h", ageRating: "Livre", lineup: "João Gomes e convidados", giftsCount: 4, status: "on_sale", ticketingName: "Ingresse", ticketingUrl: "https://www.ingresse.com/" },
  { id: "recife-1206", date: "2026-12-06", weekday: "DOM", day: "06", month: "DEZ", monthKey: "dez", city: "Recife", venue: "Turnê Dominguinho · Classic Hall", time: "21h", address: "Classic Hall, Recife · PE", doorsOpen: "18h", ageRating: "Livre", lineup: "João Gomes e convidados", giftsCount: 4, status: "on_sale", ticketingName: "Ingresse", ticketingUrl: "https://www.ingresse.com/" },
  { id: "goiania-1219", date: "2026-12-19", weekday: "SÁB", day: "19", month: "DEZ", monthKey: "dez", city: "Goiânia", venue: "Turnê Dominguinho · Estádio Olímpico", time: "21h", address: "Estádio Olímpico, Goiânia · GO", doorsOpen: "18h", ageRating: "Livre", lineup: "João Gomes e convidados", giftsCount: 0, status: "on_sale", ticketingName: "Ingresse", ticketingUrl: "https://www.ingresse.com/" },
  { id: "guarapari-0101", date: "2027-01-01", weekday: "SEX", day: "01", month: "JAN", monthKey: "jan", city: "Guarapari", venue: "Turnê Dominguinho · P12 Guarapari", time: "21h", address: "P12 Guarapari, Guarapari · ES", doorsOpen: "18h", ageRating: "Livre", lineup: "João Gomes e convidados", giftsCount: 0, status: "on_sale", ticketingName: "Ingresse", ticketingUrl: "https://www.ingresse.com/" },
  { id: "joaopessoa-0108", date: "2027-01-08", weekday: "SEX", day: "08", month: "JAN", monthKey: "jan", city: "João Pessoa", venue: "Turnê Dominguinho · Lovina", time: "21h", address: "Lovina, João Pessoa · PB", doorsOpen: "18h", ageRating: "Livre", lineup: "João Gomes e convidados", giftsCount: 0, status: "on_sale", ticketingName: "Ingresse", ticketingUrl: "https://www.ingresse.com/" },
  { id: "sp-0116", date: "2027-01-16", weekday: "SÁB", day: "16", month: "JAN", monthKey: "jan", city: "São Paulo", venue: "Turnê Dominguinho · Local a confirmar", time: "21h", address: "Local a confirmar, São Paulo · SP", doorsOpen: "18h", ageRating: "Livre", lineup: "João Gomes e convidados", giftsCount: 4, status: "on_sale", ticketingName: "Ingresse", ticketingUrl: "https://www.ingresse.com/" },
  { id: "brasilia-0123", date: "2027-01-23", weekday: "SÁB", day: "23", month: "JAN", monthKey: "jan", city: "Brasília", venue: "Turnê Dominguinho · Arena BRB Mané Garrincha", time: "21h", address: "Arena BRB Mané Garrincha, Brasília · DF", doorsOpen: "18h", ageRating: "Livre", lineup: "João Gomes e convidados", giftsCount: 0, status: "on_sale", ticketingName: "Ingresse", ticketingUrl: "https://www.ingresse.com/" },
  { id: "curitiba-0131", date: "2027-01-31", weekday: "DOM", day: "31", month: "JAN", monthKey: "jan", city: "Curitiba", venue: "Turnê Dominguinho · Pedreira Paulo Leminski", time: "21h", address: "Pedreira Paulo Leminski, Curitiba · PR", doorsOpen: "18h", ageRating: "Livre", lineup: "João Gomes e convidados", giftsCount: 0, status: "on_sale", ticketingName: "Ingresse", ticketingUrl: "https://www.ingresse.com/" },
  { id: "lisboa-0227", date: "2027-02-27", weekday: "SÁB", day: "27", month: "FEV", monthKey: "fev", city: "Lisboa", venue: "Dominguinho na Europa · Sagres Campo Pequeno", time: "21h", address: "Sagres Campo Pequeno, Lisboa · PT", doorsOpen: "18h", ageRating: "Livre", lineup: "João Gomes e convidados", giftsCount: 0, status: "on_sale" },
];

/** Loja do JG: produtos do pacote (fotos em public/media/joao-gomes; preços de exemplo). */
const product = (id: string, name: string, category: Product["category"], cents: number, soldOut = false): Product => ({
  id,
  name,
  category,
  priceLabel: `R$ ${(cents / 100).toFixed(0).replace(".", ",")}`,
  priceCents: cents,
  color: "#F7F4D7",
  soldOut,
});

export const joaoGomesProducts: Product[] = [
  product("caneca-dominguinho", "Caneca Esmaltada Dominguinho", "acessorios", 9900),
  product("bolsa-dois-sois", "Bolsa Dois Sóis", "acessorios", 12900),
  product("chaveiro-croche", "Chaveiro de Crochê", "acessorios", 4900),
  product("pin-dois-sois", "Pin Dois Sóis", "acessorios", 5900),
  product("pin-sol", "Pin Sol de Dominguinho", "acessorios", 5900),
  product("kit-3-pins", "Kit 3 Pins", "acessorios", 19900),
  product("camiseta-sol-terracota", "Camiseta Sol Terracota", "roupas", 15900),
  product("camiseta-xilogravura-mostarda", "Camiseta Xilogravura Mostarda", "roupas", 16900),
  product("camiseta-clima-oliva", "Camiseta Clima de Dominguinho Oliva", "roupas", 13900),
  product("moletom-estonado-chumbo", "Moletom Estonado Chumbo", "roupas", 23900),
  product("bone-sol", "Boné Sol de Dominguinho", "acessorios", 12900, true),
];

export const joaoGomesProductImages: Record<string, MediaImage> = {
  "caneca-dominguinho": { src: m("caneca-esmaltada-dominguinho.jpg"), alt: "Caneca esmaltada com o logo Dominguinho" },
  "bolsa-dois-sois": { src: m("bolsa-dois-sois.jpg"), alt: "Bolsa com a estampa Dois Sóis" },
  "chaveiro-croche": { src: m("chaveiro-croche-sol.jpg"), alt: "Chaveiro de crochê em forma de sol" },
  "pin-dois-sois": { src: m("pin-dois-sois.jpg"), alt: "Pin esmaltado Dois Sóis" },
  "pin-sol": { src: m("pin-sol-de-dominguinho.jpg"), alt: "Pin esmaltado do sol de Dominguinho" },
};

/** Drops Hits: lançamentos do pacote (pack.json > drops); votos de exemplo. */
export const joaoGomesTracks: Track[] = [
  { id: "joaoGomest1", num: "01", title: "Devolva-Me", meta: "Feat. · Zé Vaqueiro, João Gomes · ao vivo em Belém", votes: 18420, releaseLabel: "04/11/2026 · 2:38", durationSec: 30 },
  { id: "joaoGomest2", num: "02", title: "Tempo Perdido", meta: "Feat. · Zé Vaqueiro, João Gomes · ao vivo em Belém", votes: 12730, releaseLabel: "04/11/2026 · 3:58", durationSec: 30 },
  { id: "joaoGomest3", num: "03", title: "Reizado", meta: "Feat. · Fagner, João Gomes", votes: 9904, releaseLabel: "13/08/2026 · 3:14", durationSec: 30 },
  { id: "joaoGomest4", num: "04", title: "Vá Embora", meta: "Feat. · Luiz Lins, João Gomes", votes: 8611, releaseLabel: "21/07/2026 · 3:30", durationSec: 30 },
];

/** Roleta (pack.json > prizes). */
export const joaoGomesPrizes: Prize[] = [
  { id: "joaoGomesp1", label: "Pin Sol" },
  { id: "joaoGomesp2", label: "Pin Dois Sóis" },
  { id: "joaoGomesp3", label: "Chaveiro" },
  { id: "joaoGomesp4", label: "Caneca" },
  { id: "joaoGomesp5", label: "Bolsa" },
  { id: "joaoGomesp6", label: "Camiseta" },
  { id: "joaoGomesp7", label: "Ingresso" },
  { id: "joaoGomesp8", label: "Tente de novo", isRetry: true },
];

const me = byId("u-malu");
export const joaoGomesViewer: Viewer = {
  name: me.name,
  handle: me.handle,
  initial: me.initial,
  avatar: me.avatar,
  luckPoints: 1240,
  spins: 3,
  pendingGifts: 2,
  isMember: false,
  clubs: ["oficial", "forrozeiros-pe"],
};

/** Perfil público de um fã de exemplo (abre pelo nome no post). */
export function joaoGomesPublicFan(id: string): PublicFan | null {
  const i = joaoGomesFans.findIndex((f) => f.id === id);
  if (i < 0) return null;
  const f = joaoGomesFans[i];
  return {
    id: f.id,
    name: f.name,
    handle: f.handle,
    avatar: f.avatar,
    club: (({ slug, name, avatar }) => ({ slug, name, avatar }))(clubOf(f.club)),
    points: 2400 - i * 170,
    rank: i + 1,
    isMe: f.id === "u-malu",
    posts: joaoGomesPosts.filter((p) => p.author.id === f.id),
  };
}
