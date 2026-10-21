import type { Metadata } from "next";
import Link from "next/link";
import { campaignWhere } from "@/app/admin/midia/slots";
import { AdminEmpty, Badge, btnPrimary, tdClass, thClass, type Tone } from "@/components/admin/ui";
import { getMyCampaigns, getSession } from "@/lib/api";
import type { CampaignStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Minhas campanhas" };

const look: Record<CampaignStatus, { label: string; tone: Tone }> = {
  live: { label: "No ar", tone: "ok" },
  approved: { label: "Aprovada", tone: "info" },
  pending: { label: "Aguardando aprovação", tone: "warn" },
  rejected: { label: "Recusada", tone: "off" },
};

export default async function MinhasCampanhasPage() {
  const session = await getSession();
  const campaigns = session && session.role !== "sponsor" ? [] : await getMyCampaigns();

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-[28px] font-bold">Minhas campanhas</h1>
          <p className="m-0 text-[15px] text-adm-muted">Acompanhe a aprovação e o período de cada anúncio.</p>
        </div>
        <Link href="/patrocinador" className={`${btnPrimary} no-underline`}>
          Nova campanha
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-adm-line bg-white">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="bg-adm-bg">
              <th scope="col" className={thClass}>Anúncio</th>
              <th scope="col" className={thClass}>Onde</th>
              <th scope="col" className={thClass}>Vitrine</th>
              <th scope="col" className={thClass}>Período</th>
              <th scope="col" className={thClass}>Status</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => {
              const where = campaignWhere(c);
              return (
              <tr key={c.id}>
                <td className={`${tdClass} font-semibold`}>{c.title}</td>
                <td className={tdClass}>
                  {where.place}
                  {where.artist && <span className="block text-xs text-adm-muted">{where.artist}</span>}
                </td>
                <td className={tdClass}>{c.slotName}</td>
                <td className={`${tdClass} font-adm-mono text-[13px]`}>{c.period}</td>
                <td className={tdClass}>
                  <Badge tone={look[c.status].tone}>{look[c.status].label}</Badge>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
        {campaigns.length === 0 && (
          <div className="p-4">
            {session && session.role !== "sponsor" ? (
              <AdminEmpty title="Só para contas de patrocinador" text="Esta tela mostra as campanhas de uma conta de patrocinador." />
            ) : (
              <AdminEmpty
                title="Nenhuma campanha ainda"
                text="Monte seu primeiro anúncio: escolha o cantor, onde anunciar e a vitrine."
                action={
                  <Link href="/patrocinador" className={`${btnPrimary} no-underline`}>
                    Nova campanha
                  </Link>
                }
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
