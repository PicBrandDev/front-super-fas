/**
 * Chat de exemplo (front sem API_URL). Fica na memória do servidor e some ao reiniciar.
 * Quem está vendo é a Marina Costa (u-marina). Depois de cada mensagem enviada a outra
 * pessoa "responde" alguns segundos depois, para o polling da conversa aparecer na demo.
 */
import { chatBodyError } from "./chat";
import { posts } from "./mock";
import type { ChatMessage, ChatUser, Conversation, PublicFan } from "./types";

const ME = "u-marina";

type Fan = ChatUser & Pick<PublicFan, "club" | "points" | "rank">;

const fans: Fan[] = [
  { id: ME, name: "Marina Costa", handle: "@marina.c", avatar: null, club: { slug: "oficial", name: "Fã clube oficial Vintage Culture", avatar: null }, points: 420, rank: 18 },
  { id: "u-ana", name: "Ana Ribeiro", handle: "@ana.vc", avatar: null, club: { slug: "fa-clube-sp", name: "Fã Clube Vintage SP", avatar: null }, points: 1280, rank: 4 },
  { id: "u-lucas", name: "Lucas M.", handle: "@lucas_house", avatar: null, club: { slug: "oficial", name: "Fã clube oficial Vintage Culture", avatar: null }, points: 610, rank: 11 },
  { id: "u-bia", name: "Bia Santos", handle: "@bia.santos", avatar: null, club: null, points: null, rank: null },
];

const replies = [
  "Fechado! Te chamo quando sair de casa.",
  "Boa, combinado então.",
  "Sim, essa track é muito boa.",
  "Vou ver aqui e te falo.",
];

type Store = {
  convs: { id: number; with: string }[];
  msgs: ChatMessage[];
  pending: { convId: number; at: number; body: string }[];
  nextConv: number;
  nextMsg: number;
  turn: number;
};

function seed(): Store {
  const now = Date.now();
  const ago = (min: number) => new Date(now - min * 60_000).toISOString();
  const msgs: ChatMessage[] = [];
  let id = 100;
  const add = (convId: number, from: string, body: string, min: number, read = true) =>
    msgs.push({ id: ++id, conversationId: convId, senderId: from, body, createdAt: ago(min), readAt: read ? ago(min - 1) : null, mine: from === ME });
  add(3, "u-bia", "Oi! Vi teu post do Instagram, de onde foi aquela foto?", 60 * 50);
  add(3, ME, "Foi no show de BH ano passado, lá de cima do camarote.", 60 * 49);
  add(2, "u-lucas", "Ouviu a prévia nova no Drops Hits?", 60 * 26);
  add(2, ME, "Ouvi! Aquele drop no minuto 2 é absurdo.", 60 * 25);
  add(2, ME, "Já tô contando os dias pro Rio.", 60 * 25 - 2, false);
  add(1, ME, "Ana, vi teu post da caravana. Ainda tem vaga?", 34);
  add(1, "u-ana", "Tem sim! A gente sai do ABC às 20h.", 21, false);
  add(1, "u-ana", "Bora? Te coloco no grupo da caravana.", 19, false);
  return {
    convs: [
      { id: 1, with: "u-ana" },
      { id: 2, with: "u-lucas" },
      { id: 3, with: "u-bia" },
    ],
    msgs,
    pending: [],
    nextConv: 4,
    nextMsg: id + 1,
    turn: 0,
  };
}

// Em globalThis para páginas e server actions verem o mesmo estado.
const g = globalThis as unknown as { __fcChat?: Store };
const store = () => (g.__fcChat ??= seed());

/** Entrega as respostas de exemplo que já "chegaram". */
function flush(s: Store) {
  const now = Date.now();
  s.pending = s.pending.filter((p) => {
    if (p.at > now) return true;
    const other = s.convs.find((c) => c.id === p.convId)?.with ?? "";
    const at = new Date(p.at).toISOString();
    // A outra pessoa leu o que você mandou antes de responder.
    for (const m of s.msgs) if (m.conversationId === p.convId && m.mine && !m.readAt) m.readAt = at;
    s.msgs.push({ id: s.nextMsg++, conversationId: p.convId, senderId: other, body: p.body, createdAt: at, readAt: null, mine: false });
    return false;
  });
}

