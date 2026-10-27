/**
 * Regras e formatos do chat privado, usados no servidor e no navegador.
 * O back valida de novo (docs/chat-api.md do back); aqui é para avisar antes de enviar.
 */

export const CHAT_MAX = 1000;

/** Quantas mensagens a conversa carrega por vez (ao abrir e a cada "Carregar anteriores"). */
export const CHAT_PAGE = 50;

export const CHAT_TEXT_ONLY = "Só texto. Fotos e vídeos não são permitidos.";

// Mesma regra do back (_MEDIA_URL em app/routers/chat.py): link com http(s)://, www. ou barra no caminho que termina
// numa extensão de foto/vídeo, com ou sem ?query/#âncora.
const MEDIA_LINK =
  /(?:https?:\/\/|www\.|\S\/)\S*\.(?:jpe?g|png|gif|webp|heic|heif|bmp|svg|avif|tiff?|mp4|mov|webm|m4v|avi|mkv|3gp)(?:[?#]\S*)?(?=$|[\s)\]}>'".,;!])/i;

/** Mensagem de erro se o texto não pode ser enviado, ou null se pode. */
export function chatBodyError(raw: string): string | null {
  const body = raw.trim();
  if (!body) return "Escreva uma mensagem antes de enviar.";
  if (body.length > CHAT_MAX) return `A mensagem passou de ${CHAT_MAX} caracteres. Encurte e envie de novo.`;
  if (/data:/i.test(body) || /\/uploads\//i.test(body) || MEDIA_LINK.test(body))
    return "O chat é só de texto: tire o link de foto ou vídeo e envie de novo.";
  return null;
}

const TZ = "America/Sao_Paulo";
const DAY = 86_400_000;
const dayKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ });

/** Hora da mensagem: "21:14". */
export const chatClock = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });

/** Quando foi a última mensagem, no estilo da lista: "agora", "12 min", "21:14", "ontem", "seg", "12/10". */
export function chatWhen(iso: string | null, now = new Date()): string {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins} min`;
  if (dayKey(d) === dayKey(now)) return chatClock(iso);
  if (dayKey(d) === dayKey(new Date(now.getTime() - DAY))) return "ontem";
  if (diff < 6 * DAY) return d.toLocaleDateString("pt-BR", { timeZone: TZ, weekday: "short" }).replace(".", "");
  return d.toLocaleDateString("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit" });
}

/** Separador de dia dentro da conversa: "Hoje", "Ontem", "12 de outubro". */
export function chatDay(iso: string, now = new Date()): string {
  const d = new Date(iso);
  if (dayKey(d) === dayKey(now)) return "Hoje";
  if (dayKey(d) === dayKey(new Date(now.getTime() - DAY))) return "Ontem";
  return d.toLocaleDateString("pt-BR", { timeZone: TZ, day: "numeric", month: "long" });
}

export const sameChatDay = (a: string, b: string) => dayKey(new Date(a)) === dayKey(new Date(b));
