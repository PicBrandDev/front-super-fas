"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";
import { useArtist } from "./ArtistContext";

/**
 * Faixa de convite para virar membro, em todas as telas do app. Some para quem já é membro, para quem não está
 * logado e na própria tela de assinatura.
 */
export function MemberBar() {
  const { base, viewer, priceLabel, loggedIn } = useArtist();
  const pathname = usePathname();
  if (!loggedIn || viewer.isMember || pathname.startsWith(`${base}/membro`)) return null;
  return (
    <aside aria-label="Seja membro" className="flex items-center justify-between gap-3 border-b border-line bg-raised px-4 py-2.5">
      <span className="flex min-w-0 items-center gap-2 text-[14px] leading-5">
        <Icon name="star" size={14} />
        <span className="min-w-0">
          <strong>Seja membro</strong> <span className="text-fg-muted">· {priceLabel}/mês</span>
        </span>
      </span>
      <Link href={`${base}/membro`} className="btn btn-primary btn-sm flex-none no-underline">
        Tornar membro
      </Link>
    </aside>
  );
}
