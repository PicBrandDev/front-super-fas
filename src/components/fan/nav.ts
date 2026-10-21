import type { IconName } from "@/components/icons";

export type NavItem = { href: string; label: string; icon: IconName; match?: string[] };

/** Itens do menu de baixo (celular). `href` é relativo ao ambiente do artista. */
export const bottomNav: NavItem[] = [
  { href: "", label: "Início", icon: "home" },
  { href: "/clubes", label: "Clubes", icon: "users" },
  { href: "/mural", label: "Mural", icon: "news" },
  { href: "/agenda", label: "Agenda", icon: "calendar", match: ["/eventos"] },
  { href: "/pickap", label: "Sorte", icon: "wheel" },
];

/** Itens do menu lateral (desktop). */
export const sideNav: NavItem[] = [
  { href: "", label: "Início", icon: "home" },
  { href: "/clubes", label: "Fã clubes", icon: "users" },
  { href: "/mural", label: "Mural", icon: "news" },
  { href: "/agenda", label: "Agenda", icon: "calendar", match: ["/eventos"] },
  { href: "/pickap", label: "PicKap da sorte", icon: "wheel" },
  { href: "/loja", label: "Loja", icon: "bag" },
  { href: "/drops", label: "Drops Hits", icon: "music" },
  { href: "/photo-finder", label: "Photo Finder", icon: "camera" },
];

export function isActive(pathname: string, base: string, item: NavItem) {
  if (item.href === "") return pathname === base || pathname === `${base}/`;
  const prefixes = [item.href, ...(item.match ?? [])].map((p) => base + p);
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export type FanChrome = { memberStrip: boolean; bottomNav: boolean };

/**
 * O que fica fixo embaixo em cada tela do celular.
 * - A faixa "Seja membro" some na própria tela do plano e na página do evento
 *   (que tem a sua própria barra de ingressos).
 * - O menu de baixo fica em todas as telas, para a pessoa nunca se perder.
 */
export function chromeFor(pathname: string, base: string): FanChrome {
  const rel = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  const noStrip = ["/membro", "/eventos/"].some((p) => rel === p || rel.startsWith(p));
  return { memberStrip: !noStrip, bottomNav: true };
}
