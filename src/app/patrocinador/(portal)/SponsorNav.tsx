"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/patrocinador/campanhas", label: "Minhas campanhas" },
  { href: "/patrocinador", label: "Nova campanha" },
];

export function SponsorNav() {
  const pathname = usePathname();
  return (
    <>
      {items.map((it) => {
        const on = pathname === it.href;
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={on ? "page" : undefined}
            className={`flex min-h-11 items-center rounded-lg px-3 text-sm no-underline ${
              on ? "bg-adm-blue-soft font-semibold text-adm-blue-dark" : "font-medium text-adm-ink hover:bg-adm-bg"
            }`}
          >
            {it.label}
          </Link>
        );
      })}
    </>
  );
}
