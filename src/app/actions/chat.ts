"use server";

import { apiEnabled, fetchJson, send, toChatMessage, type ApiResult } from "@/lib/api";
import { chatBodyError } from "@/lib/chat";
import * as chatMock from "@/lib/chat-mock";
import type { ChatMessage } from "@/lib/types";

/*
 * Chat privado entre fãs (docs/chat-api.md do back). Sem API (modo exemplo) usa o chat de
 * exemplo em memória, para a demo funcionar igual. Polling não revalida páginas.
 */

const slugOk = (s: string) => /^[a-z0-9-]+$/.test(s);
const userOk = (s: string) => /^[A-Za-z0-9_-]{1,64}$/.test(s);
const convOk = (n: number) => Number.isInteger(n) && n > 0;
const bad = <T,>(): ApiResult<T> => ({ ok: false, error: "Pedido inválido.", status: 400 });
const base = (slug: string) => `/artists/${slug}/chat/conversations`;

/** Abre (ou reaproveita) a conversa com outro fã e devolve o id dela. */
export async function startChat(slug: string, userId: string): Promise<ApiResult<{ id: number }>> {
  if (!slugOk(slug) || !userOk(userId)) return bad();
  if (!apiEnabled()) {
    const r = chatMock.openWith(userId);
    return r.ok ? { ok: true, data: { id: r.id } } : r;
  }
  const res = await send<{ id: number }>("POST", base(slug), { userId });
  if (!res.ok) {
    if (res.status === 404) return { ...res, error: "Esse fã não foi encontrado. Volte e tente pelo perfil de novo." };
    return res;
  }
  return { ok: true, data: { id: Number(res.data.id) } };
}

/** Envia uma mensagem de texto. Fotos, vídeos e links de mídia voltam com erro 422. */
export async function sendChatMessage(slug: string, convId: number, body: string): Promise<ApiResult<ChatMessage>> {
  if (!slugOk(slug) || !convOk(convId) || typeof body !== "string") return bad();
  const error = chatBodyError(body);
  if (error) return { ok: false, error, status: 422 };
  if (!apiEnabled()) return chatMock.sendMessage(convId, body);
  const res = await send<Record<string, unknown>>("POST", `${base(slug)}/${convId}/messages`, { body: body.trim() });
  return res.ok ? { ok: true, data: toChatMessage(res.data) } : res;
}

/** Mensagens novas depois de `afterId` (polling da conversa). */
export async function pollMessages(slug: string, convId: number, afterId: number): Promise<ApiResult<ChatMessage[]>> {
  if (!slugOk(slug) || !convOk(convId) || !Number.isInteger(afterId) || afterId < 0) return bad();
  if (!apiEnabled()) {
    const list = chatMock.listMessages(convId, afterId, 200);
    return list ? { ok: true, data: list } : { ok: false, error: "Essa conversa não existe mais.", status: 404 };
  }
  const res = await fetchJson<Record<string, unknown>[]>(`${base(slug)}/${convId}/messages?after_id=${afterId}&limit=200`);
  return res.ok ? { ok: true, data: res.data.map(toChatMessage) } : res;
}

/** Marca como lidas as mensagens recebidas na conversa. */
export async function markChatRead(slug: string, convId: number): Promise<boolean> {
  if (!slugOk(slug) || !convOk(convId)) return false;
  if (!apiEnabled()) {
    chatMock.markRead(convId);
    return true;
  }
  return (await send("POST", `${base(slug)}/${convId}/read`)).ok;
}

/** Total de mensagens não lidas (0 sem login ou com erro). */
export async function chatUnread(slug: string): Promise<number> {
  if (!slugOk(slug)) return 0;
  if (!apiEnabled()) return chatMock.unreadCount();
  const res = await fetchJson<{ count?: number }>(`/artists/${slug}/chat/unread`);
  return res.ok ? Number(res.data?.count ?? 0) : 0;
}
