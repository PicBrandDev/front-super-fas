import type { IconName } from "@/components/icons";

export type NavItem = { href: string; label: string; icon: IconName; match?: string[] };

/** Itens do menu de baixo (celular). `href` é relativo ao ambiente do artista. */
export const bottomNav: NavItem[] = [
  { href: "", label: "Início", icon: "home" },
  { href: "/mural", label: "Mural", icon: "news" },
  { href: "/agenda", label: "Agenda", icon: "calendar", match: ["/eventos"] },
  { href: "/pickap", label: "Sorte", icon: "wheel" },
  { href: "/loja", label: "Loja", icon: "bag" },
];

/** Itens do menu lateral (desktop). */
export const sideNav: NavItem[] = [
  { href: "", label: "Início", icon: "home" },
  { href: "/mural", label: "Mural", icon: "news" },
  { href: "/agenda", label: "Agenda", icon: "calendar", match: ["/eventos"] },
  { href: "/pickap", label: "PicKap da sorte", icon: "wheel" },
  { href: "/loja", label: "Loja Vintage", icon: "bag" },
  { href: "/drops", label: "Drops Hits", icon: "music" },
  { href: "/photo-finder", label: "Photo Finder", icon: "camera" },
];

export function isActive(pathname: string, base: string, item: NavItem) {
  if (item.href === "") return pathname === base || pathname === `${base}/`;
  const prefixes = [item.href, ...(item.match ?? [])].map((p) => base + p);
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
