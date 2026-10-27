"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ClipboardEvent, type DragEvent, type FormEvent, type KeyboardEvent } from "react";
import { markChatRead, pollMessages, sendChatMessage } from "@/app/actions/chat";
import { useArtist } from "@/components/fan/ArtistContext";
import { Icon } from "@/components/icons";
import { CHAT_MAX, CHAT_TEXT_ONLY, chatBodyError, chatClock, chatDay, sameChatDay } from "@/lib/chat";
import type { ChatMessage, Conversation } from "@/lib/types";
import { ChatAvatar } from "./ChatAvatar";
import { refreshChatUnread } from "./useChatUnread";

/*
 * Conversa privada entre dois fãs. Ocupa a tela inteira no celular (fixa e presa ao
 * teclado pelo visualViewport), então funciona com ou sem a top bar e o menu de baixo.
 * No desktop vira uma coluna da altura da janela ao lado do menu lateral.
 * Polling de 3 s com after_id; para quando a aba fica escondida.
 */

const POLL_MS = 3000;
const NEAR_BOTTOM = 96;
const GROUP_MS = 5 * 60_000;

type Local = { key: string; body: string; createdAt: string; status: "sending" | "failed" };
type Gone = "gone" | "login" | null;

const byId = (a: ChatMessage, b: ChatMessage) => a.id - b.id;

function merge(prev: ChatMessage[], add: ChatMessage[]): ChatMessage[] {
  if (!add.length) return prev;
  const map = new Map(prev.map((m) => [m.id, m]));
  for (const m of add) map.set(m.id, m);
  return [...map.values()].sort(byId);
}

/** De onde buscar: depois da última, mas desde a minha última ainda não lida (para o "Lida" aparecer). */
function cursorOf(list: ChatMessage[]): number {
  let last = 0;
  let lastMine: ChatMessage | null = null;
  for (const m of list) {
    if (m.id > last) last = m.id;
    if (m.mine && (!lastMine || m.id > lastMine.id)) lastMine = m;
  }
  if (lastMine && !lastMine.readAt) return Math.max(0, Math.min(last, lastMine.id - 1));
  return last;
}

const finePointer = () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
const calm = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function SendIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" />
    </svg>
  );
}

