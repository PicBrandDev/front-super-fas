/**
 * Contexto de artista nas telas de conta (login, cadastro, minha conta, senha).
 *
 * Quando a pessoa chega vindo do ambiente de um artista (ex.: foi mandada para o
 * login ao abrir /vintage-culture, ou clicou em "Minha conta" dentro do fã clube),
 * essas telas usam o tema do artista. Fora disso, usam o visual neutro da plataforma.
 */
import { getArtist } from "./api";
import type { Artist } from "./types";

/** Primeiros segmentos de URL que não são ambientes de artista. */
const RESERVED = new Set(["admin", "patrocinador", "painel", "conta", "login", "cadastro", "api", "_next"]);

const slugOk = (s: string) => /^[a-z0-9-]+$/.test(s);

export type AuthParams = { next?: string; artista?: string };

/** Slug do artista a partir de `?artista=` ou do primeiro segmento de `?next=`. */
export function artistSlugFrom(params: AuthParams): string | null {
  const explicit = params.artista?.trim();
  if (explicit && slugOk(explicit) && !RESERVED.has(explicit)) return explicit;
  const next = params.next ?? "";
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  const first = next.split(/[/?#]/).filter(Boolean)[0];
  return first && slugOk(first) && !RESERVED.has(first) ? first : null;
}

/** Artista do contexto (null quando não há ou não existe). */
export async function authArtist(params: AuthParams): Promise<Artist | null> {
  const slug = artistSlugFrom(params);
  return slug ? getArtist(slug) : null;
}

/** Acrescenta `?artista=` a um caminho das telas de conta, mantendo o contexto. */
export function withArtist(path: string, slug?: string | null): string {
  if (!slug) return path;
  return `${path}${path.includes("?") ? "&" : "?"}artista=${encodeURIComponent(slug)}`;
}
