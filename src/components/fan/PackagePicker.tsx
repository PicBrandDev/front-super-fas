"use client";

import { Icon } from "@/components/icons";
import { EXPERIENCES, PHOTO_FINDER_NOTE } from "@/lib/experiences";
import { formatBRL } from "@/lib/format";
import type { PackageChoice } from "@/lib/package-choice";
import type { EventPackage } from "@/lib/types";

const hintOf = (key: string) => EXPERIENCES.find((e) => e.key === key)?.hint ?? "";

/**
 * Experiências à venda no show. Não se vende ingresso aqui (a ticketeira faz isso): o fã leva só o transfer, só uma
 * experiência ou várias, e o total soma o que ele marcar. Cada experiência é uma linha com o valor e um botão de
 * marcar; o Photo Finder vem em todas as compras. Marcar uma experiência de outro pacote começa a escolha de novo
 * (cada compra é de um pacote só). Usado na tela do show e no modal de compra do Início.
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
  const several = packages.length > 1;

  return (
    <div role="group" aria-labelledby={labelledBy} aria-label={labelledBy ? undefined : "Experiências do show"} className="flex flex-col gap-6">
      {packages.map((p) => (
        <section key={p.id} className="flex flex-col gap-3" aria-label={several ? `Pacote ${p.name}` : undefined}>
          <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            {several ? <strong className="text-[17px] leading-6">{p.name}</strong> : <span className="mono">Vendido por {p.agencyName}</span>}
            <span className="mono">
              {several ? `${p.agencyName} · ` : ""}
              {p.agencyContact}
            </span>
          </header>
          {p.description && several && <p className="m-0 text-[15px] leading-[22px] text-fg-muted">{p.description}</p>}

          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {p.addons.map((a) => {
              const on = choice?.id === p.id && choice.addons.includes(a.key);
              const detail = a.key === "transfer" && p.transferDetails ? p.transferDetails : hintOf(a.key);
              return (
                <li key={a.key}>
                  <label
                    className={`flex items-center gap-3 border p-3.5 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-amber ${
                      on ? "border-amber bg-raised" : "border-line bg-surface"
                    } ${a.soldOut ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                  >
                    <input type="checkbox" className="sr-only" checked={on} disabled={a.soldOut} onChange={() => onToggleAddon(p.id, a.key)} />
                    <span
                      aria-hidden="true"
                      className={`flex size-6 flex-none items-center justify-center border ${on ? "border-amber bg-amber text-on-amber" : "border-line-strong text-transparent"}`}
                    >
                      <Icon name="check" size={14} strokeWidth={3} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <strong className="text-[16px] leading-5">{a.label}</strong>
                      {detail && <span className="text-[13px] leading-[18px] text-fg-muted">{detail}</span>}
                      {a.soldOut && <span className="tag tag-demo self-start">Esgotado</span>}
                    </span>
                    <span className={`num flex-none text-[16px] ${a.soldOut ? "line-through" : ""}`}>{formatBRL(a.priceCents)}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <p className="m-0 flex items-start gap-1.5 text-[14px] leading-5 text-fg-muted">
        <Icon name="camera" size={14} />
        <span>{PHOTO_FINDER_NOTE}</span>
      </p>
    </div>
  );
}
