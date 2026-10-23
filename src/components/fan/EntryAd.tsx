"use client";

import { useCallback, useEffect, useState } from "react";
import { AdModal } from "./AdModal";
import type { InAppAd } from "@/lib/ads";
import { ENTRY_AD_COOKIE } from "@/lib/entryAdCookie";

/** Cookie sem Max-Age: vale até fechar o navegador e vale para todas as abas (a sessionStorage é por aba). */
const seenCookie = (slug: string) => `sf_entry_seen_${slug}`;
const seenThisBrowserSession = (slug: string) => document.cookie.split("; ").includes(`${seenCookie(slug)}=1`);

/**
 * Anúncio de entrada (`entry`): abre uma vez ao entrar no app do artista.
 * - Logo depois do login/cadastro (cookie `sf_entry_ad` = slug, `fresh`) ou
 * - ao abrir o app sem login novo, no máximo uma vez por sessão do navegador (todas as abas) por artista.
 * Abre só depois de montar (sem diferença entre servidor e cliente); fechar é imediato.
 */
export function EntryAd({ ad, slug, fresh }: { ad: InAppAd; slug: string; fresh: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!fresh && seenThisBrowserSession(slug)) return;
    document.cookie = `${seenCookie(slug)}=1; path=/; SameSite=Lax`;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- abre depois de montar para não divergir da hidratação
    setOpen(true);
  }, [slug, fresh]);

  const close = useCallback(() => {
    setOpen(false);
    document.cookie = `${ENTRY_AD_COOKIE}=; Max-Age=0; path=/; SameSite=Lax`;
  }, []);

  return <AdModal ad={ad} open={open} onClose={close} />;
}
