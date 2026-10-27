"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { loadSubscriberActivity, loadSubscribers } from "@/app/actions/admin";
import { ClubAvatar } from "@/components/admin/ClubAvatar";
import { Badge, inputClass } from "@/components/admin/ui";
import { formatBRL, formatCount } from "@/lib/format";
import type { ActivityEvent, MemberPerk, SubscriberActivity, SubscriberPage, SubscriberRow } from "@/lib/types";

const day = (iso: string | null) => (iso ? iso.split("-").reverse().join("/") : "—");
const when = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
const place = (r: SubscriberRow) => [r.city, r.state].filter(Boolean).join(" · ");

/** Grupo (etiqueta) de cada tipo de ação da linha do tempo. */
const GROUP: Record<string, { label: string; tone: "ok" | "warn" | "off" | "info" }> = {
  assinou: { label: "Assinatura", tone: "ok" },
  giro: { label: "Roleta", tone: "info" },
  giro_ganho: { label: "Roleta", tone: "off" },
  brinde: { label: "Brinde", tone: "info" },
  retirada: { label: "Brinde", tone: "ok" },
  cupom: { label: "Cupom", tone: "warn" },
  ingresso: { label: "Compra", tone: "ok" },
  loja: { label: "Compra", tone: "ok" },
  share: { label: "Instagram", tone: "off" },
  confirmado: { label: "Instagram", tone: "ok" },
  post: { label: "Post", tone: "off" },
  comentario: { label: "Comentário", tone: "off" },
};

/**
 * Assinantes ativos, do que assinou por último ao mais antigo, 10 por página, com busca pelo nome.
 * Clicar numa pessoa abre as ações dela: roleta, brindes, cupons, compras, Instagram, posts e comentários.
 */
