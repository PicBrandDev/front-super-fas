"use client";

import Link from "next/link";
import { formatBRL } from "@/lib/format";
import type { Listing } from "@/lib/resale";
import { TrustCard } from "./TrustCard";

/** Linha de anúncio na lista do show: quem vende (com nota e vendas), tipo, saldo e o preço por ingresso. */
export function ListingRow({ listing, href }: { listing: Listing; href: string }) {
  const left = listing.qtyAvailable;
  return (
    <Link
      href={href}
      className="grid gap-3 border-b border-line px-4 py-4 text-fg no-underline transition-colors hover:bg-surface"
      aria-label={`${listing.ticketLabel}, ${formatBRL(listing.unitPriceCents)} por ingresso, vendido por ${listing.seller.displayName}`}
    >
      <span className="flex items-start justify-between gap-3">
        <TrustCard seller={listing.seller} compact link={false} />
        <span className="grid flex-none justify-items-end gap-1">
          <strong className="num font-display text-[24px] font-black leading-7">{formatBRL(listing.unitPriceCents)}</strong>
          <span className="mono">por ingresso</span>
        </span>
      </span>
      <span className="flex flex-wrap items-center gap-2">
        <span className="tag">{listing.ticketLabel}</span>
        <span className={left === 0 ? "tag tag-demo" : "tag"}>{left === 0 ? "Esgotado" : left === 1 ? "1 disponível" : `${left} disponíveis`}</span>
        {listing.unitPriceCents < listing.faceCents && <span className="tag tag-key">Abaixo do valor de face</span>}
      </span>
    </Link>
  );
}
