/**
 * Dados de exemplo usados enquanto o back não existe.
 * Tudo que está entre colchetes ([PREÇO], [Local do evento]...) é para
 * ser preenchido com dados reais.
 */
import { vintageTheme } from "./themes";
import type {
  FanClub,
  AdSlot,
  Artist,
  Campaign,
  ClubAdmin,
  Gift,
  HomeAd,
  Member,
  MemberPerk,
  Post,
  Prize,
  Product,
  ShowEvent,
  Sponsor,
  Track,
  Vendor,
  Viewer,
} from "./types";

export const artists: Artist[] = [
  {
    id: "vc",
    slug: "vintage-culture",
    name: "Vintage Culture",
    initial: "V",
    fanClubName: "[Nome do fã clube]",
    instagram: "@vintageculture",
    status: "active",
    theme: vintageTheme,
    memberPriceCents: 1690,
    members: "[n]",
    adSlotsSummary: "2 de 6 ocupadas",
    brandColor: "#FE9900",
  },
];

export const fanClubs: FanClub[] = [
  { id: "fc1", slug: "oficial", name: "Fã clube oficial Vintage Culture", description: "O fã clube master do Vintage Culture.", city: "", isMaster: true, status: "active", members: 1240, owner: { name: "Rafa Lima" }, joined: true, myRole: null },
  { id: "fc2", slug: "fa-clube-sp", name: "Fã Clube Vintage SP", description: "Caravanas e encontros antes dos shows.", city: "São Paulo", isMaster: false, status: "active", members: 312, owner: { name: "Bia Santos" }, joined: true, myRole: null },
  { id: "fc3", slug: "vintage-rio", name: "Vintage Rio", description: "Fã clube carioca.", city: "Rio de Janeiro", isMaster: false, status: "active", members: 188, owner: { name: "Caio Duarte" }, joined: false, myRole: null },
];

export const viewer: Viewer = {
  name: "Marina Costa",
  handle: "@marina.c",
  initial: "M",
  luckPoints: 1240,
  spins: 3,
  pendingGifts: 2,
  isMember: false,
  clubs: ["oficial", "fa-clube-sp"],
};

export const otherFandoms = ["[Outro artista]", "[Outro artista]"];

export const posts: Post[] = [
  {
    id: "d1",
    kind: "drop",
    author: { name: "Vintage Culture", handle: "Artista", initial: "V", official: true },
    timeLabel: "há 2 h",
    text: "Bastidores da turnê: fotos que só o fã clube vê. Comenta qual foi o seu show favorito.",
    hasImage: true,
    likes: 1832,
    comments: 214,
    reposts: 96,
  },
  {
    id: "d2",
    kind: "drop",
    author: { name: "Vintage Culture", handle: "Artista", initial: "V", official: true },
    timeLabel: "ontem",
    text: "Prévia nova liberada no Drops Hits. Ouve de fone e me conta o que achou.",
    likes: 2410,
    comments: 388,
    reposts: 152,
  },
  {
    id: "g1",
    kind: "galera",
    author: { name: "Ana Ribeiro", handle: "@ana.vc", initial: "A" },
    timeLabel: "há 18 min",
    text: "Quem vai no show de São Paulo? Bora montar caravana saindo do ABC.",
    likes: 42,
    comments: 17,
    reposts: 3,
  },
  {
    id: "g2",
    kind: "galera",
    author: { name: "Lucas M.", handle: "@lucas_house", initial: "L" },
    timeLabel: "há 1 h",
    text: "Repostando porque essas fotos estão demais.",
    quote: "Bastidores da turnê: fotos que só o fã clube vê.",
    likes: 88,
    comments: 9,
    reposts: 12,
  },
  {
    id: "i1",
    kind: "instagram",
    author: { name: "Marina Costa", handle: "@marina.c", initial: "M" },
    timeLabel: "há 3 h",
    text: "Trouxe esse post do Instagram dele pra galera comentar aqui.",
    likes: 301,
    comments: 45,
    reposts: 20,
  },
];

