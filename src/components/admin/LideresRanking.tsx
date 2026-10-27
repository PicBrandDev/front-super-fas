import Link from "next/link";
import { ClubAvatar } from "@/components/admin/ClubAvatar";
import { Icon } from "@/components/icons";
import { formatPoints } from "@/lib/format";
import type { RankingScope } from "@/lib/types";

const GOLD = "#F2C14E";

/**
 * Bloco do menu lateral com os líderes do ranking. O 1º do ranking geral é o card dourado; embaixo, o 1º de cada
 * fã clube (o oficial inclusive) numa lista compacta, com o nome do fã clube inteiro. Clicar abre a tela de ranking.
 */
export function LideresRanking({ artist, scopes }: { artist: string; scopes: RankingScope[] }) {
  const general = scopes.find((s) => !s.clubSlug) ?? null;
  const clubs = scopes.filter((s) => s.clubSlug);
  if (!general && !clubs.length) return null;
  const href = `/${artist}/admin/ranking`;

  return (
    <section aria-labelledby="lideres-title" className="flex flex-col gap-3">
      <h2 id="lideres-title" className="m-0 px-1.5 font-adm-mono text-[11px] font-semibold uppercase tracking-wider text-adm-side-muted">
        Líderes do ranking
      </h2>

      {general && <GeneralLeader href={href} scope={general} />}

      {clubs.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {clubs.map((s) => {
            const p = s.people[0];
            return (
              <li key={s.clubSlug}>
                <Link href={href} className="flex items-start gap-2.5 rounded-lg px-2 py-2 text-adm-side-text no-underline hover:bg-white/5">
                  <ClubAvatar src={p?.avatar} name={p?.name ?? s.name} size={34} />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5 leading-4">
                    <strong className="break-words text-[13px]">{p ? p.name : "Ninguém ainda"}</strong>
                    <span className="break-words text-[11px] text-adm-side-muted">1º do {s.name}</span>
                    {p && <span className="font-adm-mono text-[11px] font-semibold text-adm-side-muted">{formatPoints(p.points)} pts</span>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** O 1º do ranking geral: card dourado e leve (foto com moldura, nome e pontos), diferente dos demais. */
function GeneralLeader({ href, scope }: { href: string; scope: RankingScope }) {
  const p = scope.people[0];
  return (
    <Link
      href={href}
      aria-label={p ? `1º do ranking geral: ${p.name}` : "Sem líder no ranking geral"}
      style={{ borderColor: `${GOLD}66`, background: `linear-gradient(135deg, ${GOLD}1c 0%, ${GOLD}08 60%, transparent 100%)` }}
      className="flex flex-col gap-2 rounded-xl border px-2.5 py-2.5 text-adm-ink no-underline"
    >
      <span style={{ color: GOLD }} className="inline-flex items-center gap-1 font-adm-mono text-[10px] font-semibold uppercase tracking-[0.1em]">
        <Icon name="star" size={11} filled />
        1º do ranking geral
      </span>
      {p ? (
        <>
          <span className="flex items-center gap-2.5">
            <span style={{ boxShadow: `0 0 0 1.5px ${GOLD}99` }} className="flex-none rounded-full p-0.5">
              <ClubAvatar src={p.avatar} name={p.name} size={48} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5 leading-4">
              <strong className="break-words font-display text-[15px] font-bold leading-5">{p.name}</strong>
              <span style={{ color: GOLD }} className="font-adm-mono text-[12px] font-semibold">
                {formatPoints(p.points)} pts
              </span>
            </span>
          </span>
          {scope.leader && <span className="text-[11px] leading-4 text-adm-side-muted">Escolhido pela administração</span>}
        </>
      ) : (
        <span className="py-2 text-[13px] text-adm-side-muted">Ninguém pontuou ainda</span>
      )}
    </Link>
  );
}
