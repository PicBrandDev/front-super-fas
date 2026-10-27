import Link from "next/link";
import { ClubAvatar } from "@/components/admin/ClubAvatar";
import { formatCount } from "@/lib/format";
import type { ClubHighlight } from "@/lib/types";

type Metric = { key: string; title: string; unit: string; hint: string; value: (c: ClubHighlight) => number; detail: (c: ClubHighlight) => string };

const METRICS: Metric[] = [
  {
    key: "content",
    title: "Mais conteúdo",
    unit: "itens",
    hint: "Posts publicados + fatias da roleta",
    value: (c) => c.content,
    detail: (c) => `${formatCount(c.posts)} posts (${formatCount(c.postsWithPhoto)} com foto) · ${formatCount(c.prizes)} prêmios`,
  },
  {
    key: "buzz",
    title: "Bombando no feed",
    unit: "pontos",
    hint: "Curtidas + 2×comentários + 3×republicações dos posts de 30 dias",
    value: (c) => c.buzz,
    detail: (c) => `${formatCount(c.likes)} curtidas · ${formatCount(c.comments)} comentários · ${formatCount(c.reposts)} republic.`,
  },
  {
    key: "active",
    title: "Membros mais ativos",
    unit: "ativos",
    hint: "Inscritos que postaram, comentaram ou compartilharam em 30 dias",
    value: (c) => c.activeMembers,
    detail: (c) => `${c.activeRate}% dos ${formatCount(c.members)} inscritos`,
  },
  {
    key: "members",
    title: "Mais inscritos",
    unit: "inscritos",
    hint: "Total de fãs que entraram no fã clube",
    value: (c) => c.members,
    detail: (c) => `+${formatCount(c.newMembersMonth)} em 30 dias · ${formatCount(c.subscribers)} assinantes`,
  },
];

const byValue = (m: Metric) => (a: ClubHighlight, b: ClubHighlight) => m.value(b) - m.value(a);

/** Quatro placares (conteúdo, feed, ativos, inscritos) com o fã clube líder em destaque. */
export function Destaques({ artist, clubs }: { artist: string; clubs: ClubHighlight[] }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((m) => {
          const ranked = [...clubs].sort(byValue(m));
          const lead = ranked[0];
          const max = Math.max(1, m.value(lead));
          const has = m.value(lead) > 0;
          return (
            <section key={m.key} aria-labelledby={`d-${m.key}`} className="flex flex-col gap-3 rounded-xl border border-adm-line bg-white px-4 py-3.5">
              <div>
                <h2 id={`d-${m.key}`} className="m-0 text-sm font-bold">
                  {m.title}
                </h2>
                <p className="m-0 text-xs text-adm-muted">{m.hint}</p>
              </div>
              {has ? (
                <>
                  <Link href={`/${artist}/admin/analytics/${lead.slug}`} className="flex items-center gap-3 text-adm-ink no-underline">
                    <ClubAvatar src={lead.avatar} name={lead.name} size={48} />
                    <span className="flex min-w-0 flex-col">
                      <span className="font-adm-mono text-[11px] font-semibold uppercase tracking-wider text-adm-blue-dark">1º lugar</span>
                      <strong className="truncate text-[15px]">{lead.name}</strong>
                    </span>
                  </Link>
                  <p className="m-0 font-display text-3xl font-black leading-9">
                    {formatCount(m.value(lead))} <span className="text-sm font-semibold text-adm-muted">{m.unit}</span>
                  </p>
                  <p className="m-0 text-[13px] text-adm-muted">{m.detail(lead)}</p>
                  <ol className="m-0 flex list-none flex-col gap-1.5 p-0">
                    {ranked.slice(1, 4).map((c, i) => (
                      <li key={c.slug} className="flex items-center gap-2 text-[13px]">
                        <span className="w-4 font-adm-mono text-adm-muted">{i + 2}º</span>
                        <span className="w-28 truncate">{c.name}</span>
                        <span aria-hidden="true" className="h-2 flex-1 rounded-full bg-adm-line-soft">
                          <span className="block h-2 rounded-full bg-adm-blue" style={{ width: `${Math.max(3, (m.value(c) / max) * 100)}%` }} />
                        </span>
                        <span className="w-10 text-right font-adm-mono font-semibold">{formatCount(m.value(c))}</span>
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <p className="m-0 text-sm text-adm-muted">Ainda sem dados nesta categoria.</p>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
