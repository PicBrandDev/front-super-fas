"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Icon } from "@/components/icons";
import { useArtist } from "./ArtistContext";

const KEY = "sf_member_bar_closed";
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => (listeners.add(cb), () => void listeners.delete(cb));
const closed = () => {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};
const close = () => {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {}
  listeners.forEach((l) => l());
};

/**
 * Faixa de convite para virar membro, em todas as telas do app. Some para quem já é membro, para quem não está
 * logado, na própria tela de assinatura e na tela da roleta (PicKup). O X fecha a faixa até o fim da visita.
 */
export function MemberBar() {
  const { base, viewer, priceLabel, loggedIn } = useArtist();
  const pathname = usePathname();
  const dismissed = useSyncExternalStore(subscribe, closed, () => true);
  if (dismissed || !loggedIn || viewer.isMember || pathname.startsWith(`${base}/membro`) || pathname.startsWith(`${base}/pickup`)) return null;
  return (
    <aside aria-label="Seja membro" className="flex items-center gap-3 border-b border-line bg-raised px-4 py-2.5">
      <span className="flex min-w-0 flex-1 items-center gap-2 text-[14px] leading-5">
        <Icon name="star" size={14} />
        <span className="min-w-0">
          <strong>Seja membro</strong> <span className="text-fg-muted">· {priceLabel}/mês</span>
        </span>
      </span>
      <Link href={`${base}/membro`} className="btn btn-primary btn-sm flex-none no-underline">
        Tornar membro
      </Link>
      <button type="button" onClick={close} aria-label="Fechar aviso" className="flex size-8 flex-none cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-fg-muted">
        <Icon name="close" size={16} />
      </button>
    </aside>
  );
}
