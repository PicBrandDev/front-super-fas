"use client";

import { useCallback, useEffect, useState } from "react";
import { AdModal } from "./AdModal";
import type { InAppAd } from "@/lib/ads";
import { markSeenThisSession, seenThisSession } from "@/lib/adFrequency";
import { ENTRY_AD_COOKIE } from "@/lib/entryAdCookie";

/** O navegador deixa gravar na sessionStorage? (aba anônima/bloqueio: não) */
function sessionStorageWorks() {
  try {
    const k = "sf_ad_probe";
    sessionStorage.setItem(k, "1");
    sessionStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

/**
 * Anúncio de entrada (`entry`): abre uma vez ao entrar no app do artista.
 * - Logo depois do login/cadastro (cookie `sf_entry_ad` = slug, `fresh`) ou
 * - ao abrir o app sem login novo, no máximo uma vez por sessão do navegador por artista.
 * Abre só depois de montar (sem diferença entre servidor e cliente); fechar é imediato.
 */
export function EntryAd({ ad, slug, fresh }: { ad: InAppAd; slug: string; fresh: boolean }) {
  const [open, setOpen] = useState(false);
  const key = `entry-${slug}`;

  useEffect(() => {
    // Sem storage não dá para contar a sessão: aí só aparece no login novo.
    const show = sessionStorageWorks() ? !seenThisSession(key) : fresh;
    if (!show) return;
    markSeenThisSession(key);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- abre depois de montar para não divergir da hidratação
    setOpen(true);
  }, [key, fresh]);

  const close = useCallback(() => {
    setOpen(false);
    document.cookie = `${ENTRY_AD_COOKIE}=; Max-Age=0; path=/; SameSite=Lax`;
  }, []);

  return <AdModal ad={ad} open={open} onClose={close} />;
}
