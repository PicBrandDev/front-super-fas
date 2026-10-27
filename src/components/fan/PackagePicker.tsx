"use client";

import { Icon } from "@/components/icons";
import { PHOTO_FINDER_NOTE } from "@/lib/experiences";
import { formatBRL } from "@/lib/format";
import type { PackageChoice } from "@/lib/package-choice";
import type { EventPackage } from "@/lib/types";

/**
 * Experiências extras das agências do show (jantar, camarim, pré-esquenta, after, hotel). O ingresso não é vendido
 * aqui: o fã compra na Ingresse e só marca as experiências que quer somar. O Photo Finder vem em toda compra.
 * Usado na tela do show e no modal do Início.
 */
export function PackagePicker({
  packages,
  choice,
  onToggleAddon,
  labelledBy,
}: {
  packages: EventPackage[];
  choice: PackageChoice | null;
  onToggleAddon: (packageId: string, key: string) => void;
  labelledBy?: string;
}) {
  // Pacotes agrupados por agência.
  const byAgency = packages.reduce<Map<string, EventPackage[]>>((acc, p) => acc.set(p.agencyName, [...(acc.get(p.agencyName) ?? []), p]), new Map());

  return (
    <div role="group" aria-labelledby={labelledBy} aria-label={labelledBy ? undefined : "Experiências extras das agências"}>
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
              </header>
              {p.description && <p className="m-0 text-[15px] leading-[22px] text-fg-muted">{p.description}</p>}
              <p className="m-0 flex items-start gap-1.5 text-[14px] leading-5 text-fg-muted">
                <Icon name="camera" size={14} />
                <span>{PHOTO_FINDER_NOTE}</span>
              </p>
              {p.addons.length === 0 ? (
                <p className="m-0 text-[14px] leading-5 text-fg-muted">Este pacote ainda não tem experiências extras à venda.</p>
              ) : (
                <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
                  <legend className="mono mb-1 p-0">Escolha suas experiências extras</legend>
                  {p.addons.map((a) => {
                    const on = choice?.id === p.id && choice.addons.includes(a.key);
                    return (
                      <label
                        key={a.key}
                        className={`flex items-center gap-3 border p-3 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-amber ${
                          on ? "border-amber bg-raised" : "border-line bg-night"
                        } ${a.soldOut ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                      >
                        <input type="checkbox" className="size-5 flex-none accent-amber" checked={on} disabled={a.soldOut} onChange={() => onToggleAddon(p.id, a.key)} />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <strong className="text-[15px] leading-5">{a.label}</strong>
                          {a.soldOut && <span className="tag tag-demo self-start">Esgotado</span>}
                        </span>
                        <span className={`num flex-none text-[15px] ${a.soldOut ? "line-through" : ""}`}>+ {formatBRL(a.priceCents)}</span>
                      </label>
                    );
                  })}
                </fieldset>
              )}
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