const user = (id: string): ChatUser => {
  const f = fans.find((x) => x.id === id);
  return f ? { id: f.id, name: f.name, handle: f.handle, avatar: f.avatar } : { id, name: "Fã", handle: null, avatar: null };
};

function toConversation(s: Store, c: { id: number; with: string }): Conversation {
  const list = s.msgs.filter((m) => m.conversationId === c.id);
  const last = list[list.length - 1] ?? null;
  return {
    id: c.id,
    other: user(c.with),
    lastMessage: last,
    lastMessageAt: last?.createdAt ?? null,
    unread: list.filter((m) => !m.mine && !m.readAt).length,
  };
}

export function listConversations(): Conversation[] {
  const s = store();
  flush(s);
  return s.convs
    .map((c) => toConversation(s, c))
    .filter((c) => c.lastMessage)
    .sort((a, b) => (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? ""));
}

export function getConversation(id: number): Conversation | null {
  const s = store();
  flush(s);
  const c = s.convs.find((x) => x.id === id);
  return c ? toConversation(s, c) : null;
}

/** Abre (ou reaproveita) a conversa com a pessoa. Erro igual ao do back: 422 para você mesmo, 404 sem a pessoa. */
export function openWith(userId: string): { ok: true; id: number } | { ok: false; error: string; status: number } {
  if (userId === ME) return { ok: false, error: "Você não pode abrir uma conversa com você mesmo.", status: 422 };
  if (!fans.some((f) => f.id === userId)) return { ok: false, error: "Esse fã não foi encontrado.", status: 404 };
  const s = store();
  let c = s.convs.find((x) => x.with === userId);
  if (!c) {
    c = { id: s.nextConv++, with: userId };
    s.convs.push(c);
  }
  return { ok: true, id: c.id };
}

export function listMessages(convId: number, afterId?: number, limit = 50): ChatMessage[] | null {
  const s = store();
  flush(s);
  if (!s.convs.some((c) => c.id === convId)) return null;
  const list = s.msgs.filter((m) => m.conversationId === convId);
  return afterId ? list.filter((m) => m.id > afterId).slice(0, limit) : list.slice(-limit);
}

/** As `limit` mensagens anteriores a `beforeId` (histórico), da mais antiga para a mais nova. */
export function olderMessages(convId: number, beforeId: number, limit = 50): ChatMessage[] | null {
  const s = store();
  if (!s.convs.some((c) => c.id === convId)) return null;
  return s.msgs.filter((m) => m.conversationId === convId && m.id < beforeId).slice(-limit);
}

export function sendMessage(convId: number, raw: string): { ok: true; data: ChatMessage } | { ok: false; error: string; status: number } {
  const s = store();
  if (!s.convs.some((c) => c.id === convId)) return { ok: false, error: "Essa conversa não existe mais.", status: 404 };
  const error = chatBodyError(raw);
  if (error) return { ok: false, error, status: 422 };
  const data: ChatMessage = { id: s.nextMsg++, conversationId: convId, senderId: ME, body: raw.trim(), createdAt: new Date().toISOString(), readAt: null, mine: true };
  s.msgs.push(data);
  if (!s.pending.some((p) => p.convId === convId)) s.pending.push({ convId, at: Date.now() + 4000, body: replies[s.turn++ % replies.length] });
  return { ok: true, data };
}

export function markRead(convId: number) {
  const s = store();
  const now = new Date().toISOString();
  for (const m of s.msgs) if (m.conversationId === convId && !m.mine && !m.readAt) m.readAt = now;
}

export function unreadCount(): number {
  const s = store();
  flush(s);
  return s.msgs.filter((m) => !m.mine && !m.readAt).length;
}

export function publicFan(userId: string): PublicFan | null {
  const f = fans.find((x) => x.id === userId);
  if (!f) return null;
  return { ...f, isMe: f.id === ME, posts: posts.filter((p) => p.author.id === f.id).slice(0, 10) };
}
