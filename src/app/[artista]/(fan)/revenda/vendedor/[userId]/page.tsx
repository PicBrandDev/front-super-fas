import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DemoTag, PageHead } from "@/components/fan/resale/parts";
import { ResaleError } from "@/components/fan/resale/ResaleError";
import { TrustCard } from "@/components/fan/resale/TrustCard";
import { EmptyState } from "@/components/fan/states";
import { Icon } from "@/components/icons";
import { apiEnabled, getResaleSeller, getResaleSellerReviews } from "@/lib/api";

export const metadata: Metadata = { title: "Vendedor da revenda" };

export default async function ResaleSellerPage({ params }: { params: Promise<{ artista: string; userId: string }> }) {
  const { artista, userId } = await params;
  const [seller, reviews] = await Promise.all([getResaleSeller(artista, userId), getResaleSellerReviews(artista, userId)]);
  if (!seller.ok) {
    if (seller.status === 404) notFound();
    return <ResaleError back={`/${artista}/revenda`} backLabel="Revenda" message={seller.error} />;
  }
  const list = reviews.ok ? reviews.data : [];
  return (
    <div className="flex flex-col gap-6 px-4 pb-10 pt-4">
      <PageHead back={`/${artista}/revenda`} backLabel="Revenda" title={seller.data.displayName} aside={!apiEnabled() ? <DemoTag /> : undefined} />
      <TrustCard seller={seller.data} link={false} />
      <section aria-labelledby="avaliacoes" className="grid gap-3">
        <h2 id="avaliacoes" className="mono m-0">
          Avaliações de quem comprou ({list.length})
        </h2>
        {list.length === 0 ? (
          <EmptyState title="Ainda sem avaliações." text="Quem compra avalia depois de confirmar que recebeu o ingresso." />
        ) : (
          <ul className="m-0 list-none border-t border-line p-0">
            {list.map((r) => (
              <li key={r.id} className="grid gap-2 border-b border-line py-4">
                <span className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1 text-[15px] font-bold" aria-label={`${r.rating} de 5`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Icon key={i} name="star" size={14} className={`icon ${i < r.rating ? "fill-[var(--fc-amber)] text-amber" : "text-line-strong"}`} />
                    ))}
                  </span>
                  <span className="mono">{r.createdAt}</span>
                </span>
                {r.comment && <p className="m-0 text-[15px] leading-[22px]">{r.comment}</p>}
                <span className="mono">{r.buyerName}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