export const events: ShowEvent[] = [
  { id: "sp-07-nov", weekday: "SÁB", day: "07", month: "NOV", monthKey: "nov", city: "São Paulo", venue: "[Local do evento]", time: "23h", address: "[Endereço]", doorsOpen: "[hora]", ageRating: "[18+]", lineup: "[a definir]", giftsCount: 6, status: "on_sale" },
  { id: "rj-13-nov", weekday: "SEX", day: "13", month: "NOV", monthKey: "nov", city: "Rio de Janeiro", venue: "[Local do evento]", time: "22h", address: "[Endereço]", doorsOpen: "[hora]", ageRating: "[18+]", lineup: "[a definir]", giftsCount: 4, status: "last_batches" },
  { id: "fl-21-nov", weekday: "SÁB", day: "21", month: "NOV", monthKey: "nov", city: "Florianópolis", venue: "[Local do evento]", time: "23h", address: "[Endereço]", doorsOpen: "[hora]", ageRating: "[18+]", lineup: "[a definir]", giftsCount: 5, status: "on_sale" },
  { id: "bh-05-dez", weekday: "SÁB", day: "05", month: "DEZ", monthKey: "dez", city: "Belo Horizonte", venue: "[Local do evento]", time: "22h", address: "[Endereço]", doorsOpen: "[hora]", ageRating: "[18+]", lineup: "[a definir]", giftsCount: 3, status: "soon" },
  { id: "reveillon", weekday: "QUI", day: "31", month: "DEZ", monthKey: "dez", city: "[Réveillon · cidade]", venue: "[Local do evento]", time: "23h59", address: "[Endereço]", doorsOpen: "[hora]", ageRating: "[18+]", lineup: "[a definir]", giftsCount: 8, status: "soon" },
];

export const vendors: Vendor[] = [
  { id: "v1", name: "[Ticketeira oficial]", type: "Ingresso pista e camarote", tag: "Oficial", priceLabel: "a partir de R$ [PREÇO]", url: "#" },
  { id: "v2", name: "[Agência parceira A]", type: "Pacote ingresso + transfer ida e volta", tag: "Pacote", priceLabel: "a partir de R$ [PREÇO]", url: "#" },
  { id: "v3", name: "[Agência parceira B]", type: "Excursão saindo de Campinas", tag: "Excursão", priceLabel: "a partir de R$ [PREÇO]", url: "#" },
  { id: "v4", name: "[Agência parceira C]", type: "Pacote hotel + ingresso", tag: "Pacote", priceLabel: "a partir de R$ [PREÇO]", url: "#" },
];

export const gifts: Gift[] = [
  { id: "b1", name: "Pôster autografado", phase: "before", qtyLabel: "[qtd] un." },
  { id: "b2", name: "+1 giro no PicKup", phase: "before", qtyLabel: "todos" },
  { id: "b3", name: "Kit de adesivos", phase: "before", qtyLabel: "[qtd] un." },
  { id: "a1", name: "Camiseta do show", phase: "after" },
  { id: "a2", name: "Upgrade de setor", phase: "after" },
  { id: "a3", name: "Encontro com o artista", phase: "after" },
];

export const prizes: Prize[] = [
  { id: "p1", label: "Camiseta" },
  { id: "p2", label: "Tente de novo", isRetry: true },
  { id: "p3", label: "+50 pts" },
  { id: "p4", label: "Boné" },
  { id: "p5", label: "Ingresso" },
  { id: "p6", label: "+100 pts" },
  { id: "p7", label: "Vinil" },
  { id: "p8", label: "Pôster" },
];

export const products: Product[] = [
  { id: "p1", name: "Oversized LOST", category: "roupas", priceLabel: "Preço a definir", color: "#E5E5E8" },
  { id: "p2", name: "Oversized Find Create Moments", category: "roupas", priceLabel: "Preço a definir", color: "#E5E5E8" },
  { id: "p3", name: "Camiseta Bootleg", category: "roupas", priceLabel: "Preço a definir", color: "#E5E5E8" },
  { id: "p4", name: "Camiseta 93", category: "roupas", priceLabel: "Preço a definir", color: "#E5E5E8" },
];

