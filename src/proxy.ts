import { NextResponse, type NextRequest } from "next/server";
import { PUBLIC_PATHS, SESSION_COOKIE, authEnabled, guard, homeFor, verifySession } from "@/lib/auth";

/**
 * Porteiro das rotas: sem login vai para /login; logado, cada tipo de conta
 * só entra nas áreas dele (admin master, admin do fã clube, patrocinador, fã).
 */
export async function proxy(request: NextRequest) {
  if (!authEnabled()) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isPublic) {
    // Já logado não precisa ver o login de novo.
    return session ? NextResponse.redirect(new URL(homeFor(session), request.url)) : NextResponse.next();
  }

  if (!session) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("next", pathname + search);
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|woff2?)$).*)"],
};
