"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type KeyboardEvent } from "react";
import { decideCampaign, updateAdSlot } from "@/app/actions/admin";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { FilterChips, Switch } from "@/components/admin/controls";
import { AdminEmpty, AdminNotice, Badge, SlotDiagram, btnPrimary, btnSecondary, inputClass } from "@/components/admin/ui";
import { AnuncioCard, type AnuncioItem, type AnuncioStatus } from "@/components/admin/vitrines/AnuncioCard";
import type { AdElement, AdSlot, Campaign, CampaignStatus } from "@/lib/types";
import { CATEGORIES, ELEMENTS, fieldToMilli, milliToField, occupiedLabel, slotPrice } from "./slots";

type Tab = "slots" | "camps";

export function MidiaClient({
  clubs,
  slotsByClub,
  campaigns,
  exampleMode = false,
}: {
  clubs: { slug: string; name: string }[];
  slotsByClub: Record<string, AdSlot[]>;
  campaigns: Campaign[];
  exampleMode?: boolean;
}) {
  const [club, setClub] = useState(clubs[0]?.slug ?? "");
  const [tab, setTab] = useState<Tab>("slots");
  const [activeOverride, setActiveOverride] = useState<Record<string, boolean>>({});
  const [decisions, setDecisions] = useState<Record<string, CampaignStatus>>({});
  const [announce, setAnnounce] = useState("");
  const [error, setError] = useState("");
  const [edit, setEdit] = useState<{ key: string; id: string; view: string; click: string; elements: AdElement[] } | null>(null);
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
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ slots: null, camps: null });

  const slots = (slotsByClub[club] ?? []).map((s) => {
    const key = `${club}:${s.id}`;
    return { ...s, on: activeOverride[key] ?? s.active, key };
  });
  // só as campanhas do ambiente escolhido (no modo exemplo, sem slug de cantor, mostra todas)
  const camps = campaigns
    .filter((c) => !c.clubSlug || c.clubSlug === club)
    .map((c) => ({ ...c, status: decisions[c.id] ?? c.status }));
  const pendingCount = camps.filter((c) => c.status === "pending").length;
  const today = new Date().toISOString().slice(0, 10);
  /** Situação para mostrar: a API diz "approved" tanto para a campanha agendada quanto para a já encerrada. */
  const phase = (c: Campaign & { status: CampaignStatus }): AnuncioStatus =>
    c.status === "approved" ? (c.end && c.end < today ? "ended" : c.start && c.start > today ? "scheduled" : "live") : c.status === "live" ? "live" : c.status;
  const toItem = (c: Campaign & { status: CampaignStatus }): AnuncioItem => ({
    id: c.id,
    sponsor: c.sponsor,
    title: c.title,
    text: c.text,
    cta: c.cta,
    artUrl: c.artUrl,
    videoUrl: c.videoUrl,
    status: phase(c),
    slotName: c.slotName,
    artist: c.club,
    fanClub: c.fanClub,
    start: c.start,
    end: c.end,
    views: c.views,
    clicks: c.clicks,
  });
  const byPhase = (st: AnuncioStatus[]) => camps.filter((c) => st.includes(phase(c)));

  const tabs: { id: Tab; label: string; count: string }[] = [
    { id: "slots", label: "Vitrines", count: `${slots.filter((s) => s.on).length}/${slots.length}` },
    { id: "camps", label: "Campanhas", count: `${pendingCount} pendentes` },
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
      />

      <p role="status" aria-live="polite" className="sr-only">
        {announce}
      </p>
      {exampleMode && (
        <AdminNotice tone="info">Modo exemplo: ligue o front à API (API_URL) para aprovar campanhas de verdade.</AdminNotice>
      )}
      {error && <AdminNotice tone="error">{error}</AdminNotice>}
      <div className="flex flex-col gap-2">
        <span id="md-club-label" className="text-xs font-semibold text-adm-muted">
          Fã clube
        </span>
        <FilterChips label="Fã clube" options={clubs.map((c) => ({ id: c.slug, label: c.name }))} value={club} onChange={setClub} />
      </div>

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
        <div role="tabpanel" id="panel-slots" aria-labelledby="tab-slots" className="flex flex-col gap-8">
          {slots.length === 0 && <AdminEmpty title="Nenhuma vitrine neste ambiente" text="As vitrines aparecem aqui quando o ambiente do cantor estiver configurado." />}
          {CATEGORIES.map((cat) => {
            const list = slots.filter((v) => (v.category ?? "entrada") === cat.id);
            if (list.length === 0) return null;
            return (
              <section key={cat.id} aria-labelledby={`cat-${cat.id}`} className="flex flex-col gap-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 id={`cat-${cat.id}`} className="m-0 font-display text-2xl font-black">
                    {cat.label}
                  </h2>
                  <span className="text-[13px] text-adm-muted">
                    {list.length} {list.length === 1 ? "vitrine" : "vitrines"} · {cat.hint}
                  </span>
                </div>
                <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr))]">
                  {list.map((v) => {
                    const occ = !v.on
                      ? { label: "Pausada", tone: "off" as const }
                      : v.occupied
                        ? { label: occupiedLabel(exampleMode, v.occupiedBy), tone: "info" as const }
                        : { label: "Livre para venda", tone: "ok" as const };
                    const editing = edit?.key === v.key;
                    const elements = v.elements ?? (["title", "text", "image"] as AdElement[]);
                    return (
                      <article key={v.key} className={`flex flex-col gap-3.5 rounded-xl border border-adm-line bg-white p-[18px] ${v.on ? "" : "opacity-60"}`}>
                        <div className="flex items-start gap-3.5">
                          <SlotDiagram top={v.diagram.top} height={v.diagram.height} />
                          <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <h3 className="m-0 text-base font-bold">{v.name}</h3>
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

                        {!editing ? (
                          <dl className="m-0 grid grid-cols-2 gap-2.5">
                            <div className="col-span-2 flex flex-col gap-1">
                              <dt className="font-adm-mono text-[11px] font-semibold uppercase text-adm-muted">Aceita</dt>
                              <dd className="m-0 flex flex-wrap gap-1.5">
                                {ELEMENTS.filter((e) => elements.includes(e.id)).map((e) => (
                                  <span key={e.id} className="rounded-full border border-adm-line px-2.5 py-0.5 text-[12px] font-semibold">
                                    {e.label}
                                  </span>
                                ))}
                              </dd>
                            </div>
                            <div className="col-span-2 flex flex-col gap-0.5">
                              <dt className="font-adm-mono text-[11px] font-semibold uppercase text-adm-muted">Preço</dt>
                              <dd className="m-0 text-[13px] font-semibold">{slotPrice(v, exampleMode)}</dd>
                            </div>
                          </dl>
                        ) : (
                          <form
                            className="flex flex-col gap-3 rounded-lg bg-adm-bg p-3.5"
                            onSubmit={(e) => {
                              e.preventDefault();
                              const view = fieldToMilli(edit.view);
                              const click = fieldToMilli(edit.click);
                              if (view === null || click === null) return setError("Digite os preços em reais, ex.: 0,012 por view e 0,80 por clique.");
                              if (edit.elements.length === 0) return setError("Escolha pelo menos um item que a vitrine aceita.");
                              run(
                                () => updateAdSlot(club, edit.id, { viewPriceMilli: view, clickPriceMilli: click, elements: edit.elements }),
                                () => setEdit(null),
                                "Vitrine salva.",
                              );
                            }}
                          >
                            <div className="grid grid-cols-2 gap-3">
                              <label className="flex flex-col gap-1 text-[13px] font-semibold">
                                Preço por view (R$)
                                <input
                                  inputMode="decimal"
                                  value={edit.view}
                                  onChange={(e) => setEdit({ ...edit, view: e.target.value })}
                                  className={`${inputClass} min-h-10 text-[14px] font-normal`}
                                  placeholder="0,012"
                                />
                              </label>
                              <label className="flex flex-col gap-1 text-[13px] font-semibold">
                                Preço por clique (R$)
                                <input
                                  inputMode="decimal"
                                  value={edit.click}
                                  onChange={(e) => setEdit({ ...edit, click: e.target.value })}
                                  className={`${inputClass} min-h-10 text-[14px] font-normal`}
                                  placeholder="0,80"
                                />
                              </label>
                            </div>
                            <fieldset className="m-0 flex flex-col gap-1.5 border-0 p-0">
                              <legend className="mb-1 p-0 text-[13px] font-semibold">O que o anúncio pode ter</legend>
                              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                                {ELEMENTS.map((el) => (
                                  <label key={el.id} className="flex min-h-9 cursor-pointer items-center gap-2 text-[14px]">
                                    <input
                                      type="checkbox"
                                      checked={edit.elements.includes(el.id)}
                                      onChange={(e) => setEdit({ ...edit, elements: e.target.checked ? [...edit.elements, el.id] : edit.elements.filter((x) => x !== el.id) })}
                                      className="size-4 accent-[var(--color-adm-blue)]"
                                    />
                                    {el.label}
                                  </label>
                                ))}
                              </div>
                            </fieldset>
                            <div className="flex gap-2">
                              <button type="submit" className={btnPrimary}>
                                Salvar
                              </button>
                              <button type="button" className={btnSecondary} onClick={() => setEdit(null)}>
                                Cancelar
                              </button>
                            </div>
                          </form>
                        )}

                        <div className="mt-auto flex items-center justify-between gap-2 border-t border-adm-line-soft pt-3">
                          <Badge tone={occ.tone}>{occ.label}</Badge>
                          {!editing && (
                            <button
                              type="button"
                              onClick={() => setEdit({ key: v.key, id: v.id, view: milliToField(v.viewPriceMilli), click: milliToField(v.clickPriceMilli), elements })}
                              className="flex min-h-10 cursor-pointer items-center border-0 bg-transparent text-[13px] font-semibold text-adm-blue hover:text-adm-blue-dark"
                            >
                              Editar<span className="sr-only"> {v.name}</span>
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {tab === "camps" && (
        <div role="tabpanel" id="panel-camps" aria-labelledby="tab-camps" className="flex flex-col gap-8">
          {camps.length === 0 && <AdminEmpty title="Nenhuma campanha neste ambiente" text="Quando um patrocinador pedir uma vitrine, a campanha aparece aqui." />}
          {(
            [
              { id: "pending", title: "Aguardando aprovação", text: "O patrocinador já pediu. Aprove para ir ao ar.", st: ["pending"] as AnuncioStatus[] },
              { id: "live", title: "No ar agora", text: "As campanhas que os fãs estão vendo hoje, em qual vitrine e por quanto tempo.", st: ["live"] as AnuncioStatus[] },
              { id: "scheduled", title: "Agendadas", text: "Aprovadas, ainda não começaram.", st: ["scheduled"] as AnuncioStatus[] },
              { id: "ended", title: "Encerradas e recusadas", text: "", st: ["ended", "rejected"] as AnuncioStatus[] },
            ]
          ).map((g) => {
            const list = byPhase(g.st);
            if (list.length === 0) return null;
            return (
              <section key={g.id} aria-labelledby={`camp-${g.id}`} className="flex flex-col gap-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 id={`camp-${g.id}`} className="m-0 font-display text-2xl font-black">
                    {g.title} <span className="font-adm-mono text-base text-adm-muted">{list.length}</span>
                  </h2>
                  {g.text && <span className="text-[13px] text-adm-muted">{g.text}</span>}
                </div>
                <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
                  {list.map((c) => (
                    <li key={c.id}>
                      <AnuncioCard ad={toItem(c)}>
                        {c.status === "pending" && (
                          <div className="flex flex-wrap gap-2 border-t border-adm-line-soft pt-3">
                            <button type="button" className={btnPrimary} onClick={() => decide(c, "approved")}>
                              Aprovar<span className="sr-only"> campanha de {c.sponsor}</span>
                            </button>
                            <button type="button" className={btnSecondary} onClick={() => decide(c, "rejected")}>
                              Recusar<span className="sr-only"> campanha de {c.sponsor}</span>
                            </button>
                          </div>
                        )}
                      </AnuncioCard>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}

