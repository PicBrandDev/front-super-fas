import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DemoTag, PageHead } from "@/components/fan/resale/parts";
import { ResaleError } from "@/components/fan/resale/ResaleError";
import { ListingRow } from "@/components/fan/resale/ListingRow";
import { EmptyState } from "@/components/fan/states";
import { Icon } from "@/components/icons";
import { apiEnabled, getResaleEvent, getResaleListings } from "@/lib/api";
import { formatBRL } from "@/lib/format";
import { showDateParts } from "@/lib/resale";

export const metadata: Metadata = { title: "Anúncios do show" };

type Search = Promise<{ tipo?: string; ordem?: string; pagina?: string }>;

export default async function ResaleShowPage({ params, searchParams }: { params: Promise<{ artista: string; eventoId: string }>; searchParams: Search }) {
  const { artista, eventoId } = await params;
  const q = await searchParams;
  const base = `/${artista}`;
  const detail = await getResaleEvent(artista, eventoId);
  if (!detail.ok) {
    if (detail.status === 404) notFound();
    return <ResaleError back={`${base}/revenda`} backLabel="Revenda" message={detail.error} />;
  }
  const { event, ticketTypes } = detail.data;
  const current = ticketTypes.find((t) => t.id === q.tipo) ?? null;
  const sort = q.ordem === "recent" ? "recent" : "price";
  const page = Math.max(1, Number(q.pagina) || 1);
  const listings = await getResaleListings(artista, eventoId, { ticketId: current?.id, sort, page });
  const d = showDateParts(event.date);
  const href = (p: { tipo?: string | null; ordem?: string; pagina?: number }) => {
    const sp = new URLSearchParams();
    const tipo = p.tipo === undefined ? current?.id : p.tipo;
    if (tipo) sp.set("tipo", tipo);
    const ordem = p.ordem ?? sort;
    if (ordem !== "price") sp.set("ordem", ordem);
    if (p.pagina && p.pagina > 1) sp.set("pagina", String(p.pagina));
    const s = sp.toString();
    return `${base}/revenda/${eventoId}${s ? `?${s}` : ""}`;
  };

  return (
    <div className="flex flex-col gap-5 pb-10 pt-4">
      <div className="px-4">
        <PageHead
          back={`${base}/revenda`}
          backLabel="Revenda"
          title={event.city}
          text={`${d.weekday} ${d.day} ${d.month}${event.time ? ` · ${event.time}` : ""} · ${event.venue}`}
          aside={!apiEnabled() ? <DemoTag /> : undefined}
        />
      </div>

      <nav aria-label="Tipo de ingresso" className="tabs overflow-x-auto [scrollbar-width:none]">
        <Link href={href({ tipo: null, pagina: 1 })} className="tab no-underline" aria-current={!current ? "page" : undefined}>
          Todos
        </Link>
        {ticketTypes.map((t) => (
          <Link key={t.id} href={href({ tipo: t.id, pagina: 1 })} className="tab no-underline" aria-current={current?.id === t.id ? "page" : undefined}>
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="flex flex-col gap-4 px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="m-0 text-[15px] leading-[22px] text-fg-muted">
            {current
              ? `Teto da ${current.label}: ${formatBRL(current.faceCents)}, o valor de face. Ninguém anuncia acima.`
              : "Cada ingresso tem como teto o valor de face. Ninguém anuncia acima."}
          </p>
          <div className="flex gap-4" role="group" aria-label="Ordenar">
            <Link href={href({ ordem: "price", pagina: 1 })} className={`go ${sort === "price" ? "" : "!text-fg-muted !no-underline"}`} aria-current={sort === "price" ? "true" : undefined}>
              Menor preço
            </Link>
            <Link href={href({ ordem: "recent", pagina: 1 })} className={`go ${sort === "recent" ? "" : "!text-fg-muted !no-underline"}`} aria-current={sort === "recent" ? "true" : undefined}>
              Recentes
            </Link>
          </div>
        </div>

        {!listings.ok ? (
          <p role="alert" className="err m-0">
            {listings.error}
          </p>
        ) : listings.data.items.length === 0 ? (
          <EmptyState title="Nenhum anúncio por aqui." text="Volte mais tarde: anúncios novos entram depois que a equipe confere o ingresso." />
        ) : (
          <ul className="-mx-4 m-0 list-none border-t border-line p-0">
            {listings.data.items.map((l) => (
              <li key={l.id}>
                <ListingRow listing={l} href={`${base}/revenda/anuncio/${l.id}`} />
              </li>
            ))}
          </ul>
        )}
        {listings.ok && listings.data.hasMore && (
          <Link href={href({ pagina: page + 1 })} className="btn btn-outline self-start">
            Ver mais anúncios
          </Link>
        )}

        <div className="grid gap-3 border-t border-line pt-5">
          <strong className="font-display text-[24px] font-black leading-7">Tem ingresso sobrando?</strong>
          <p className="m-0 text-[15px] leading-[22px] text-fg-muted">Anuncie pelo valor de face ou menos. A equipe confere a prova antes de ir ao ar e você recebe quando o comprador confirmar.</p>
          <Link href={`${base}/revenda/vender/${eventoId}`} className="btn btn-outline self-start">
            Vender ingresso
            <Icon name="arrow" size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
