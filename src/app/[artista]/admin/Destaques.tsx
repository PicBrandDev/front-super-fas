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

/** Quatro placares (conteúdo, feed, ativos, inscritos): título grande, fã clube líder com foto e o pódio dos seguintes. */
export function Destaques({ artist, clubs }: { artist: string; clubs: ClubHighlight[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {METRICS.map((m) => {
        const ranked = [...clubs].sort(byValue(m));
        const lead = ranked[0];
        const max = Math.max(1, m.value(lead));
        const has = m.value(lead) > 0;
        return (
          <section key={m.key} aria-labelledby={`d-${m.key}`} className="flex flex-col gap-4 rounded-xl border border-adm-line bg-white p-5">
            <div className="flex flex-col gap-1">
              <h3 id={`d-${m.key}`} className="m-0 font-display text-2xl font-black leading-7">
                {m.title}
              </h3>
              <p className="m-0 text-[13px] leading-5 text-adm-muted">{m.hint}</p>
            </div>
            {has ? (
              <>
                <Link
                  href={`/${artist}/admin/analytics/${lead.slug}`}
                  className="flex items-center gap-4 rounded-xl bg-adm-bg p-3 text-adm-ink no-underline transition-colors hover:bg-adm-blue-soft"
                >
                  <ClubAvatar src={lead.avatar} name={lead.name} size={64} />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="font-adm-mono text-[11px] font-semibold uppercase tracking-wider text-adm-blue-dark">1º lugar</span>
                    <strong className="truncate text-lg leading-6">{lead.name}</strong>
                    <span className="text-[13px] text-adm-muted">{m.detail(lead)}</span>
                  </span>
                  <span className="flex flex-col items-end leading-none">
                    <span className="font-display text-4xl font-black">{formatCount(m.value(lead))}</span>
                    <span className="mt-1 text-xs font-semibold text-adm-muted">{m.unit}</span>
                  </span>
                </Link>
                <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
                  {ranked.slice(1, 4).map((c, i) => (
                    <li key={c.slug}>
                      <Link href={`/${artist}/admin/analytics/${c.slug}`} className="flex items-center gap-3 text-adm-ink no-underline">
                        <span className="w-5 font-adm-mono text-sm text-adm-muted">{i + 2}º</span>
                        <ClubAvatar src={c.avatar} name={c.name} size={36} />
                        <span className="flex min-w-0 flex-1 flex-col gap-1">
                          <span className="truncate text-sm font-semibold">{c.name}</span>
                          <span aria-hidden="true" className="h-2 rounded-full bg-adm-line-soft">
                            <span className="block h-2 rounded-full bg-adm-blue" style={{ width: `${Math.max(3, (m.value(c) / max) * 100)}%` }} />
                          </span>
                        </span>
                        <span className="w-14 text-right font-adm-mono text-sm font-semibold">{formatCount(m.value(c))}</span>
                      </Link>
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
  );
}
