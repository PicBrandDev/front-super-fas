"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent, type KeyboardEvent } from "react";
import { decideCampaign, inviteSponsor as inviteSponsorAction, updateAdSlot, type SponsorInvited } from "@/app/actions/admin";
import { TempPasswordNotice } from "@/components/admin/TempPasswordNotice";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { Switch } from "@/components/admin/controls";
import { Badge, SlotDiagram, btnPrimary, inputClass, tdClass, thClass, type Tone } from "@/components/admin/ui";
import type { AdSlot, Campaign, CampaignStatus, Sponsor } from "@/lib/types";

type Tab = "slots" | "camps" | "sponsors";

const campaignLook: Record<CampaignStatus, { label: string; tone: Tone }> = {
  live: { label: "No ar", tone: "ok" },
  approved: { label: "Aprovada", tone: "info" },
  pending: { label: "Aguardando aprovação", tone: "warn" },
  rejected: { label: "Recusada", tone: "off" },
};

type SponsorRow = Sponsor & { local?: boolean };

export function MidiaClient({
  clubs,
  slotsByClub,
  campaigns,
  sponsors,
}: {
  clubs: { slug: string; name: string }[];
  slotsByClub: Record<string, AdSlot[]>;
  campaigns: Campaign[];
  sponsors: Sponsor[];
}) {
  const [club, setClub] = useState(clubs[0]?.slug ?? "");
  const [tab, setTab] = useState<Tab>("slots");
  const [activeOverride, setActiveOverride] = useState<Record<string, boolean>>({});
  const [decisions, setDecisions] = useState<Record<string, CampaignStatus>>({});
  const [invited, setInvited] = useState<SponsorRow[]>([]);
  const [spEmail, setSpEmail] = useState("");
  const [spError, setSpError] = useState("");
  const [announce, setAnnounce] = useState("");
  const [error, setError] = useState("");
  const [newSponsor, setNewSponsor] = useState<SponsorInvited | null>(null);
  const [priceEdit, setPriceEdit] = useState<{ key: string; value: string } | null>(null);
  const [, start] = useTransition();
  const router = useRouter();

  /** Roda a ação na API. Sem API (status 0) só aplica na tela. */
  const run = (
    call: () => Promise<{ ok: boolean; status?: number; error?: string }>,
    apply: (saved: boolean) => void,
    done: string,
  ) =>
    start(async () => {
      const res = await call();
      if (!res.ok && res.status !== 0) {
        setError(res.error ?? "Não deu certo.");
        return;
      }
      setError("");
      apply(res.ok);
      setAnnounce(done);
      if (res.ok) router.refresh();
    });
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ slots: null, camps: null, sponsors: null });

  const slots = (slotsByClub[club] ?? []).map((s) => {
    const key = `${club}:${s.id}`;
    return { ...s, on: activeOverride[key] ?? s.active, key };
  });
  const camps = campaigns.map((c) => ({ ...c, status: decisions[c.id] ?? c.status }));
  const pendingCount = camps.filter((c) => c.status === "pending").length;
  const sponsorRows: SponsorRow[] = [...invited, ...sponsors];

  const tabs: { id: Tab; label: string; count: string }[] = [
    { id: "slots", label: "Vitrines", count: `${slots.filter((s) => s.on).length}/${slots.length}` },
    { id: "camps", label: "Campanhas", count: `${pendingCount} pendentes` },
    { id: "sponsors", label: "Patrocinadores", count: String(sponsorRows.length) },
  ];

  const decide = (c: Campaign, status: CampaignStatus) =>
    run(
      () => decideCampaign(c.id, status === "approved" ? "approve" : "reject"),
      // Salvo na API: o status certo (ex.: "No ar") vem no refresh. Sem API: só marca na tela.
      (saved) => {
        if (!saved) setDecisions((cur) => ({ ...cur, [c.id]: status }));
      },
      `Campanha de ${c.sponsor} ${status === "approved" ? "aprovada" : "recusada"}.`,
    );

  const inviteSponsor = (e: FormEvent) => {
    e.preventDefault();
    const email = spEmail.trim();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSpError("Digite um e-mail válido.");
      return;
    }
    start(async () => {
      const res = await inviteSponsorAction({ email });
      if (!res.ok && res.status !== 0) {
        setSpError(res.error);
        return;
      }
      if (res.ok) {
        setNewSponsor(res.data);
        router.refresh();
      } else {
        const id = `inv-${Date.now()}`;
        setInvited((cur) => [{ id, brand: "—", email, campaigns: 0, status: "invited", local: true }, ...cur]);
      }
      setSpEmail("");
      setSpError("");
      setAnnounce(`Conta criada para ${email}.`);
    });
  };

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next < 0) return;
    e.preventDefault();
    const id = tabs[next].id;
    setTab(id);
    tabRefs.current[id]?.focus();
  };

  return (
    <>
      <AdminPageHeader
        title="Plataforma de mídia"
        description="Venda vitrines de anúncio dentro dos fã clubes. O patrocinador escolhe o fã clube e a vitrine; você aprova antes de ir ao ar."
        actions={
          <div className="flex flex-col gap-1">
            <label htmlFor="md-club" className="text-xs font-semibold text-adm-muted">
              Fã clube
            </label>
            <select
              id="md-club"
              value={club}
              onChange={(e) => setClub(e.target.value)}
              className={`${inputClass} min-w-[220px] font-medium`}
            >
              {clubs.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <p role="status" aria-live="polite" className="sr-only">
        {announce}
      </p>
      {error && (
        <p role="alert" className="m-0 rounded-lg bg-[#fbeae7] px-3 py-2.5 text-sm font-semibold text-adm-danger">
          {error}
        </p>
      )}
      {newSponsor && (
        <TempPasswordNotice
          email={newSponsor.sponsor.email}
          password={newSponsor.tempPassword}
          onClose={() => setNewSponsor(null)}
        />
      )}

      <div role="tablist" aria-label="Seções da mídia" className="flex gap-1 overflow-x-auto border-b border-adm-line">
        {tabs.map((t, i) => {
          const on = t.id === tab;
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[t.id] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={on}
              aria-controls={`panel-${t.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setTab(t.id)}
              onKeyDown={(e) => onTabKey(e, i)}
              className={`-mb-px flex min-h-[46px] cursor-pointer items-center gap-2 whitespace-nowrap border-b-[3px] bg-transparent px-3.5 text-sm font-semibold ${
                on ? "border-adm-blue text-adm-ink" : "border-transparent text-adm-muted"
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-2 py-px font-adm-mono text-xs font-semibold ${
                  on ? "bg-adm-blue text-white" : "bg-adm-off-bg text-adm-off"
                }`}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {tab === "slots" && (
        <div
          role="tabpanel"
          id="panel-slots"
          aria-labelledby="tab-slots"
          className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr))]"
        >
          {slots.length === 0 && <p className="m-0 text-sm text-adm-muted">Nenhuma vitrine configurada neste fã clube.</p>}
          {slots.map((v) => {
            const occ = !v.on
              ? { label: "Pausada", tone: "off" as const }
              : v.occupied
                ? { label: "Ocupada", tone: "info" as const }
                : { label: "Livre para venda", tone: "ok" as const };
            return (
              <article
                key={v.key}
                className={`flex flex-col gap-3.5 rounded-xl border border-adm-line bg-white p-[18px] ${v.on ? "" : "opacity-60"}`}
              >
                <div className="flex items-start gap-3.5">
                  <SlotDiagram top={v.diagram.top} height={v.diagram.height} />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h2 className="m-0 text-base font-bold">{v.name}</h2>
                    <span className="text-[13px] leading-[1.4] text-adm-muted">{v.where}</span>
                  </div>
                  <Switch
                    checked={v.on}
                    label={`Vitrine ${v.name} ${v.on ? "ativa" : "pausada"}`}
                    onChange={(val) =>
                      run(
                        () => updateAdSlot(club, v.id, { active: val }),
                        () => setActiveOverride((cur) => ({ ...cur, [v.key]: val })),
                        `Vitrine ${v.name} ${val ? "ativada" : "pausada"}.`,
                      )
                    }
                  />
                </div>
                <dl className="m-0 grid grid-cols-2 gap-2.5">
                  <div className="flex flex-col gap-0.5">
                    <dt className="font-adm-mono text-[11px] font-semibold uppercase text-adm-muted">Formato</dt>
                    <dd className="m-0 text-[13px]">{v.format}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="font-adm-mono text-[11px] font-semibold uppercase text-adm-muted">Preço</dt>
                    <dd className="m-0 text-[13px] font-semibold">
                      {priceEdit?.key === v.key ? (
                        <form
                          className="flex items-center gap-1.5"
                          onSubmit={(e) => {
                            e.preventDefault();
                            const n = Number(priceEdit.value.replace(/[R$\s.]/g, "").replace(",", "."));
                            if (!Number.isFinite(n) || n < 0) {
                              setError("Digite o preço em reais, ex.: 500,00.");
                              return;
                            }
                            run(() => updateAdSlot(club, v.id, { priceCents: Math.round(n * 100) }), () => setPriceEdit(null), "Preço salvo.");
                          }}
                        >
                          <label htmlFor={`price-${v.key}`} className="sr-only">
                            Preço por semana de {v.name}
                          </label>
                          <input
                            id={`price-${v.key}`}
                            inputMode="decimal"
                            autoFocus
                            value={priceEdit.value}
                            onChange={(e) => setPriceEdit({ key: v.key, value: e.target.value })}
                            className={`${inputClass} min-h-9 w-24 px-2 text-[13px]`}
                          />
                          <button type="submit" className="min-h-9 cursor-pointer rounded-lg bg-adm-blue px-2.5 text-[13px] font-semibold text-white">
                            Salvar
                          </button>
                        </form>
                      ) : (
                        v.priceLabel
                      )}
                    </dd>
                  </div>
                </dl>
                <div className="flex items-center justify-between gap-2 border-t border-adm-line-soft pt-3">
                  <Badge tone={occ.tone}>{occ.label}</Badge>
                  <button
                    type="button"
                    onClick={() =>
                      setPriceEdit(
                        priceEdit?.key === v.key
                          ? null
                          : { key: v.key, value: v.priceCents != null ? (v.priceCents / 100).toFixed(2).replace(".", ",") : "" },
                      )
                    }
                    className="flex min-h-10 cursor-pointer items-center border-0 bg-transparent text-[13px] font-semibold text-adm-blue hover:text-adm-blue-dark"
                  >
                    {priceEdit?.key === v.key ? "Cancelar" : "Editar preço"}
                    <span className="sr-only"> de {v.name}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {tab === "camps" && (
        <div
          role="tabpanel"
          id="panel-camps"
          aria-labelledby="tab-camps"
          className="overflow-x-auto rounded-xl border border-adm-line bg-white"
        >
          <table className="w-full min-w-[820px] border-collapse text-sm">
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
              {camps.map((c) => {
                const look = campaignLook[c.status];
                return (
                  <tr key={c.id}>
                    <td className={`${tdClass} font-semibold`}>{c.sponsor}</td>
                    <td className={tdClass}>
                      {c.slotName}
                      {c.club && <span className="block text-xs text-adm-muted">{c.club}</span>}
                    </td>
                    <td className={`${tdClass} text-adm-muted`}>{c.title}</td>
                    <td className={`${tdClass} font-adm-mono text-[13px]`}>{c.period}</td>
                    <td className={tdClass}>
                      <Badge tone={look.tone}>{look.label}</Badge>
                    </td>
                    <td className={tdClass}>
                      {c.status === "pending" && (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => decide(c, "rejected")}
                            className="inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-adm-line bg-white px-3 text-[13px] font-semibold text-adm-ink"
                          >
                            Recusar<span className="sr-only"> campanha de {c.sponsor}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => decide(c, "approved")}
                            className="inline-flex min-h-10 cursor-pointer items-center rounded-lg bg-adm-blue px-3 text-[13px] font-semibold text-white"
                          >
                            Aprovar<span className="sr-only"> campanha de {c.sponsor}</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {camps.length === 0 && <p className="m-0 px-4 py-6 text-sm text-adm-muted">Nenhuma campanha ainda.</p>}
        </div>
      )}

      {tab === "sponsors" && (
        <div role="tabpanel" id="panel-sponsors" aria-labelledby="tab-sponsors" className="flex flex-col gap-3.5">
          <form
            onSubmit={inviteSponsor}
            noValidate
            className="flex flex-wrap items-end gap-2.5 rounded-xl border border-adm-line bg-white p-4"
          >
            <div className="flex flex-[1_1_260px] flex-col gap-1.5">
              <label htmlFor="sp-email" className="text-[13px] font-semibold">
                Convidar patrocinador
              </label>
              <input
                id="sp-email"
                type="email"
                value={spEmail}
                onChange={(e) => {
                  setSpEmail(e.target.value);
                  if (spError) setSpError("");
                }}
                placeholder="contato@marca.com"
                autoComplete="off"
                aria-invalid={spError ? true : undefined}
                aria-describedby={spError ? "sp-email-error" : undefined}
                className={inputClass}
              />
            </div>
            <button type="submit" className={btnPrimary}>
              Enviar convite
            </button>
            {spError && (
              <span id="sp-email-error" role="alert" className="basis-full text-xs font-semibold text-adm-danger">
                {spError}
              </span>
            )}
          </form>
          <div className="overflow-x-auto rounded-xl border border-adm-line bg-white">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="bg-adm-bg">
                  <th scope="col" className={thClass}>Marca</th>
                  <th scope="col" className={thClass}>Contato</th>
                  <th scope="col" className={thClass}>Campanhas</th>
                  <th scope="col" className={thClass}>Acesso</th>
                </tr>
              </thead>
              <tbody>
                {sponsorRows.map((s) => (
                  <tr key={s.id}>
                    <td className={`${tdClass} font-semibold`}>{s.brand}</td>
                    <td className={`${tdClass} font-adm-mono text-[13px]`}>{s.email}</td>
                    <td className={tdClass}>{s.campaigns}</td>
                    <td className={tdClass}>
                      <Badge tone={s.status === "active" ? "ok" : "warn"}>
                        {s.status === "active" ? "Ativo" : "Convite pendente"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

