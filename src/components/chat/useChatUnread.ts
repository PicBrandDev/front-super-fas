"use client";

import { useEffect, useSyncExternalStore } from "react";
import { chatUnread } from "@/app/actions/chat";
import { useArtist } from "@/components/fan/ArtistContext";

/*
 * Contador de mensagens não lidas, compartilhado: o balão da top bar e o menu lateral
 * usam o mesmo polling (15 s, pausado com a aba escondida), não um cada.
 */

const POLL_MS = 15_000;

let count = 0;
let slug = "";
let users = 0;
let timer: ReturnType<typeof setInterval> | null = null;
let inflight = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

/** Busca o total agora (ex.: depois de ler uma conversa). */
export async function refreshChatUnread() {
  if (!slug || inflight) return;
  inflight = true;
  try {
    const next = await chatUnread(slug);
    if (next !== count) {
      count = next;
      emit();
    }
  } catch {
    // Sem rede: mantém o último número.
  } finally {
    inflight = false;
  }
}

/** Zera o contador local na hora (a conversa aberta foi lida) e confirma com o servidor. */
export function setChatUnread(n: number) {
  if (n !== count) {
    count = Math.max(0, n);
    emit();
  }
}

const visible = () => typeof document === "undefined" || document.visibilityState === "visible";

function onVisibility() {
  if (visible()) void refreshChatUnread();
}

function start(s: string) {
  if (s !== slug && count !== 0) {
    // Outro ambiente: o número do anterior não vale aqui até a próxima busca.
    count = 0;
    emit();
  }
  slug = s;
  if (users++ > 0) return;
  void refreshChatUnread();
  timer = setInterval(() => {
    if (visible()) void refreshChatUnread();
  }, POLL_MS);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("focus", onVisibility);
}

function stop() {
  if (--users > 0) return;
  if (timer) clearInterval(timer);
  timer = null;
  document.removeEventListener("visibilitychange", onVisibility);
  window.removeEventListener("focus", onVisibility);
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const snapshot = () => count;
const serverSnapshot = () => 0;

/** Quantas mensagens não lidas o fã tem neste artista. Pode usar em quantos componentes quiser. */
export function useChatUnread(): number {
  const { slug: artist } = useArtist();
  useEffect(() => {
    start(artist);
    return stop;
  }, [artist]);
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