export function ChatThread({ conversation, initial }: { conversation: Conversation; initial: ChatMessage[] }) {
  const { slug, base } = useArtist();
  const convId = conversation.id;
  const other = conversation.other;
  const firstName = other.name.split(" ")[0] || other.name;

  const [messages, setMessages] = useState<ChatMessage[]>(() => [...initial].sort(byId));
  const [locals, setLocals] = useState<Local[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [gone, setGone] = useState<Gone>(null);
  const [offline, setOffline] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [unseen, setUnseen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLOListElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const msgsRef = useRef(messages);
  const atBottom = useRef(true);
  const forceBottom = useRef(true);
  const busy = useRef(false);
  const stopped = useRef(false);
  const fails = useRef(0);
  const seq = useRef(0);
  const blockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    msgsRef.current = messages;
  }, [messages]);

  const markRead = useCallback(async () => {
    if (await markChatRead(slug, convId).catch(() => false)) void refreshChatUnread();
  }, [slug, convId]);

  const stop = useCallback((why: Exclude<Gone, null>) => {
    stopped.current = true;
    setGone(why);
  }, []);

  const poll = useCallback(async () => {
    if (busy.current || stopped.current) return;
    busy.current = true;
    try {
      const res = await pollMessages(slug, convId, cursorOf(msgsRef.current));
      if (res.ok) {
        fails.current = 0;
        setOffline(false);
        const known = new Set(msgsRef.current.map((m) => m.id));
        const fresh = res.data.filter((m) => !known.has(m.id));
        if (res.data.length) setMessages((prev) => merge(prev, res.data));
        if (fresh.some((m) => !m.mine)) {
          void markRead();
          if (!atBottom.current) setUnseen(true);
        }
      } else if (res.status === 401) stop("login");
      else if (res.status === 403 || res.status === 404) stop("gone");
      else if (++fails.current >= 2) setOffline(true);
    } catch {
      if (++fails.current >= 2) setOffline(true);
    } finally {
      busy.current = false;
    }
  }, [slug, convId, markRead, stop]);

  // Lê a conversa ao abrir e mantém o polling (só com a aba visível).
  useEffect(() => {
    void markRead();
    const tick = () => {
      if (document.visibilityState === "visible") void poll();
    };
    const id = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [markRead, poll]);

  // Prende a conversa à área visível: com o teclado aberto o composer fica logo acima dele.
  useEffect(() => {
    const vv = window.visualViewport;
    const el = rootRef.current;
    if (!vv || !el) return;
    const fit = () => {
      el.style.setProperty("--vvh", `${Math.round(vv.height)}px`);
      el.style.setProperty("--vvt", `${Math.round(vv.offsetTop)}px`);
      el.dataset.kb = window.innerHeight - vv.height > 120 ? "1" : "0";
      const sc = scrollerRef.current;
      if (sc && atBottom.current) sc.scrollTop = sc.scrollHeight;
    };
    fit();
    vv.addEventListener("resize", fit);
    vv.addEventListener("scroll", fit);
    return () => {
      vv.removeEventListener("resize", fit);
      vv.removeEventListener("scroll", fit);
    };
  }, []);

  // Mensagem nova: desce até ela se a pessoa já estava no fim (ou se fui eu que mandei).
  useLayoutEffect(() => {
    const sc = scrollerRef.current;
    if (!sc) return;
    if (forceBottom.current || atBottom.current) {
      sc.scrollTop = sc.scrollHeight;
      forceBottom.current = false;
      atBottom.current = true;
    }
  }, [messages, locals]);

  useEffect(
    () => () => {
      if (blockTimer.current) clearTimeout(blockTimer.current);
    },
    [],
  );

  const onScroll = () => {
    const sc = scrollerRef.current;
    if (!sc) return;
    atBottom.current = sc.scrollHeight - sc.scrollTop - sc.clientHeight < NEAR_BOTTOM;
    if (atBottom.current && unseen) setUnseen(false);
  };

  const jumpToEnd = () => {
    const sc = scrollerRef.current;
    if (sc) sc.scrollTo({ top: sc.scrollHeight, behavior: calm() ? "auto" : "smooth" });
    setUnseen(false);
  };

  const fitInput = () => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight + 2, 132)}px`;
  };

  const deliver = async (local: Local) => {
    setLocals((ls) => ls.map((l) => (l.key === local.key ? { ...l, status: "sending" } : l)));
    const drop = () => setLocals((ls) => ls.filter((l) => l.key !== local.key));
    const fail = () => setLocals((ls) => ls.map((l) => (l.key === local.key ? { ...l, status: "failed" } : l)));
    try {
      const res = await sendChatMessage(slug, convId, local.body);
      if (res.ok) {
        drop();
        forceBottom.current = true;
        setMessages((prev) => merge(prev, [res.data]));
        return;
      }
      if (res.status === 400 || res.status === 422) {
        // O texto não passou na regra do chat: volta para a caixa para a pessoa corrigir.
        drop();
        setDraft((d) => d || local.body);
        setError(res.error);
        return;
      }
      if (res.status === 401) stop("login");
      else if (res.status === 403 || res.status === 404) stop("gone");
      fail();
    } catch {
      fail();
    }
  };

  const submit = () => {
    if (gone) return;
    const problem = chatBodyError(draft);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    const local: Local = { key: `local-${++seq.current}`, body: draft.trim(), createdAt: new Date().toISOString(), status: "sending" };
    setDraft("");
    requestAnimationFrame(fitInput);
    forceBottom.current = true;
    setLocals((ls) => [...ls, local]);
    void deliver(local);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter envia no computador; no celular o Enter quebra a linha e o envio é pelo botão.
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && finePointer()) {
      e.preventDefault();
      submit();
    }
  };

  const flashBlocked = () => {
    setBlocked(true);
    if (blockTimer.current) clearTimeout(blockTimer.current);
    blockTimer.current = setTimeout(() => setBlocked(false), 4000);
  };

  const onPaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const d = e.clipboardData;
    if (d.files.length > 0 || [...d.items].some((i) => i.kind === "file")) {
      e.preventDefault();
      flashBlocked();
    }
  };

  const hasFiles = (e: DragEvent) => [...e.dataTransfer.types].includes("Files");
  const onDragOver = (e: DragEvent) => {
    if (hasFiles(e)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "none";
    }
  };
  const onDrop = (e: DragEvent) => {
    if (hasFiles(e)) {
      e.preventDefault();
      flashBlocked();
    }
  };

  const lastMine = [...messages].reverse().find((m) => m.mine);
  const canSend = draft.trim().length > 0 && !gone;
  const empty = messages.length === 0 && locals.length === 0;
  const lastAt = messages.length ? messages[messages.length - 1].createdAt : null;

  return (
    <div
      ref={rootRef}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="group fixed inset-x-0 top-[var(--vvt,0px)] z-[45] flex h-[var(--vvh,100dvh)] flex-col bg-night lg:static lg:z-auto lg:-mb-12 lg:h-dvh"
    >
      <header className="flex flex-none items-center gap-1 border-b border-line bg-night px-2 pt-[env(safe-area-inset-top,0px)] lg:px-3">
        <Link href={`${base}/conversas`} aria-label="Voltar para conversas" className="flex size-11 flex-none items-center justify-center rounded-hair text-fg">
          <Icon name="back" size={20} />
        </Link>
        <Link href={`${base}/fas/${encodeURIComponent(other.id)}`} className="flex min-h-14 min-w-0 flex-1 items-center gap-3 py-2 pr-2 text-fg no-underline">
          <ChatAvatar name={other.name} avatar={other.avatar} size={36} />
          <div className="flex min-w-0 flex-col">
            <h1 className="m-0 truncate text-[16px] font-bold leading-5">{other.name}</h1>
            <span className="truncate font-mono text-[12px] leading-4 text-fg-muted">{other.handle ?? "Ver perfil"}</span>
          </div>
        </Link>
      </header>

      <div className="relative min-h-0 flex-1">
        <ol
          ref={scrollerRef}
          onScroll={onScroll}
          role="log"
          aria-label={`Mensagens com ${other.name}`}
          className="m-0 flex h-full list-none flex-col overflow-y-auto overscroll-contain px-4 pb-4 pt-2"
        >
          {/* Empurra conversas curtas para baixo, perto da caixa de texto (como no WhatsApp). */}
          {!empty && <li aria-hidden="true" className="mt-auto" />}
          {empty && (
            <li className="m-auto max-w-[30ch] py-8 text-center text-[15px] leading-[22px] text-fg-muted">
              Nenhuma mensagem ainda. Diga oi para {firstName}.
            </li>
          )}
          {messages.map((m, i) => {
            const prev = messages[i - 1];
            const next = messages[i + 1];
            const newDay = !prev || !sameChatDay(prev.createdAt, m.createdAt);
            const joined = !!prev && !newDay && prev.mine === m.mine && Date.parse(m.createdAt) - Date.parse(prev.createdAt) < GROUP_MS;
            const endsRun =
              !next || next.mine !== m.mine || !sameChatDay(m.createdAt, next.createdAt) || Date.parse(next.createdAt) - Date.parse(m.createdAt) >= GROUP_MS;
            const isLastMine = m.mine && lastMine?.id === m.id && locals.length === 0;
            const status = isLastMine ? (m.readAt ? "Lida" : "Enviada") : null;
            return (
              <Bubble
                key={m.id}
                mine={m.mine}
                body={m.body}
                who={m.mine ? "Você" : other.name}
                time={chatClock(m.createdAt)}
                day={newDay ? chatDay(m.createdAt) : null}
                joined={joined}
                meta={endsRun || status ? `${chatClock(m.createdAt)}${status ? ` · ${status}` : ""}` : null}
              />
            );
          })}
          {locals.map((l, i) => (
            <Bubble
              key={l.key}
              mine
              body={l.body}
              who="Você"
              time={chatClock(l.createdAt)}
              day={i === 0 && (!lastAt || !sameChatDay(lastAt, l.createdAt)) ? chatDay(l.createdAt) : null}
              joined={i > 0 || !!lastMine}
              meta={l.status === "sending" ? "Enviando…" : null}
              failed={l.status === "failed" ? () => void deliver(l) : undefined}
            />
          ))}
        </ol>
        {unseen && (
          <button
            type="button"
            onClick={jumpToEnd}
            className="absolute bottom-3 left-1/2 inline-flex min-h-11 -translate-x-1/2 items-center gap-2 rounded-hair border border-line-strong bg-surface px-4 text-[14px] font-bold text-fg"
          >
            Nova mensagem
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14M5.5 12.5 12 19l6.5-6.5" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex-none border-t border-line bg-night px-3 pb-[calc(10px+env(safe-area-inset-bottom,0px))] pt-2.5 group-data-[kb=1]:pb-2.5 lg:pb-4">
        {gone ? (
          <p role="alert" className="m-0 flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 text-[15px] leading-[22px] text-fg-muted">
            {gone === "login" ? "Sua sessão expirou. Entre de novo para continuar a conversa." : "Essa conversa não está mais disponível."}
            <Link href={gone === "login" ? "/login" : `${base}/conversas`} className="inline-flex min-h-11 items-center font-bold text-amber-text">
              {gone === "login" ? "Entrar" : "Ver conversas"}
            </Link>
          </p>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            {offline && (
              <p role="status" className="m-0 mb-2 font-mono text-[11px] leading-[14px] text-fg-muted">
                Sem conexão. Tentando de novo…
              </p>
            )}
            {error && (
              <p role="alert" className="err m-0 mb-2">
                {error}
              </p>
            )}
            <div className="flex items-end gap-2">
              <label htmlFor="chat-body" className="sr-only">
                Mensagem para {other.name}
              </label>
              <textarea
                id="chat-body"
                ref={inputRef}
                rows={1}
                value={draft}
                maxLength={CHAT_MAX}
                onChange={(e) => {
                  setDraft(e.target.value);
                  if (error) setError(null);
                  fitInput();
                }}
                onKeyDown={onKeyDown}
                onPaste={onPaste}
                onDrop={onDrop}
                placeholder="Escreva uma mensagem"
                enterKeyHint="send"
                autoComplete="off"
                aria-describedby="chat-hint"
                className="field max-h-[132px] min-h-11 flex-1 !py-[9px] focus-visible:!outline-2 focus-visible:!outline-offset-0 focus-visible:!outline-sun"
              />
              <button
                type="submit"
                aria-label="Enviar mensagem"
                disabled={!canSend}
                // Não tira o foco da caixa: o teclado do celular continua aberto depois de enviar.
                onPointerDown={(e) => e.preventDefault()}
                className="flex size-11 flex-none items-center justify-center rounded-hair bg-amber text-on-amber transition-colors duration-150 ease-fan hover:bg-sun disabled:cursor-not-allowed disabled:bg-raised disabled:text-fg-muted"
              >
                <SendIcon />
              </button>
            </div>
            <p
              id="chat-hint"
              aria-live="polite"
              className={`m-0 mt-1.5 flex justify-between gap-3 font-mono text-[11px] leading-[14px] transition-colors duration-150 ${blocked ? "text-amber-text" : "text-fg-muted"}`}
            >
              <span>{CHAT_TEXT_ONLY}</span>
              {draft.length > CHAT_MAX - 100 && (
                <span className="num flex-none">
                  {draft.length}/{CHAT_MAX}
                </span>
              )}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function Bubble({
  mine,
  body,
  who,
  time,
  day,
  joined,
  meta,
  failed,
}: {
  mine: boolean;
  body: string;
  who: string;
  time: string;
  day: string | null;
  joined: boolean;
  meta: string | null;
  failed?: () => void;
}) {
  return (
    <>
      {day && (
        <li aria-hidden="true" className="mb-1 mt-4 flex items-center gap-3 first:mt-2">
          <span className="h-px flex-1 bg-line" />
          <span className="font-mono text-[11px] leading-[14px] text-fg-muted">{day}</span>
          <span className="h-px flex-1 bg-line" />
        </li>
      )}
      <li className={`flex flex-col ${mine ? "items-end" : "items-start"} ${joined && !day ? "mt-1" : "mt-3"}`}>
        <p
          className={`m-0 max-w-[85%] whitespace-pre-wrap rounded-hair px-3 py-2 text-[15px] leading-[22px] text-fg [overflow-wrap:anywhere] lg:max-w-[75%] ${
            mine ? "bg-raised" : "border border-line"
          } ${failed ? "opacity-70" : ""}`}
        >
          <span className="sr-only">
            {who}, {time}:{" "}
          </span>
          {body}
        </p>
        {failed ? (
          <button type="button" onClick={failed} className="inline-flex min-h-11 items-center font-mono text-[12px] leading-4 text-signal">
            Não enviada. Tentar de novo
          </button>
        ) : (
          meta && (
            <span aria-hidden={meta === "Enviando…" ? undefined : true} className="num mt-1 font-mono text-[11px] leading-[14px] text-fg-muted">
              {meta}
            </span>
          )
        )}
      </li>
    </>
  );
}
