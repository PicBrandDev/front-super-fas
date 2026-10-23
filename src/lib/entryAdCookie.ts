/**
 * Cookie "acabou de entrar" do anúncio de entrada (`entry`) da área do fã.
 * Valor = slug do artista. Gravado no login/cadastro (actions/auth.ts), lido no
 * layout do fã e apagado pelo `EntryAd` ao fechar o modal (não é httpOnly por isso).
 */
export const ENTRY_AD_COOKIE = "sf_entry_ad";
/** Vida curta: só a primeira página depois do login (10 min). */
export const ENTRY_AD_COOKIE_MAX_AGE = 60 * 10;