export const tracks: Track[] = [
  { id: "t1", num: "01", title: "[Faixa inédita 01]", meta: "Prévia nova · esta semana", votes: 3120, releaseLabel: "[data]", durationSec: 30 },
  { id: "t2", num: "02", title: "[Faixa inédita 02]", meta: "Prévia · semana passada", votes: 2284, releaseLabel: "[data]", durationSec: 30 },
  { id: "t3", num: "03", title: "[Faixa inédita 03]", meta: "Prévia · [data]", votes: 1907, releaseLabel: "[data]", durationSec: 30 },
  { id: "t4", num: "04", title: "[Remix inédito]", meta: "Prévia · [data]", votes: 1350, releaseLabel: "[data]", durationSec: 30 },
];

export const homeAd: HomeAd = {
  sponsor: "[Marca patrocinadora]",
  title: "[Título do anúncio]",
  text: "[Texto curto do anúncio]",
  cta: "[Chamada]",
  url: "#",
};

export const memberPerks: MemberPerk[] = [
  { title: "Drop News exclusivos", sub: "Bastidores e notícias só para membros" },
  { title: "Giros extras no PicKup", sub: "+[n] giros todo mês" },
  { title: "Prioridade na sorte dos eventos", sub: "Mais chances nos brindes de cada show" },
  { title: "Desconto na Loja Vintage", sub: "[x]% em todos os produtos" },
  { title: "Drops Hits antes de todo mundo", sub: "Prévias liberadas primeiro para você" },
  { title: "Selo de membro no mural", sub: "Seu perfil com a marca do fã clube" },
];

export const adSlots: AdSlot[] = [
  { id: "home", name: "Card da Home", where: "Início · logo acima do Drop News", format: "Arte + título + texto + link", priceLabel: "R$ [PREÇO] / semana", occupied: true, active: true, diagram: { top: 20, height: 16 } },
  { id: "mural", name: "Post patrocinado no Mural", where: "Mural · post pequeno entre os cartazes, a cada 4", format: "Miniatura + título + link", priceLabel: "R$ [PREÇO] / semana", occupied: false, active: true, diagram: { top: 28, height: 24 } },
  { id: "evento", name: "Patrocínio de evento", where: "Tela do evento · faixa acima de Onde comprar", format: "Logo + texto + link", priceLabel: "R$ [PREÇO] / semana", occupied: false, active: true, diagram: { top: 58, height: 12 } },
  { id: "pickup", name: "Prêmio patrocinado no PicKup", where: "Roleta · uma fatia com a marca e o prêmio", format: "Logo + prêmio ou cupom", priceLabel: "R$ [PREÇO] / semana", occupied: true, active: true, diagram: { top: 18, height: 44 } },
  { id: "loja", name: "Banner da Loja", where: "Loja Vintage · topo da página", format: "Banner 16:9 + link", priceLabel: "R$ [PREÇO] / semana", occupied: false, active: true, diagram: { top: 16, height: 20 } },
  { id: "drops", name: "“Apresenta” no Drops Hits", where: "Player de prévias · “[Marca] apresenta”", format: "Logo", priceLabel: "R$ [PREÇO] / semana", occupied: false, active: true, diagram: { top: 22, height: 10 } },
  { id: "entrada", name: "Anúncio de entrada", where: "Ao abrir o app · janela depois do login", format: "Arte + título + texto + botão", priceLabel: "R$ [PREÇO] / semana", occupied: false, active: true, diagram: { top: 50, height: 34 } },
  { id: "pickup_video", name: "Vídeo antes do giro", where: "PicKup · vídeo de 30 s antes de girar a roleta", format: "Vídeo 30 s + botão", priceLabel: "R$ [PREÇO] / semana", occupied: false, active: true, diagram: { top: 4, height: 84 } },
  { id: "pickup_resgate", name: "Anúncio no resgate do prêmio", where: "PicKup · janela depois de ganhar na roleta", format: "Arte + título + texto + botão", priceLabel: "R$ [PREÇO] / semana", occupied: false, active: true, diagram: { top: 50, height: 34 } },
];

