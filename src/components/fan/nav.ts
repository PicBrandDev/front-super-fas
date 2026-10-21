import type { IconName } from "@/components/icons";

export type NavItem = { href: string; label: string; icon: IconName; match?: string[] };

/**
 * Teclas do menu de baixo (celular): cinco, como no protótipo.
 * `href` é relativo ao ambiente do artista. O Início fica na marca do
 * cabeçalho e no menu lateral; os fã clubes ficam dentro de Comunidade.
 */
export const deckNav: NavItem[] = [
  { href: "/mural", label: "Mural", icon: "news", match: ["/drops"] },
  { href: "/comunidade", label: "Comunidade", icon: "comment", match: ["/clubes"] },
  { href: "/pickap", label: "PicKap", icon: "wheel" },
  { href: "/agenda", label: "Agenda", icon: "calendar", match: ["/eventos", "/photo-finder"] },
  { href: "/loja", label: "Loja", icon: "bag" },
];

/** Itens do menu lateral (desktop). */
export const sideNav: NavItem[] = [
  { href: "", label: "Início", icon: "home" },
  { href: "/mural", label: "Mural", icon: "news", match: ["/drops"] },
  { href: "/comunidade", label: "Comunidade", icon: "comment" },
  { href: "/clubes", label: "Fã clubes", icon: "users" },
  { href: "/pickap", label: "PicKap da sorte", icon: "wheel" },
  { href: "/agenda", label: "Agenda", icon: "calendar", match: ["/eventos"] },
  { href: "/photo-finder", label: "Photo finder", icon: "camera" },
  { href: "/loja", label: "Loja Vintage", icon: "bag" },
];

export function isActive(pathname: string, base: string, item: NavItem) {
  if (item.href === "") return pathname === base || pathname === `${base}/`;
  const prefixes = [item.href, ...(item.match ?? [])].map((p) => base + p);
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
