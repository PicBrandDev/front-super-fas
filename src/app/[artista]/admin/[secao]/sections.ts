import type { FieldDef } from "@/components/admin/ResourceManager";

/** Telas de conteúdo do admin do fã clube: cada uma é um CRUD de um recurso da API. */
export type Section = {
  resource: string;
  title: string;
  description: string;
  singular: string;
  feminine?: boolean;
  fields: FieldDef[];
};

export const eventFields: FieldDef[] = [
  { name: "city", label: "Cidade", type: "text", required: true, column: true },
  { name: "date", label: "Data", type: "date", required: true, column: true },
  { name: "time", label: "Horário do show", type: "text", placeholder: "23h", column: true },
  {
    name: "status",
    label: "Situação dos ingressos",
    type: "select",
    column: true,
    options: [
      { value: "on_sale", label: "À venda" },
      { value: "last_batches", label: "Últimos lotes" },
      { value: "soon", label: "Em breve" },
    ],
  },
  { name: "venue", label: "Local", type: "text", placeholder: "Nome da casa / arena" },
  { name: "address", label: "Endereço", type: "text" },
  { name: "doorsOpen", label: "Abertura dos portões", type: "text", placeholder: "21h" },
  { name: "ageRating", label: "Classificação", type: "text", placeholder: "18+" },
  { name: "lineup", label: "Line-up", type: "text", full: true },
];

export const vendorFields: FieldDef[] = [
  { name: "name", label: "Nome", type: "text", required: true, column: true, placeholder: "Ticketeira oficial" },
  {
    name: "tag",
    label: "Tipo",
    type: "select",
    column: true,
    options: [
      { value: "Oficial", label: "Oficial" },
      { value: "Pacote", label: "Pacote" },
      { value: "Excursão", label: "Excursão" },
    ],
  },
  { name: "type", label: "Descrição", type: "text", placeholder: "Ingresso pista e camarote", column: true },
  { name: "priceLabel", label: "Preço", type: "text", placeholder: "a partir de R$ 120" },
  { name: "url", label: "Link de compra", type: "text", placeholder: "https://…" },
  { name: "position", label: "Ordem", type: "number", hint: "Menor aparece primeiro." },
];

export const giftFields: FieldDef[] = [
  { name: "name", label: "Brinde", type: "text", required: true, column: true },
  {
    name: "phase",
    label: "Quando",
    type: "select",
    column: true,
    options: [
      { value: "before", label: "Antes do show" },
      { value: "after", label: "Depois do show" },
    ],
  },
  { name: "qtyLabel", label: "Quantidade", type: "text", placeholder: "10 un.", column: true },
  { name: "position", label: "Ordem", type: "number" },
];

export const sections: Record<string, Section> = {
  mural: {
    resource: "posts",
    title: "Drop News e mural",
    description: "Publique Drop News oficiais e modere o que a galera posta. Posts do tipo Drop News saem com o nome do artista.",
    singular: "post",
    fields: [
      { name: "text", label: "Texto", type: "textarea", required: true, column: true },
      {
        name: "kind",
        label: "Aba",
        type: "select",
        column: true,
        options: [
          { value: "drop", label: "Drop News (oficial)" },
          { value: "galera", label: "Galera" },
          { value: "instagram", label: "Instagram" },
        ],
      },
      { name: "hasImage", label: "Tem foto (mostra o espaço da imagem)", type: "checkbox" },
      { name: "quote", label: "Citação (repost)", type: "text", full: true },
      { name: "likes", label: "Curtidas", type: "number", column: true },
      { name: "comments", label: "Comentários", type: "number" },
      { name: "reposts", label: "Reposts", type: "number" },
    ],
  },
  agenda: {
    resource: "events",
    title: "Agenda e eventos",
    description: "Shows do artista. Em cada show, cadastre onde comprar e os brindes da sorte.",
    singular: "show",
    fields: eventFields,
  },
  pickap: {
    resource: "prizes",
    title: "PicKap e sorteios",
    description: "Fatias da roleta. O sorteio acontece no servidor; fatias com pontos somam nos pontos da sorte do fã.",
    singular: "prêmio",
    fields: [
      { name: "label", label: "Texto da fatia", type: "text", required: true, column: true, placeholder: "Camiseta" },
      { name: "points", label: "Pontos da sorte", type: "number", column: true, hint: "Ex.: 50 para “+50 pts”." },
      { name: "isRetry", label: "É “Tente de novo” (devolve o giro)", type: "checkbox", column: true },
      { name: "position", label: "Ordem na roleta", type: "number", column: true },
    ],
  },
  loja: {
    resource: "products",
    title: "Loja",
    description: "Produtos da loja do fã clube.",
    singular: "produto",
    fields: [
      { name: "name", label: "Nome", type: "text", required: true, column: true },
      {
        name: "category",
        label: "Categoria",
        type: "select",
        column: true,
        options: [
          { value: "roupas", label: "Roupas" },
          { value: "acessorios", label: "Acessórios" },
          { value: "musica", label: "Música" },
        ],
      },
      { name: "priceCents", label: "Preço (R$)", type: "money", column: true, hint: "Em branco mostra “R$ [PREÇO]”." },
      { name: "color", label: "Cor do card", type: "color", column: true },
      { name: "position", label: "Ordem", type: "number" },
    ],
  },
  drops: {
    resource: "tracks",
    title: "Drops Hits",
    description: "Prévias de músicas que os fãs ouvem e votam.",
    singular: "faixa",
    feminine: true,
    fields: [
      { name: "title", label: "Título", type: "text", required: true, column: true },
      { name: "meta", label: "Legenda", type: "text", placeholder: "Prévia nova · esta semana", column: true },
      { name: "releaseLabel", label: "Lançamento", type: "text", placeholder: "12/12" },
      { name: "durationSec", label: "Duração da prévia (segundos)", type: "number" },
      { name: "votes", label: "Votos", type: "number", column: true },
      { name: "position", label: "Ordem", type: "number" },
    ],
  },
  beneficios: {
    resource: "perks",
    title: "Benefícios de membro",
    description: "O que aparece na página “Tornar membro”.",
    singular: "benefício",
    fields: [
      { name: "title", label: "Benefício", type: "text", required: true, column: true },
      { name: "sub", label: "Detalhe", type: "text", column: true },
      { name: "position", label: "Ordem", type: "number" },
    ],
  },
};
