"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { loadPostDetail, loadTrackDetail } from "@/app/actions/admin";
import { ClubAvatar } from "@/components/admin/ClubAvatar";
import { Badge, btnSecondary } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import { formatCount } from "@/lib/format";
import type { PostDetail, ShareRow, TrackDetail } from "@/lib/types";

const when = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

const SHARE: Record<ShareRow["status"], { label: string; tone: "ok" | "warn" | "off" }> = {
  verified: { label: "Confirmado no Instagram", tone: "ok" },
  claimed: { label: "Aguardando conferência", tone: "warn" },
  started: { label: "Só iniciou", tone: "off" },
};

const PER_PAGE = 10;

/** Casca comum: janela modal com título, botão Fechar e rolagem. */
function Shell({ titleId, title, onClose, children }: { titleId: string; title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="m-auto max-h-[90vh] w-[min(860px,94vw)] overflow-y-auto rounded-2xl border border-adm-line bg-adm-bg p-0 text-adm-ink backdrop:bg-black/60"
    >
      <div className="flex flex-col gap-5 p-5">
        <div className="flex items-start gap-3">
          <h2 id={titleId} className="m-0 min-w-0 flex-1 font-display text-2xl font-black leading-7">
            {title}
          </h2>
          <button type="button" onClick={() => ref.current?.close()} className="cursor-pointer rounded-lg border border-adm-line bg-white px-3 py-1.5 text-sm font-semibold text-adm-ink">
            Fechar
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

function Stats({ items }: { items: { icon: "heart" | "comment" | "repost" | "eye" | "share"; label: string; value: number; note?: string }[] }) {
  return (
    <dl className="m-0 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((k) => (
        <div key={k.label} className="rounded-xl border border-adm-line bg-white px-3.5 py-3">
          <dt className="flex items-center gap-1.5 text-xs text-adm-muted">
            <Icon name={k.icon} size={14} />
            {k.label}
          </dt>
          <dd className="m-0 font-display text-3xl font-black leading-8">{formatCount(k.value)}</dd>
          {k.note && <span className="text-xs text-adm-muted">{k.note}</span>}
        </div>
      ))}
    </dl>
  );
}

/** Lista com 10 por página (as listas vêm do servidor com até 100 itens). */
function Paged<T>({ items, empty, render }: { items: T[]; empty: string; render: (item: T, i: number) => ReactNode }) {
  const [page, setPage] = useState(1);
  if (items.length === 0) return <p className="m-0 text-sm text-adm-muted">{empty}</p>;
  const pages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const at = Math.min(page, pages);
  const slice = items.slice((at - 1) * PER_PAGE, at * PER_PAGE);
  return (
    <div className="flex flex-col gap-2">
      <ul className="m-0 flex list-none flex-col p-0">{slice.map((it, i) => render(it, (at - 1) * PER_PAGE + i))}</ul>
      {pages > 1 && (
        <nav aria-label="Páginas" className="flex items-center justify-between gap-2 border-t border-adm-line-soft pt-2">
          <span className="font-adm-mono text-[13px] text-adm-muted">
            {(at - 1) * PER_PAGE + 1}–{(at - 1) * PER_PAGE + slice.length} de {formatCount(items.length)}
          </span>
          <span className="flex items-center gap-2">
            <button type="button" disabled={at <= 1} onClick={() => setPage(at - 1)} className={`${btnSecondary} disabled:opacity-40`}>
              Anterior
            </button>
            <span className="font-adm-mono text-[13px]">
              {at} / {pages}
            </span>
            <button type="button" disabled={at >= pages} onClick={() => setPage(at + 1)} className={`${btnSecondary} disabled:opacity-40`}>
              Próxima
            </button>
          </span>
        </nav>
      )}
    </div>
  );
}

function SharesSection({ id, total, verified, shares }: { id: string; total: number; verified: number; shares: ShareRow[] }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2">
      <h3 id={id} className="m-0 text-base font-bold">
        Quem compartilhou
      </h3>
      <p className="m-0 text-[13px] text-adm-muted">
        {formatCount(total)} {total === 1 ? "compartilhamento" : "compartilhamentos"} com a hashtag, {formatCount(verified)} já confirmados no Instagram.
      </p>
      <Paged
        items={shares}
        empty="Ninguém compartilhou ainda."
        render={(s, i) => (
          <li key={`${s.at}-${i}`} className="flex items-center gap-3 border-b border-adm-line-soft py-2">
            <ClubAvatar src={s.avatar} name={s.name} size={36} />
            <span className="flex min-w-0 flex-1 flex-col leading-5">
              <strong className="truncate text-sm">{s.name}</strong>
              <span className="font-adm-mono text-[12px] text-adm-muted">
                {s.handle ? `${s.handle} · ` : ""}
                {when(s.at)}
              </span>
            </span>
            <Badge tone={SHARE[s.status].tone}>{SHARE[s.status].label}</Badge>
          </li>
        )}
      />
    </section>
  );
}

