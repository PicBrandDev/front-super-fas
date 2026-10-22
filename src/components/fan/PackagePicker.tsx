"use client";

import { Icon } from "@/components/icons";
import { formatBRL } from "@/lib/format";
import type { EventPackage } from "@/lib/types";

const KIND_LABEL = {
  photo: "Ingresso + transfer + selo + Photo Finder",
  seal: "Ingresso + transfer + selo",
  transfer: "Ingresso + transfer",
  ticket: "Somente ingresso",
} as const;

/**
 * Pacotes da agência do show: cada pacote tem cartões de opção (só ingresso, + transfer, + selo, + Photo Finder),
 * cada um com o seu valor, e o fã escolhe um. Usado na tela do show e no modal de compra do Início.
 */
export function PackagePicker({
  packages,
  choice,
  onChoose,
  labelledBy,
}: {
  packages: EventPackage[];
  choice: { id: string; item: number } | null;
  onChoose: (packageId: string, item: number) => void;
  labelledBy?: string;
}) {
  // Pacotes agrupados por agência.
  const byAgency = packages.reduce<Map<string, EventPackage[]>>((acc, p) => acc.set(p.agencyName, [...(acc.get(p.agencyName) ?? []), p]), new Map());

  return (
    <div role="radiogroup" aria-labelledby={labelledBy} aria-label={labelledBy ? undefined : "Pacotes das agências"}>
      {[...byAgency.entries()].map(([agency, list]) => (
        <div key={agency} className="mt-6 flex flex-col gap-3 first:mt-0">
          <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
            <h4 className="m-0 font-display text-lg font-black leading-6">{agency}</h4>
            <span className="mono">
              {list.length} {list.length === 1 ? "pacote" : "pacotes"}
              {list[0].agencyContact ? ` · ${list[0].agencyContact}` : ""}
            </span>
          </div>
          {list.map((p) => (
            <article key={p.id} className="flex flex-col gap-3 border border-line bg-surface p-4">
              <header className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-[17px] leading-6">{p.name}</strong>
                {p.hasTransfer && <span className="tag tag-key">Com transfer</span>}
                {p.items.some((i) => i.kind === "seal" || i.kind === "photo") && (
                  <span className="tag tag-key">
                    <Icon name="star" size={11} />
                    Selo no app do Vintage
                  </span>
                )}
                {p.items.some((i) => i.kind === "photo") && (
                  <span className="tag">
                    <Icon name="camera" size={11} />
                    Photo Finder: suas fotos do show no app
                  </span>
                )}
              </header>
              {p.description && <p className="m-0 text-[15px] leading-[22px] text-fg-muted">{p.description}</p>}
              <div role="radiogroup" aria-label={`Opções do pacote ${p.name}`} className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
                {p.items.map((it, idx) => {
                  const on = choice?.id === p.id && choice.item === idx;
                  return (
                    <label
                      key={idx}
                      className={`flex flex-col gap-1 border p-3 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-amber ${
                        on ? "border-amber bg-raised" : "border-line bg-night"
                      } ${it.soldOut ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                    >
                      <input type="radio" name="opcao" className="sr-only" checked={on} disabled={it.soldOut} onChange={() => onChoose(p.id, idx)} />
                      <span className="mono">{KIND_LABEL[it.kind]}</span>
                      <strong className="text-[16px] leading-5">{it.label}</strong>
                      <span className={`num text-[16px] ${it.soldOut ? "line-through" : ""}`}>{formatBRL(it.priceCents)}</span>
                      {(it.kind === "seal" || it.kind === "photo") && (
                        <span className="tag tag-key self-start">
                          <Icon name="star" size={11} />
                          Selo no app
                        </span>
                      )}
                      {it.kind === "photo" && (
                        <span className="tag self-start">
                          <Icon name="camera" size={11} />
                          Photo Finder
                        </span>
                      )}
                      {it.soldOut && <span className="tag tag-demo self-start">Esgotado</span>}
                    </label>
                  );
                })}
              </div>
              {p.transferDetails && (
                <p className="m-0 text-[14px] leading-5 text-fg-muted">
                  <span className="mono">Transfer</span> · {p.transferDetails}
                </p>
              )}
            </article>
          ))}
        </div>
      ))}
    </div>
  );
}
