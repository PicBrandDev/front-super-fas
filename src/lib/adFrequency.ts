/**
 * Controle de frequência dos anúncios no navegador do fã (só cliente).
 * Tudo em try/catch: sem storage (aba anônima, bloqueio), o anúncio aparece e o app segue.
 */

const KEY = (k: string) => `sf_ad_${k}`;

/** Viu o anúncio `key` nas últimas `hours` horas? */
export function seenWithin(key: string, hours: number): boolean {
  try {
    const at = Number(localStorage.getItem(KEY(key)));
    return !!at && Date.now() - at < hours * 3_600_000;
  } catch {
    return false;
  }
}

export function markSeen(key: string) {
  try {
    localStorage.setItem(KEY(key), String(Date.now()));
  } catch {
    /* sem storage: aparece de novo na próxima vez */
  }
}

/** Já mostrou o anúncio `key` nesta sessão do navegador? */
export function seenThisSession(key: string): boolean {
  try {
    return sessionStorage.getItem(KEY(key)) === "1";
  } catch {
    return false;
  }
}

export function markSeenThisSession(key: string) {
  try {
    sessionStorage.setItem(KEY(key), "1");
  } catch {
    /* ignore */
  }
}
