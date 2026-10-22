import Link from "next/link";

/**
 * Chave "Início | Mural" no topo das duas telas: elas são uma área só (o Mural é a vitrine do artista dentro do
 * Início), então dá para ir e voltar sempre, sem depender do menu de baixo.
 */
export function HomeMuralSwitch({ base, current }: { base: string; current: "inicio" | "mural" }) {
  const items = [
    { id: "inicio" as const, label: "Início", href: base },
    { id: "mural" as const, label: "Mural", href: `${base}/mural` },
  ];
  return (
    <nav aria-label="Início e Mural" className="flex border-b border-line px-4 pt-1">
      {items.map((i) => (
        <Link
          key={i.id}
          href={i.href}
          aria-current={current === i.id ? "page" : undefined}
          className={`mono flex min-h-11 flex-1 items-center justify-center border-b-2 no-underline ${
            current === i.id ? "border-amber text-fg" : "border-transparent text-fg-muted"
          }`}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
