import Link from "next/link";
import { ClubAvatar } from "@/components/admin/ClubAvatar";
import { formatCount } from "@/lib/format";
import type { ClubHighlight } from "@/lib/types";

type Metric = { key: string; title: string; sub: string; unit: string; value: (c: ClubHighlight) => number };

// O nome diz o que é, a frase embaixo diz como o número é contado e o fim da linha diz a unidade.
const METRICS: Metric[] = [
  { key: "content", title: "Quem mais publica", sub: "Posts e prêmios da roleta", unit: "publicações", value: (c) => c.content },
  { key: "buzz", title: "Quem mais engaja", sub: "Curtidas, comentários e republicações em 30 dias", unit: "pontos", value: (c) => c.buzz },
  { key: "active", title: "Quem mais participa", sub: "Membros que postaram, comentaram ou compartilharam em 30 dias", unit: "membros ativos", value: (c) => c.activeMembers },
  { key: "members", title: "O maior fã clube", sub: "Total de membros", unit: "membros", value: (c) => c.members },
];

const byValue = (m: Metric) => (a: ClubHighlight, b: ClubHighlight) => m.value(b) - m.value(a);

/** Quatro placares compactos (conteúdo, feed, ativos, inscritos): o líder com foto e o número, e os dois seguintes. */
export function Destaques({ artist, clubs: all }: { artist: string; clubs: ClubHighlight[] }) {
  // O fã clube oficial tem todo o conteúdo e todos os inscritos, então venceria sempre:
  // a disputa é entre os fã clubes dos fãs. Só entra o oficial se não houver nenhum outro.
  const others = all.filter((c) => !c.isMaster);
  const clubs = others.length > 0 ? others : all;
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {METRICS.map((m) => {
        const ranked = [...clubs].sort(byValue(m));
        const lead = ranked[0];
        const has = m.value(lead) > 0;
        return (
          <section key={m.key} aria-labelledby={`d-${m.key}`} className="flex flex-col gap-3 rounded-xl border border-adm-line bg-white p-4">
            <div className="flex flex-col gap-0.5">
              <h3 id={`d-${m.key}`} className="m-0 text-base font-bold leading-5">
                {m.title}
              </h3>
              <p className="m-0 text-xs leading-4 text-adm-muted">{m.sub}</p>
            </div>
            {has ? (
              <>
                <Link href={`/${artist}/admin/analytics/${lead.slug}`} className="flex items-center gap-3 text-adm-ink no-underline">
                  <ClubAvatar src={lead.avatar} name={lead.name} size={48} />
                  <span className="flex min-w-0 flex-1 flex-col leading-5">
                    <strong className="truncate text-base">{lead.name}</strong>
                    <span className="font-display text-2xl font-black leading-7">
                      {formatCount(m.value(lead))} <span className="font-sans text-xs font-semibold text-adm-muted">{m.unit}</span>
                    </span>
                  </span>
                </Link>
                <ol className="m-0 flex list-none flex-col gap-1.5 border-t border-adm-line-soft p-0 pt-2.5">
                  {ranked.slice(1, 3).map((c, i) => (
                    <li key={c.slug}>
                      <Link href={`/${artist}/admin/analytics/${c.slug}`} className="flex items-center gap-2 text-sm text-adm-ink no-underline">
                        <span className="w-5 font-adm-mono text-adm-muted">{i + 2}º</span>
                        <span className="min-w-0 flex-1 truncate">{c.name}</span>
                        <span className="font-adm-mono font-semibold">{formatCount(m.value(c))}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <p className="m-0 text-sm text-adm-muted">Sem dados ainda.</p>
            )}
          </section>
        );
      })}
    </div>
  );
}
