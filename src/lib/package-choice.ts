import { formatBRL } from "@/lib/format";
import type { EventPackage } from "@/lib/types";

/** O que o fã montou: a opção de ingresso de um pacote mais as experiências que adicionou. */
export type PackageChoice = { id: string; item: number; addons: string[] };

/** Rótulo e total (ingresso + experiências marcadas) da escolha, ou null se faltar a opção. */
export function summarize(packages: EventPackage[], choice: PackageChoice | null) {
  const pkg = choice ? packages.find((p) => p.id === choice.id) : undefined;
  const option = pkg && choice ? pkg.items[choice.item] : undefined;
  if (!pkg || !choice || !option) return null;
  const extras = pkg.addons.filter((a) => choice.addons.includes(a.key) && !a.soldOut);
  const priceCents = option.priceCents + extras.reduce((sum, a) => sum + a.priceCents, 0);
  const name = [option.label, ...extras.map((a) => a.label)].join(" + ");
  return { pkg, option, extras, priceCents, name, label: `${name} · ${formatBRL(priceCents)}` };
}
