import { formatBRL } from "@/lib/format";
import type { EventPackage } from "@/lib/types";

/** O que o fã montou: o pacote e as experiências que marcou (`item` é do tempo do ingresso e fica sempre em 0). */
export type PackageChoice = { id: string; item: number; addons: string[] };

/** Marca ou desmarca uma experiência. Trocar de pacote começa a escolha de novo (cada compra é de um pacote só). */
export function toggleExperience(choice: PackageChoice | null, packageId: string, key: string): PackageChoice | null {
  const same = choice?.id === packageId ? choice : null;
  const addons = same?.addons.includes(key) ? same.addons.filter((k) => k !== key) : [...(same?.addons ?? []), key];
  return addons.length ? { id: packageId, item: 0, addons } : null;
}

/** Rótulo e total das experiências marcadas, ou null se não houver nenhuma disponível marcada. */
export function summarize(packages: EventPackage[], choice: PackageChoice | null) {
  const pkg = choice ? packages.find((p) => p.id === choice.id) : undefined;
  if (!pkg || !choice) return null;
  const extras = pkg.addons.filter((a) => choice.addons.includes(a.key) && !a.soldOut);
  if (extras.length === 0) return null;
  const priceCents = extras.reduce((sum, a) => sum + a.priceCents, 0);
  const name = extras.map((a) => a.label).join(" + ");
  const lines = extras.map((a) => ({ key: a.key, label: a.label, priceCents: a.priceCents }));
  return { pkg, extras, lines, priceCents, name, label: `${name} · ${formatBRL(priceCents)}` };
}
