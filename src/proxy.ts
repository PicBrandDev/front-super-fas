import { NextResponse, type NextRequest } from "next/server";
import {
  PUBLIC_PATHS,
  SESSION_COOKIE,
  artistLoginSlug,
  artistSlugOfPath,
  authEnabled,
  guard,
  homeFor,
  verifySession,
} from "@/lib/auth";

/**
 * Porteiro das rotas: sem login vai para a entrada de cada público (/ = admin master, /{artista}/login, /patrocinador/login); logado, cada tipo de conta
 * só entra nas áreas dele (admin master, admin do fã clube, patrocinador, fã).
 */
export async function proxy(request: NextRequest) {
  if (!authEnabled()) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  const loginOf = artistLoginSlug(pathname);
  const isPublic = !!loginOf || pathname === "/" || PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isPublic) {
    // "/" é a entrada do admin master; quem já está logado é encaminhado pela própria página.
    if (!session || pathname === "/") return NextResponse.next();
    // Já logado não precisa ver o login de novo; o fã volta para o ambiente de onde veio.
    const to = loginOf && session.role === "fan" ? `/${loginOf}` : homeFor(session);
    return NextResponse.redirect(new URL(to, request.url));
  }

  if (!session) {
    // Dentro do ambiente de um artista, a entrada é a tela de login dele.
    const slug = artistSlugOfPath(pathname);
    const entry = slug ? `/${slug}/login` : pathname.startsWith("/patrocinador") ? "/patrocinador/login" : "/";
    const url = new URL(entry, request.url);
    url.searchParams.set("next", pathname + search);
    const res = NextResponse.redirect(url);
    // Cookie vencido ou adulterado: limpa.
    if (request.cookies.has(SESSION_COOKIE)) res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  const to = guard(pathname, session);
  if (to && to !== pathname) return NextResponse.redirect(new URL(to, request.url));
  return NextResponse.next();
}

export const config = {
  // Tudo, menos arquivos do Next e estáticos.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|mp4|webm|woff2?)$).*)"],
};
