/**
 * Sessão de login (compartilhado entre o proxy e o servidor; sem dependências do Node).
 *
 * O token é o JWT devolvido pela API em /auth/login, guardado num cookie httpOnly.
 * Aqui só conferimos a assinatura (HS256, mesmo JWT_SECRET da API) e lemos o papel.
 * Quem garante as permissões de verdade é a API.
 */

export const SESSION_COOKIE = "sf_session";

export type Role = "fan" | "sponsor" | "artist_admin" | "master";

export type Session = {
  sub: string;
  role: Role;
  name: string;
  artists: string[]; // cantores cujo ambiente administra (equipe do fã clube master)
  clubs: string[]; // fã clubes da equipe, como "cantor/clube"
  exp: number;
};

export const roleLabel: Record<Role, string> = {
  fan: "Fã",
  sponsor: "Patrocinador",
  artist_admin: "Equipe de fã clube",
  master: "Admin master",
};

/** Login ligado só quando o front está conectado à API. Sem API, o app roda com os dados de exemplo. */
export const authEnabled = () => !!process.env.API_URL;

const b64urlToBytes = (s: string) => {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

export async function verifySession(token: string | undefined): Promise<Session | null> {
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      b64urlToBytes(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    );
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[1]))) as Session;
    if (!payload.exp || payload.exp * 1000 < Date.now()) return null;
    return { ...payload, artists: payload.artists ?? [], clubs: payload.clubs ?? [] };
  } catch {
    return null;
  }
}

/** Para onde cada tipo de conta vai depois do login. */
export function homeFor(s: Pick<Session, "role" | "artists"> & { clubs?: string[] }): string {
  const clubs = s.clubs ?? [];
  switch (s.role) {
    case "master":
      return "/admin/fas-clubes";
    case "artist_admin":
      // Só uma posição na equipe: vai direto. Mais de uma: escolhe no /painel.
      if (clubs.length === 1) {
        const [artist, club] = clubs[0].split("/");
        return s.artists.includes(artist) ? `/${artist}/admin` : `/${artist}/clubes/${club}/admin`;
      }
      return clubs.length > 1 ? "/painel" : "/";
    case "sponsor":
      return "/patrocinador";
    default:
      return "/";
  }
}

/** Caminhos que não pedem login. */
export const PUBLIC_PATHS = ["/login", "/cadastro", "/patrocinador/login"];

/** Primeiros segmentos de URL que não são ambientes de artista. */
export const RESERVED_SEGMENTS = ["admin", "patrocinador", "painel", "conta", "login", "cadastro", "api", "_next", "uploads"];

/** Slug do artista quando o caminho é uma tela de entrada dele (`/{artista}/login` ou `/{artista}/cadastro`). */
export function artistLoginSlug(pathname: string): string | null {
  const parts = pathname.split("/").filter(Boolean);
  const entry = parts.length === 2 && (parts[1] === "login" || parts[1] === "cadastro");
  return entry && !RESERVED_SEGMENTS.includes(parts[0]) ? parts[0] : null;
}

/** Slug do artista cujo ambiente o caminho acessa (`/{artista}/...`), se houver. */
export function artistSlugOfPath(pathname: string): string | null {
  const first = pathname.split("/").filter(Boolean)[0];
  return first && /^[a-z0-9-]+$/.test(first) && !RESERVED_SEGMENTS.includes(first) ? first : null;
}

/**
 * Regras de acesso por caminho. Devolve null quando pode entrar,
 * ou o caminho para onde mandar a pessoa.
 */
export function guard(pathname: string, s: Session): string | null {
  const parts = pathname.split("/").filter(Boolean);
  const home = homeFor(s);
  // /admin/** → só admin master
  if (parts[0] === "admin") return s.role === "master" ? null : home;
  // /patrocinador → patrocinador (o master pode espiar)
  if (parts[0] === "patrocinador") return s.role === "sponsor" || s.role === "master" ? null : home;
  // /painel → quem está em alguma equipe
  if (parts[0] === "painel") return s.role === "artist_admin" || s.role === "master" ? null : home;
  // /{artista}/admin/** → administração do ambiente (equipe do fã clube master) ou master
  if (parts[1] === "admin") {
    if (s.role === "master") return null;
    return s.role === "artist_admin" && s.artists.includes(parts[0]) ? null : home;
  }
  // /{artista}/clubes/{clube}/admin/** → equipe daquele fã clube, administração do ambiente ou master
  if (parts[1] === "clubes" && parts[3] === "admin") {
    if (s.role === "master" || s.artists.includes(parts[0])) return null;
    return s.clubs.includes(`${parts[0]}/${parts[2]}`) ? null : home;
  }
  // Área do fã e entrada da plataforma: qualquer conta logada.
  return null;
}
