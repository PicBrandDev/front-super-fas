import { formatBRL } from "@/lib/format";
import type { EventPackage } from "@/lib/types";

/**
 * O que o fã montou: as experiências extras de um pacote. O ingresso é vendido só na Ingresse, então não entra
 * na escolha nem no valor.
 */
export type PackageChoice = { id: string; addons: string[] };

/** Rótulo e total das experiências marcadas, ou null se nenhuma experiência disponível foi escolhida. */
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

/** Marca ou desmarca uma experiência; marcar num pacote diferente recomeça a escolha nesse pacote. */
export function toggleAddon(choice: PackageChoice | null, packageId: string, key: string): PackageChoice | null {
  if (!choice || choice.id !== packageId) return { id: packageId, addons: [key] };
  const addons = choice.addons.includes(key) ? choice.addons.filter((k) => k !== key) : [...choice.addons, key];
  return addons.length ? { id: packageId, addons } : null;
}