function useDetail<T>(load: () => Promise<T | null>, key: string) {
  const [data, setData] = useState<T | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, start] = useTransition();
  useEffect(() => {
    start(async () => {
      const d = await load();
      setData(d);
      setFailed(!d);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- recarrega só quando muda o item aberto
  }, [key]);
  return { data, failed, loading };
}

/** Detalhes de um post do Drop News: foto, números, comentários e quem compartilhou. */
export function DetalhePostDialog({ artist, id, onClose }: { artist: string; id: string; onClose: () => void }) {
  const { data, failed, loading } = useDetail<PostDetail>(() => loadPostDetail(artist, id), id);
  return (
    <Shell titleId="dp-title" title="Detalhes da publicação" onClose={onClose}>
      {loading && !data && <p className="m-0 text-sm text-adm-muted">Carregando…</p>}
      {failed && <p className="m-0 text-sm text-adm-muted">Não foi possível carregar a publicação.</p>}
      {data && (
        <>
          <div className="flex flex-col gap-4 sm:flex-row">
            {data.image && (
              // eslint-disable-next-line @next/next/no-img-element -- foto do post
              <img src={data.image} alt="" className="aspect-[4/5] w-full rounded-xl object-cover sm:w-[260px]" />
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <p className="m-0 whitespace-pre-wrap break-words text-[15px] leading-6">{data.text}</p>
              <span className="font-adm-mono text-[12px] text-adm-muted">
                {when(data.createdAt)} · {data.official ? "Oficial" : (data.author?.name ?? "Fã")}
                {data.club ? ` · ${data.club}` : ""}
              </span>
              {data.url && (
                <a href={data.url} target="_blank" rel="noreferrer" className="break-all text-[13px] font-semibold text-adm-blue-dark">
                  {data.url}
                </a>
              )}
            </div>
          </div>

          <Stats
            items={[
              { icon: "heart", label: "Curtidas", value: data.likes },
              { icon: "comment", label: "Comentários", value: data.comments },
              { icon: "eye", label: "Visualizações", value: data.views },
              { icon: "repost", label: "Reposts", value: data.reposts },
            ]}
          />

          <section aria-labelledby="dp-comments" className="flex flex-col gap-2">
            <h3 id="dp-comments" className="m-0 text-base font-bold">
              Comentários
            </h3>
            <Paged
              items={data.commentList}
              empty="Ninguém comentou ainda."
              render={(c, i) => (
                <li key={`${c.at}-${i}`} className="flex items-start gap-3 border-b border-adm-line-soft py-2.5">
                  <ClubAvatar src={c.avatar} name={c.name} size={36} />
                  <span className="flex min-w-0 flex-1 flex-col leading-5">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <strong className="text-sm">{c.name}</strong>
                      <span className="font-adm-mono text-[12px] text-adm-muted">{when(c.at)}</span>
                    </span>
                    <span className="break-words text-sm">{c.text}</span>
                  </span>
                </li>
              )}
            />
          </section>

          <SharesSection id="dp-shares" total={data.sharesTotal} verified={data.sharesVerified} shares={data.shares} />
        </>
      )}
    </Shell>
  );
}

/** Detalhes de um hit do Drops Hits: curtidas, visualizações e quem compartilhou. */
export function DetalheHitDialog({ artist, id, onClose }: { artist: string; id: string; onClose: () => void }) {
  const { data, failed, loading } = useDetail<TrackDetail>(() => loadTrackDetail(artist, id), id);
  return (
    <Shell titleId="dh-title" title={data ? data.title : "Detalhes do hit"} onClose={onClose}>
      {loading && !data && <p className="m-0 text-sm text-adm-muted">Carregando…</p>}
      {failed && <p className="m-0 text-sm text-adm-muted">Não foi possível carregar o hit.</p>}
      {data && (
        <>
          <p className="m-0 text-[13px] text-adm-muted">
            {[data.meta, data.releaseLabel ? `Lançamento ${data.releaseLabel}` : "", `${data.durationSec}s de prévia`].filter(Boolean).join(" · ")}
          </p>
          <Stats
            items={[
              { icon: "heart", label: "Curtidas", value: data.likes, note: "votos pela versão completa" },
              { icon: "eye", label: "Visualizações", value: data.views },
              { icon: "share", label: "Compartilhamentos", value: data.sharesTotal, note: `${formatCount(data.sharesVerified)} confirmados` },
            ]}
          />
          <SharesSection id="dh-shares" total={data.sharesTotal} verified={data.sharesVerified} shares={data.shares} />
        </>
      )}
    </Shell>
  );
}
