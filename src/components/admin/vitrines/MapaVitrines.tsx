import Link from "next/link";
import { Badge } from "@/components/admin/ui";
import { formatBRL } from "@/lib/format";
import type { VitrineBooking, VitrineCard } from "@/lib/types";
import { BannerPhone, PlacementPhone } from "./BannerPhone";

const dm = (iso: string | null) => (iso ? iso.split("-").reverse().join("/") : "—");

const GROUPS: { key: string; title: string; text: string }[] = [
  { key: "entrada", title: "Entrada do app", text: "O primeiro anúncio que o fã vê: um modal logo depois do login." },
  { key: "roleta", title: "Roleta (PicKup)", text: "O vídeo obrigatório antes de girar, o anúncio depois do prêmio e a fatia patrocinada." },
  { key: "feed", title: "Entre os posts do feed", text: "Posts patrocinados no feed do cantor e no feed de cada fã clube." },
  { key: "outras", title: "Outras telas", text: "Início, eventos, loja e Drops Hits." },
];

/**
 * O mapa de todas as vitrines, por grupo. Cada vitrine mostra o celularzinho com o lugar dela e o celular com o
 * anúncio já no ar. No admin aparece quem alugou; no portal do patrocinador só a arte das próprias campanhas.
 */
export function MapaVitrines({ cards, mode, artist }: { cards: VitrineCard[]; mode: "admin" | "sponsor"; artist: string }) {
  return (
    <div className="flex flex-col gap-8">
      {GROUPS.map((g) => {
        const list = cards.filter((c) => c.group === g.key);
        if (!list.length) return null;
        const live = list.filter((c) => c.live).length;
        return (
          <section key={g.key} aria-labelledby={`mapa-${g.key}`} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 id={`mapa-${g.key}`} className="m-0 font-display text-3xl font-black">
                  {g.title}
                </h2>
                <p className="m-0 text-[13px] text-adm-muted">{g.text}</p>
              </div>
              <span className="font-adm-mono text-[13px] text-adm-muted">
                {live} de {list.length} no ar
              </span>
            </div>
            <ul className="m-0 grid list-none gap-4 p-0 [grid-template-columns:repeat(auto-fill,minmax(420px,1fr))]">
              {list.map((c) => (
                <li key={c.key}>
                  <Card c={c} mode={mode} artist={artist} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function Who({ b, mode }: { b: VitrineBooking; mode: "admin" | "sponsor" }) {
  if (mode === "sponsor" && !b.mine) return <strong className="text-sm">Ocupada</strong>;
  return (
    <span className="flex flex-col leading-5">
      <strong className="text-sm">{b.brand}</strong>
      <span className="text-[13px] text-adm-muted">{b.title}</span>
    </span>
  );
}

function Card({ c, mode, artist }: { c: VitrineCard; mode: "admin" | "sponsor"; artist: string }) {
  const shown = c.live ?? c.next;
  return (
    <article className="flex h-full flex-col gap-3 rounded-xl border border-adm-line bg-white p-4">
      <header className="flex items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="m-0 break-words text-base font-bold leading-5">{c.name}</h3>
          <span className="break-words text-[13px] text-adm-muted">
            {c.clubName ?? "Ambiente"} · {c.where}
          </span>
        </div>
        {!c.active ? <Badge tone="off">Desligada</Badge> : c.live ? <Badge tone="ok">No ar</Badge> : c.next ? <Badge tone="info">Agendada</Badge> : <Badge tone="warn">Livre</Badge>}
      </header>

      <div className="flex flex-wrap items-start justify-around gap-4">
        <figure className="m-0 flex flex-col items-center gap-1.5">
          <PlacementPhone top={c.diagramTop} height={c.diagramHeight} />
          <figcaption className="text-[12px] font-semibold text-adm-muted">Onde fica</figcaption>
        </figure>
        <figure className="m-0 flex flex-col items-center gap-1.5">
          <BannerPhone group={c.group} vitrineKey={c.key} booking={shown} top={c.diagramTop} height={c.diagramHeight} />
          <figcaption className="text-[12px] font-semibold text-adm-muted">{c.live ? "No ar agora" : c.next ? "Quando começar" : "Livre"}</figcaption>
        </figure>
      </div>

      <footer className="mt-auto flex flex-col gap-1.5 border-t border-adm-line-soft pt-3 text-[13px]">
        {c.live ? (
          <div className="flex items-start justify-between gap-2">
            <Who b={c.live} mode={mode} />
            <span className="font-adm-mono text-[12px] text-adm-muted">até {dm(c.live.end)}</span>
          </div>
        ) : (
          <span className="text-adm-muted">Ninguém no ar agora.</span>
        )}
        {c.next && (
          <div className="flex items-start justify-between gap-2 text-adm-muted">
            <span>
              Depois: <strong className="text-adm-ink">{mode === "sponsor" && !c.next.mine ? "reservada" : c.next.brand}</strong>
            </span>
            <span className="font-adm-mono text-[12px]">
              {dm(c.next.start)} a {dm(c.next.end)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <span className="font-adm-mono text-[12px] text-adm-muted">{c.priceCentsPerWeek ? `${formatBRL(c.priceCentsPerWeek)} por semana` : "Preço a combinar"}</span>
          {mode === "sponsor" && !c.live && c.active && (
            <Link href="/patrocinador/nova" className="text-[13px] font-semibold text-adm-blue-dark">
              Anunciar aqui
            </Link>
          )}
        </div>
      </footer>
    </article>
  );
}
