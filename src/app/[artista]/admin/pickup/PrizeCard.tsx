"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { loadPrizeWinners, setPrizeStock } from "@/app/actions/admin";
import { ClubAvatar } from "@/components/admin/ClubAvatar";
import { Badge, btnSecondary, inputClass } from "@/components/admin/ui";
import { formatCount } from "@/lib/format";
import type { PickupPrize, PickupWinner, PickupWinnerPage } from "@/lib/types";
import { kindStyle } from "./RoletaSvg";

const when = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

const STATUS: Record<string, { label: string; tone: "ok" | "warn" | "off" | "info" }> = {
  available: { label: "Ainda não usou", tone: "warn" },
  used: { label: "Cupom usado", tone: "ok" },
  redeemed: { label: "Retirou", tone: "ok" },
  expired: { label: "Venceu", tone: "off" },
};

/** Um brinde da roleta: estoque (com barra e edição), quem ganhou por último e a lista completa de ganhadores. */
export function PrizeCard({ artist, club, prize }: { artist: string; club: string; prize: PickupPrize }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(prize.stock === null ? "" : String(prize.stock));
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const style = kindStyle(prize.kind, prize.isRetry);
  const limited = prize.stock !== null;
  const noReward = prize.isRetry || prize.kind === "none" || prize.kind === "retry";
  const pct = limited && prize.stock! > 0 ? Math.max(0, Math.min(100, ((prize.remaining ?? 0) / prize.stock!) * 100)) : 100;
  const soldOut = prize.remaining === 0;

  const save = (stock: number | null) =>
    start(async () => {
      const res = await setPrizeStock(artist, club, prize.id, stock);
      if (!res.ok) return setError(res.error);
      setError("");
      setEditing(false);
      router.refresh();
    });

  const submit = () => {
    const t = value.trim();
    if (t === "") return save(null);
    const n = Number(t);
    if (!Number.isInteger(n) || n < 0) return setError("Digite um número inteiro (ou deixe vazio para sem limite).");
    save(n);
  };

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-adm-line bg-white p-4">
      <header className="flex items-start gap-3">
        <span aria-hidden="true" className="mt-1 size-3.5 flex-none rounded-full" style={{ background: style.color }} />
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="m-0 break-words text-base font-bold leading-5">{prize.label}</h3>
          <span className="text-[13px] text-adm-muted">
            {style.label}
            {prize.kind === "coupon" && prize.percent ? ` · ${prize.percent}%` : ""}
            {prize.points ? ` · +${prize.points} pontos da sorte` : ""}
          </span>
        </div>
        {soldOut && <Badge tone="warn">Esgotado</Badge>}
      </header>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-adm-mono text-xs font-semibold text-adm-muted">Estoque</span>
          <span className="font-adm-mono text-sm font-semibold">
            {limited ? `restam ${formatCount(prize.remaining ?? 0)} de ${formatCount(prize.stock!)}` : "sem limite"}
          </span>
        </div>
        <div aria-hidden="true" className="h-2.5 overflow-hidden rounded-full bg-adm-line-soft">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: soldOut ? "#B84040" : style.color }} />
        </div>
        <span className="text-[13px] text-adm-muted">
          {noReward ? "Saiu" : "Ganho"} {formatCount(prize.won)} {prize.won === 1 ? "vez" : "vezes"}
        </span>
      </div>

      {editing ? (
        <div className="flex flex-col gap-2">
          <label htmlFor={`stock-${prize.id}`} className="text-[13px] font-semibold">
            Quantas unidades existem? (vazio = sem limite)
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              id={`stock-${prize.id}`}
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Ex.: 100"
              className={`${inputClass} w-32`}
            />
            <button type="button" disabled={pending} onClick={submit} className="cursor-pointer rounded-lg border-0 bg-adm-blue px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-60">
              Salvar
            </button>
            <button type="button" disabled={pending} onClick={() => setEditing(false)} className={btnSecondary}>
              Cancelar
            </button>
          </div>
          {error && <p className="m-0 text-[13px] text-red-400">{error}</p>}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setEditing(true)} className={btnSecondary}>
            {limited ? "Mudar estoque" : "Definir estoque"}
          </button>
        </div>
      )}

      <section aria-label={`Quem ganhou ${prize.label}`} className="flex flex-col gap-2 border-t border-adm-line-soft pt-3">
        <button
          type="button"
          disabled={prize.won === 0}
          onClick={() => setOpen(true)}
          className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-adm-line bg-adm-bg px-3 py-2 text-left text-adm-ink enabled:hover:border-adm-blue disabled:cursor-default"
        >
          <span className="flex flex-col leading-5">
            <span className="text-[13px] font-bold">{noReward ? "Quem tirou" : "Quem ganhou"}</span>
            <span className="font-adm-mono text-[12px] text-adm-muted">
              {formatCount(prize.people)} {prize.people === 1 ? "pessoa" : "pessoas"} · {formatCount(prize.won)} {prize.won === 1 ? "vez" : "vezes"}
            </span>
          </span>
          <span className="text-[13px] font-semibold text-adm-blue-dark">{prize.won > 0 ? "Ver lista ›" : "Ninguém ainda"}</span>
        </button>
        {prize.recent.length > 0 && (
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {prize.recent.slice(0, 3).map((w, i) => (
              <WinnerRow key={`${w.at}-${i}`} w={w} showCode={!noReward} />
            ))}
          </ul>
        )}
      </section>

      {open && <WinnersDialog artist={artist} prize={prize} noReward={noReward} onClose={() => setOpen(false)} />}
    </article>
  );
}

