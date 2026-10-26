import type { IconName } from "@/components/icons";

export type NavItem = { href: string; label: string; icon: IconName; match?: string[] };

/**
 * Teclas do menu de baixo (celular): cinco, como no protótipo.
 * `href` é relativo ao ambiente do artista. O Início e o Mural são uma área só:
 * a tecla Início fica acesa nos dois e leva de volta ao Início; a chave
 * "Início | Mural" no topo das duas telas troca entre elas.
 * Os fã clubes ficam dentro de Comunidade.
 */
export const deckNav: NavItem[] = [
  { href: "", label: "Início", icon: "home", match: ["/mural", "/drops"] },
  { href: "/comunidade", label: "Comunidade", icon: "comment", match: ["/clubes"] },
  { href: "/pickup", label: "PicKup", icon: "wheel" },
  { href: "/agenda", label: "Agenda", icon: "calendar", match: ["/eventos", "/photo-finder", "/revenda"] },
  { href: "/loja", label: "Loja", icon: "bag" },
];

/** Itens do menu lateral (desktop). */
export const sideNav: NavItem[] = [
  { href: "", label: "Início", icon: "home" },
  { href: "/mural", label: "Mural", icon: "news", match: ["/drops"] },
  { href: "/comunidade", label: "Comunidade", icon: "comment" },
  { href: "/clubes", label: "Fã clubes", icon: "users" },
  { href: "/pickup", label: "PicKup da sorte", icon: "wheel" },
  { href: "/agenda", label: "Agenda", icon: "calendar", match: ["/eventos"] },
  { href: "/revenda", label: "Revenda entre fãs", icon: "repost" },
  { href: "/photo-finder", label: "Photo finder", icon: "camera" },
  { href: "/loja", label: "Loja Vintage", icon: "bag" },
];

export function isActive(pathname: string, base: string, item: NavItem) {
  if (item.href === "" && !item.match) return pathname === base || pathname === `${base}/`;
  if (item.href === "" && (pathname === base || pathname === `${base}/`)) return true;
  const prefixes = (item.href === "" ? (item.match ?? []) : [item.href, ...(item.match ?? [])]).map((p) => base + p);
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
