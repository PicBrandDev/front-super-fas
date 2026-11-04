import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

/**
 * Sessão recusada pela API (token vencido ou de uma conta que não existe mais): apaga o cookie e vai para o login.
 * Sem isto o porteiro enxerga o cookie como válido e devolve a pessoa para a área protegida, em laço infinito.
 */
export function GET(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/login", request.url));
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