function WinnerRow({ w, showCode }: { w: PickupWinner; showCode: boolean }) {
  const st = STATUS[w.status];
  return (
    <li className="flex items-center gap-2.5">
      <ClubAvatar src={w.avatar} name={w.name} size={30} />
      <span className="flex min-w-0 flex-1 flex-col leading-4">
        <strong className="truncate text-[13px]">{w.name}</strong>
        <span className="font-adm-mono text-[11px] text-adm-muted">
          {when(w.at)}
          {showCode && w.code ? ` · ${w.code}` : ""}
        </span>
      </span>
      {st && <Badge tone={st.tone}>{st.label}</Badge>}
    </li>
  );
}

/** Todos os ganhadores de uma fatia, 10 por página. */
function WinnersDialog({ artist, prize, noReward, onClose }: { artist: string; prize: PickupPrize; noReward: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [data, setData] = useState<PickupWinnerPage | null>(null);
  const [page, setPage] = useState(1);
  const [loading, start] = useTransition();

  useEffect(() => {
    ref.current?.showModal();
  }, []);
  useEffect(() => {
    start(async () => setData(await loadPrizeWinners(artist, prize.id, page)));
  }, [artist, prize.id, page]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={`wd-${prize.id}`}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="m-auto max-h-[88vh] w-[min(640px,94vw)] overflow-y-auto rounded-2xl border border-adm-line bg-adm-bg p-0 text-adm-ink backdrop:bg-black/60"
    >
      <div className="flex flex-col gap-4 p-5" aria-busy={loading}>
        <div className="flex items-center gap-3">
          <h2 id={`wd-${prize.id}`} className="m-0 min-w-0 flex-1 font-display text-2xl font-black leading-7">
            {noReward ? "Quem tirou" : "Quem ganhou"}: {prize.label}
          </h2>
          <button type="button" onClick={() => ref.current?.close()} className="cursor-pointer rounded-lg border border-adm-line bg-white px-3 py-1.5 text-sm font-semibold text-adm-ink">
            Fechar
          </button>
        </div>
        {!data ? (
          <p className="m-0 text-sm text-adm-muted">{loading ? "Carregando…" : "Não foi possível carregar."}</p>
        ) : (
          <>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {data.items.map((w, i) => (
                <WinnerRow key={`${w.at}-${i}`} w={w} showCode={!noReward} />
              ))}
            </ul>
            <nav aria-label="Páginas" className="flex items-center justify-between gap-2 border-t border-adm-line-soft pt-3">
              <span className="font-adm-mono text-[13px] text-adm-muted">
                {data.items.length ? (data.page - 1) * data.pageSize + 1 : 0}–{(data.page - 1) * data.pageSize + data.items.length} de {formatCount(data.total)}
              </span>
              <span className="flex items-center gap-2">
                <button type="button" disabled={data.page <= 1 || loading} onClick={() => setPage(data.page - 1)} className={`${btnSecondary} disabled:opacity-40`}>
                  Anterior
                </button>
                <span className="font-adm-mono text-[13px]">
                  {data.page} / {data.pages}
                </span>
                <button type="button" disabled={data.page >= data.pages || loading} onClick={() => setPage(data.page + 1)} className={`${btnSecondary} disabled:opacity-40`}>
                  Próxima
                </button>
              </span>
            </nav>
          </>
        )}
      </div>
    </dialog>
  );
}