export function ListaAssinantes({ artist, initial, perks }: { artist: string; initial: SubscriberPage | null; perks: MemberPerk[] }) {
  const [data, setData] = useState<SubscriberPage | null>(initial);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [picked, setPicked] = useState<SubscriberRow | null>(null);
  const [loading, start] = useTransition();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // espera 300 ms depois da última tecla para não buscar a cada letra
    const t = setTimeout(() => start(async () => setData(await loadSubscribers(artist, q, page))), 300);
    return () => clearTimeout(t);
  }, [artist, q, page]);

  const items = data?.items ?? [];
  const from = data && data.total ? (data.page - 1) * data.pageSize + 1 : 0;

  return (
    <section aria-labelledby="ass-title" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="ass-title" className="m-0 font-display text-3xl font-black">
            Quem são os assinantes
          </h2>
          <p className="m-0 text-[13px] text-adm-muted">Do que assinou por último ao mais antigo. Clique numa pessoa para ver as ações dela.</p>
        </div>
        <div className="flex w-full max-w-[360px] flex-col gap-1">
          <label htmlFor="ass-busca" className="sr-only">
            Buscar assinante pelo nome
          </label>
          <input
            id="ass-busca"
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar pelo nome"
            autoComplete="off"
            className={inputClass}
          />
        </div>
      </div>

      <div className="rounded-xl border border-adm-line bg-white p-4" aria-busy={loading}>
        {!data ? (
          <p className="m-0 text-sm text-adm-muted">Lista indisponível. Ligue o front à API para ver os assinantes.</p>
        ) : items.length === 0 ? (
          <p className="m-0 text-sm text-adm-muted">{q.trim() ? "Nenhum assinante com esse nome." : "Ainda não há assinantes ativos."}</p>
        ) : (
          <ol className="m-0 grid list-none gap-x-6 gap-y-1 p-0 md:grid-cols-2" start={from}>
            {items.map((p) => (
              <li key={p.userId} className="border-b border-adm-line-soft">
                <button
                  type="button"
                  onClick={() => setPicked(p)}
                  aria-label={`Ver as ações de ${p.name}`}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg border-0 bg-transparent px-1 py-2 text-left text-adm-ink hover:bg-adm-bg"
                >
                  <ClubAvatar src={p.avatar} name={p.name} size={44} />
                  <span className="flex min-w-0 flex-1 flex-col leading-5">
                    <strong className="truncate text-sm">{p.name}</strong>
                    <span className="truncate text-[13px] text-adm-muted">{[p.handle, place(p)].filter(Boolean).join(" · ") || p.email}</span>
                  </span>
                  <span className="text-right font-adm-mono text-[13px] font-semibold">
                    {day(p.since)}
                    <span className="block text-[11px] font-normal text-adm-muted">assinou</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        )}

        {data && data.total > 0 && (
          <nav aria-label="Páginas dos assinantes" className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-adm-line-soft pt-3">
            <span role="status" aria-live="polite" className="font-adm-mono text-[13px] text-adm-muted">
              {from}–{from + items.length - 1} de {formatCount(data.total)}
            </span>
            <span className="flex items-center gap-2">
              <button
                type="button"
                disabled={data.page <= 1 || loading}
                onClick={() => setPage(data.page - 1)}
                className="cursor-pointer rounded-lg border border-adm-line bg-white px-3 py-1.5 text-[13px] font-semibold text-adm-ink disabled:cursor-default disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="font-adm-mono text-[13px]">
                {data.page} / {data.pages}
              </span>
              <button
                type="button"
                disabled={data.page >= data.pages || loading}
                onClick={() => setPage(data.page + 1)}
                className="cursor-pointer rounded-lg border border-adm-line bg-white px-3 py-1.5 text-[13px] font-semibold text-adm-ink disabled:cursor-default disabled:opacity-40"
              >
                Próxima
              </button>
            </span>
          </nav>
        )}
      </div>

      {picked && <ActivityDialog artist={artist} person={picked} perks={perks} onClose={() => setPicked(null)} />}
    </section>
  );
}

function ActivityDialog({ artist, person, perks, onClose }: { artist: string; person: SubscriberRow; perks: MemberPerk[]; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [data, setData] = useState<SubscriberActivity | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, start] = useTransition();

  useEffect(() => {
    ref.current?.showModal();
    start(async () => {
      const a = await loadSubscriberActivity(artist, person.userId);
      setData(a);
      setFailed(!a);
    });
  }, [artist, person.userId]);

  const s = data?.summary;
  const kpis = s
    ? [
        { label: "Giros da roleta", value: `${s.spinsUsed} usados`, note: `${s.spinsLeft} disponíveis` },
        { label: "Pontos da sorte", value: formatCount(s.luckPoints), note: "da roleta" },
        { label: "Brindes", value: `${s.rewards} ganhos`, note: `${s.rewardsRedeemed} retirados` },
        { label: "Cupons", value: `${s.coupons} recebidos`, note: `${s.couponsUsed} usados` },
        { label: "Compras", value: formatBRL(s.spentCents), note: `${s.purchases} ${s.purchases === 1 ? "compra" : "compras"}` },
        { label: "Instagram", value: `${s.sharesConfirmed} confirmados`, note: "compartilhamentos" },
        { label: "Posts", value: formatCount(s.posts), note: "publicados" },
        { label: "Comentários", value: formatCount(s.comments), note: "em posts" },
      ]
    : [];

  return (
    <dialog
      ref={ref}
      aria-labelledby="sa-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="m-auto max-h-[88vh] w-[min(920px,94vw)] overflow-y-auto rounded-2xl border border-adm-line bg-adm-bg p-0 text-adm-ink backdrop:bg-black/60"
    >
      <div className="flex flex-col gap-5 p-5">
        <div className="flex items-center gap-4">
          <ClubAvatar src={person.avatar} name={person.name} size={64} />
          <div className="flex min-w-0 flex-1 flex-col">
            <h2 id="sa-title" className="m-0 truncate font-display text-2xl font-black">
              {person.name}
            </h2>
            <span className="truncate text-[13px] text-adm-muted">{[person.handle, person.email].filter(Boolean).join(" · ")}</span>
            <span className="text-[13px] text-adm-muted">
              {place(person) ? `${place(person)} · ` : ""}assinante desde {day(person.since)} · {person.payment}
            </span>
          </div>
          <button type="button" onClick={() => ref.current?.close()} className="cursor-pointer rounded-lg border border-adm-line bg-white px-3 py-1.5 text-sm font-semibold text-adm-ink">
            Fechar
          </button>
        </div>

        {loading && !data && <p className="m-0 text-sm text-adm-muted">Carregando as ações…</p>}
        {failed && <p className="m-0 text-sm text-adm-muted">Não foi possível carregar as ações.</p>}

        {data && (
          <>
            <dl className="m-0 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {kpis.map((k) => (
                <div key={k.label} className="rounded-xl border border-adm-line bg-white px-3.5 py-3">
                  <dt className="text-xs text-adm-muted">{k.label}</dt>
                  <dd className="m-0 text-lg font-bold leading-6">{k.value}</dd>
                  <span className="text-xs text-adm-muted">{k.note}</span>
                </div>
              ))}
            </dl>

            <section aria-labelledby="sa-direitos" className="flex flex-col gap-2">
              <h3 id="sa-direitos" className="m-0 text-base font-bold">
                O que ele tem direito
              </h3>
              {perks.length === 0 ? (
                <p className="m-0 text-sm text-adm-muted">Nenhuma vantagem cadastrada.</p>
              ) : (
                <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
                  {perks.map((p) => (
                    <li key={p.title} className="flex flex-col rounded-xl border border-adm-line bg-white px-3.5 py-2.5 leading-5">
                      <strong className="text-sm">{p.title}</strong>
                      <span className="text-[13px] text-adm-muted">{p.sub}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="sa-cupons" className="flex flex-col gap-2">
              <h3 id="sa-cupons" className="m-0 text-base font-bold">
                Cupons
              </h3>
              {data.coupons.length === 0 ? (
                <p className="m-0 text-sm text-adm-muted">Ainda não recebeu nenhum cupom.</p>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {data.coupons.map((c) => (
                    <li key={c.code} className="flex flex-wrap items-center gap-3 rounded-xl border border-adm-line bg-white px-3.5 py-2.5">
                      <strong className="font-adm-mono text-sm">{c.code}</strong>
                      <span className="text-[13px] text-adm-muted">
                        {c.kind === "percent" ? `${c.value}% de desconto` : `${formatBRL(c.value)} de desconto`}
                        {c.source ? ` · ${c.source}` : ""}
                        {c.expiresOn ? ` · vale até ${day(c.expiresOn)}` : ""}
                      </span>
                      <span className="ml-auto">
                        <Badge tone={c.used ? "ok" : "warn"}>{c.used ? "Já usou" : "Ainda não usou"}</Badge>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="sa-acoes" className="flex flex-col gap-2">
              <h3 id="sa-acoes" className="m-0 text-base font-bold">
                Ações (mais recentes primeiro)
              </h3>
              {data.events.length === 0 ? (
                <p className="m-0 text-sm text-adm-muted">Ainda não fez nenhuma ação.</p>
              ) : (
                <ul className="m-0 flex list-none flex-col p-0">
                  {data.events.map((e, i) => (
                    <Event key={`${e.at}-${i}`} e={e} />
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </dialog>
  );
}

function Event({ e }: { e: ActivityEvent }) {
  const g = GROUP[e.kind] ?? { label: "Ação", tone: "off" as const };
  return (
    <li className="flex items-start gap-3 border-b border-adm-line-soft py-2.5">
      <span className="w-[104px] flex-none pt-0.5 font-adm-mono text-[12px] text-adm-muted">{when(e.at)}</span>
      <span className="w-[92px] flex-none">
        <Badge tone={g.tone}>{g.label}</Badge>
      </span>
      <span className="flex min-w-0 flex-1 flex-col leading-5">
        <strong className="text-sm">{e.title}</strong>
        {e.detail && <span className="text-[13px] text-adm-muted">{e.detail}</span>}
      </span>
    </li>
  );
}
