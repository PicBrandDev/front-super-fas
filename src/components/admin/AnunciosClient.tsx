"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { decideCampaign, updateAdSlot } from "@/app/actions/admin";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { Switch } from "@/components/admin/controls";
import { Badge, SlotDiagram, inputClass, tdClass, thClass, type Tone } from "@/components/admin/ui";
import type { AdSlot, Campaign, CampaignStatus } from "@/lib/types";

const look: Record<CampaignStatus, { label: string; tone: Tone }> = {
  live: { label: "No ar", tone: "ok" },
  approved: { label: "Aprovada", tone: "info" },
  pending: { label: "Aguardando aprovação", tone: "warn" },
  rejected: { label: "Recusada", tone: "off" },
};

/**
 * Vitrines e campanhas de um lugar (ambiente do cantor ou um fã clube).
 * Quem administra o lugar liga/pausa vitrines, define o preço e aprova as campanhas.
 */
export function AnunciosClient({
  artist,
  title,
  description,
  slots,
  campaigns,
}: {
  artist: string;
  title: string;
  description: string;
  slots: AdSlot[];
  campaigns: Campaign[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [announce, setAnnounce] = useState("");
  const [price, setPrice] = useState<{ key: string; value: string } | null>(null);
  const [pending, start] = useTransition();

  const run = (call: () => Promise<{ ok: boolean; status?: number; error?: string }>, done: string, after?: () => void) =>
    start(async () => {
      const res = await call();
      if (!res.ok) {
        setError(res.error ?? "Não deu certo.");
        return;
      }
      setError("");
      setAnnounce(done);
      after?.();
      router.refresh();
    });

  const savePrice = (e: FormEvent, slot: AdSlot) => {
    e.preventDefault();
    if (!price) return;
    const n = Number(price.value.replace(/[R$\s.]/g, "").replace(",", "."));
    if (!Number.isFinite(n) || n < 0) {
      setError("Digite o preço em reais, ex.: 500,00.");
      return;
    }
    run(() => updateAdSlot(artist, slot.id, { priceCents: Math.round(n * 100) }), "Preço salvo.", () => setPrice(null));
  };

  const pendingCount = campaigns.filter((c) => c.status === "pending").length;

  return (
    <>
      <AdminPageHeader title={title} description={description} />
      <p role="status" aria-live="polite" className="sr-only">
        {announce}
      </p>
      {error && (
        <p role="alert" className="m-0 rounded-lg bg-[#fbeae7] px-3 py-2.5 text-sm font-semibold text-adm-danger">
          {error}
        </p>
      )}

      <section aria-labelledby="an-camps" className="flex flex-col gap-3">
        <h2 id="an-camps" className="m-0 text-lg font-bold">
          Campanhas <span className="font-adm-mono text-[13px] font-semibold text-adm-muted">· {pendingCount} aguardando</span>
        </h2>
        <div className="overflow-x-auto rounded-xl border border-adm-line bg-white">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="bg-adm-bg">
                <th scope="col" className={thClass}>Patrocinador</th>
                <th scope="col" className={thClass}>Vitrine</th>
                <th scope="col" className={thClass}>Anúncio</th>
                <th scope="col" className={thClass}>Período</th>
                <th scope="col" className={thClass}>Status</th>
                <th scope="col" className={thClass}>
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td className={`${tdClass} font-semibold`}>{c.sponsor}</td>
                  <td className={tdClass}>{c.slotName}</td>
                  <td className={tdClass}>
                    <span className="font-semibold">{c.title}</span>
                    {c.text && <span className="block text-xs text-adm-muted">{c.text}</span>}
                  </td>
                  <td className={`${tdClass} font-adm-mono text-[13px]`}>{c.period}</td>
                  <td className={tdClass}>
                    <Badge tone={look[c.status].tone}>{look[c.status].label}</Badge>
                  </td>
                  <td className={tdClass}>
                    {c.status === "pending" && (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => run(() => decideCampaign(c.id, "reject"), `Campanha de ${c.sponsor} recusada.`)}
                          className="inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-adm-line bg-white px-3 text-[13px] font-semibold text-adm-ink"
                        >
                          Recusar<span className="sr-only"> campanha de {c.sponsor}</span>
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => run(() => decideCampaign(c.id, "approve"), `Campanha de ${c.sponsor} aprovada.`)}
                          className="inline-flex min-h-10 cursor-pointer items-center rounded-lg bg-adm-blue px-3 text-[13px] font-semibold text-white"
                        >
                          Aprovar<span className="sr-only"> campanha de {c.sponsor}</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {campaigns.length === 0 && <p className="m-0 px-4 py-6 text-sm text-adm-muted">Nenhuma campanha ainda.</p>}
        </div>
      </section>

      <section aria-labelledby="an-slots" className="flex flex-col gap-3">
        <h2 id="an-slots" className="m-0 text-lg font-bold">
          Vitrines
        </h2>
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))]">
          {slots.map((s) => (
            <article key={s.id} className={`flex flex-col gap-3 rounded-xl border border-adm-line bg-white p-[18px] ${s.active ? "" : "opacity-60"}`}>
              <div className="flex items-start gap-3.5">
                <SlotDiagram top={s.diagram.top} height={s.diagram.height} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <h3 className="m-0 text-base font-bold">{s.name}</h3>
                  <span className="text-[13px] leading-[1.4] text-adm-muted">{s.where}</span>
                </div>
                <Switch
                  checked={s.active}
                  label={`Vitrine ${s.name} ${s.active ? "ativa" : "pausada"}`}
                  onChange={(v) => run(() => updateAdSlot(artist, s.id, { active: v }), `Vitrine ${s.name} ${v ? "ativada" : "pausada"}.`)}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-adm-line-soft pt-3">
                <Badge tone={!s.active ? "off" : s.occupied ? "info" : "ok"}>
                  {!s.active ? "Pausada" : s.occupied ? "Ocupada" : "Livre para venda"}
                </Badge>
                {price?.key === s.id ? (
                  <form className="flex items-center gap-1.5" onSubmit={(e) => savePrice(e, s)}>
                    <label htmlFor={`pr-${s.id}`} className="sr-only">
                      Preço por semana de {s.name}
                    </label>
                    <input
                      id={`pr-${s.id}`}
                      inputMode="decimal"
                      autoFocus
                      value={price.value}
                      onChange={(e) => setPrice({ key: s.id, value: e.target.value })}
                      className={`${inputClass} min-h-9 w-24 px-2 text-[13px]`}
                    />
                    <button type="submit" className="min-h-9 cursor-pointer rounded-lg bg-adm-blue px-2.5 text-[13px] font-semibold text-white">
                      Salvar
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setPrice({ key: s.id, value: s.priceCents != null ? (s.priceCents / 100).toFixed(2).replace(".", ",") : "" })
                    }
                    className="flex min-h-10 cursor-pointer items-center border-0 bg-transparent text-[13px] font-semibold text-adm-blue"
                  >
                    {s.priceLabel} · editar<span className="sr-only"> preço de {s.name}</span>
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
        {slots.length === 0 && <p className="m-0 text-sm text-adm-muted">Nenhuma vitrine.</p>}
      </section>
    </>
  );
}
