"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { initialsOf } from "@/lib/format";
import { positionLabel, ratingText, type Seller } from "@/lib/resale";
import { useArtist } from "../ArtistContext";

/**
 * Cartão de confiança do vendedor: tudo o que a API sabe sobre ele, nunca CPF, telefone ou e-mail.
 * Mostrado sempre que um vendedor aparece. `compact` é a linha da lista de anúncios.
 */
export function TrustCard({ seller, compact = false, link = true }: { seller: Seller; compact?: boolean; link?: boolean }) {
  const { base } = useArtist();
  const identity = seller.identityVerified ? "Identidade verificada" : seller.identityLevel === "declared" ? "Identidade informada" : null;
  const sales = seller.completedSales === 1 ? "1 venda concluída" : `${seller.completedSales} vendas concluídas`;

  if (compact) {
    return (
      <span className="flex min-w-0 items-center gap-3">
        <span className="avatar" aria-hidden="true">
          {initialsOf(seller.displayName)}
        </span>
        <span className="grid min-w-0 gap-[2px]">
          <span className="truncate text-[15px] font-bold leading-5">{seller.displayName}</span>
          <span className="mono flex flex-wrap items-center gap-x-2">
            <span>{sales}</span>
            <span className="inline-flex items-center gap-1">
              <Icon name="star" size={11} />
              {ratingText(seller)}
            </span>
          </span>
        </span>
      </span>
    );
  }

  return (
    <section aria-labelledby={`seller-${seller.userId}`} className="grid gap-4 border-y border-line py-4">
      <div className="flex items-center gap-3">
        <span className="avatar !h-11 !w-11 !text-[12px]" aria-hidden="true">
          {initialsOf(seller.displayName)}
        </span>
        <span className="grid min-w-0 gap-[2px]">
          <strong id={`seller-${seller.userId}`} className="truncate text-[17px] leading-[22px]">
            {seller.displayName}
          </strong>
          <span className="mono truncate">{seller.handle}</span>
        </span>
        {link && (
          <Link href={`${base}/revenda/vendedor/${seller.userId}`} className="go ml-auto flex-none" aria-label={`Ver perfil de ${seller.displayName}`}>
            Perfil <Icon name="arrow" size={16} />
          </Link>
        )}
      </div>

      <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-3">
        <div className="grid gap-1">
          <dt className="mono">Vendas</dt>
          <dd className="m-0 text-[15px] font-bold leading-5">{sales}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="mono">Avaliação</dt>
          <dd className="m-0 inline-flex items-center gap-1 text-[15px] font-bold leading-5">
            {seller.ratingCount > 0 && <Icon name="star" size={14} />}
            {ratingText(seller)}
          </dd>
        </div>
        <div className="grid gap-1">
          <dt className="mono">No app desde</dt>
          <dd className="m-0 text-[15px] leading-5">{seller.memberSince}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="mono">Identidade</dt>
          <dd className="m-0 text-[15px] leading-5">{identity ?? "Não informada"}</dd>
        </div>
      </dl>

      {(seller.clubs.length > 0 || seller.isMember) && (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {seller.isMember && <li className="tag tag-key">Membro</li>}
          {seller.clubs.map((c) => (
            <li key={c.slug} className="tag">
              {c.name} · {positionLabel[c.position]}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