export const campaigns: Campaign[] = [
  { id: "c1", sponsor: "[Marca A]", slotName: "Card da Home", title: "[Título do anúncio]", period: "[início] – [fim]", status: "live" },
  { id: "c2", sponsor: "[Marca B]", slotName: "Prêmio patrocinado no PicKup", title: "[Prêmio patrocinado]", period: "[início] – [fim]", status: "live" },
  { id: "c3", sponsor: "[Marca C]", slotName: "Post patrocinado no Mural", title: "[Título do anúncio]", period: "[início] – [fim]", status: "pending" },
  { id: "c4", sponsor: "[Marca D]", slotName: "Banner da Loja", title: "[Título do anúncio]", period: "[início] – [fim]", status: "pending" },
];

export const sponsors: Sponsor[] = [
  { id: "s1", brand: "[Marca A]", email: "contato@marca-a.com", campaigns: 1, status: "active" },
  { id: "s2", brand: "[Marca B]", email: "contato@marca-b.com", campaigns: 1, status: "active" },
  { id: "s3", brand: "[Marca C]", email: "contato@marca-c.com", campaigns: 1, status: "active" },
  { id: "s4", brand: "[Marca D]", email: "contato@marca-d.com", campaigns: 1, status: "active" },
];

export const clubAdmins: ClubAdmin[] = [
  { name: "Rafa Lima", role: "Dono do fã clube" },
  { name: "Bia Santos", role: "Moderação" },
  { name: "Caio Duarte", role: "Conteúdo e Drop News" },
  { name: "Lu Ferreira", role: "Agenda e eventos" },
  { name: "Téo Martins", role: "Loja Vintage" },
  { name: "Nina Rocha", role: "PicKup e sorteios" },
  { name: "Duda Alves", role: "Photo Finder" },
];

export const members: Member[] = [
  { id: "m1", name: "Marina Costa", handle: "@marina.c", status: "active", since: "20/10/2026", payment: "Pix", points: 1240, city: "São Paulo" },
  { id: "m2", name: "Ana Ribeiro", handle: "@ana.vc", status: "active", since: "02/03/2026", payment: "Cartão", points: 980, city: "Santo André" },
  { id: "m3", name: "Lucas Moreira", handle: "@lucas_house", status: "active", since: "15/01/2026", payment: "Cartão", points: 2310, city: "Campinas" },
  { id: "m4", name: "Júlia Prado", handle: "@juprado", status: "pending", since: "28/07/2026", payment: "Cartão", points: 410, city: "Rio de Janeiro" },
  { id: "m5", name: "Pedro Antunes", handle: "@pedroant", status: "active", since: "11/05/2026", payment: "Pix", points: 760, city: "Florianópolis" },
  { id: "m6", name: "Carla Nunes", handle: "@carlanunes", status: "canceled", since: "09/02/2026", payment: "Pix", points: 150, city: "Belo Horizonte" },
  { id: "m7", name: "Gabriel Sato", handle: "@gsato", status: "active", since: "30/06/2026", payment: "Cartão", points: 1580, city: "São Paulo" },
  { id: "m8", name: "Larissa Dias", handle: "@lari.dias", status: "active", since: "18/08/2026", payment: "Pix", points: 620, city: "Curitiba" },
  { id: "m9", name: "Thiago Rocha", handle: "@thirocha", status: "pending", since: "04/09/2026", payment: "Pix", points: 90, city: "Niterói" },
  { id: "m10", name: "Beatriz Lemos", handle: "@bialemos", status: "active", since: "22/04/2026", payment: "Cartão", points: 1120, city: "Porto Alegre" },
];
