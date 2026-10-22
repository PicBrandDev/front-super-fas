import { ClubAvatar } from "@/components/admin/ClubAvatar";
import { Icon } from "@/components/icons";
import { formatCount } from "@/lib/format";
import type { FeedItem } from "@/lib/types";

/**
 * Feed de um fã clube dentro de um celular: o admin rola para baixo como o fã faz.
 * Cada post mostra foto, legenda e os números (curtidas, comentários, visualizações).
 */
export function PhoneFeed({ clubName, avatar, items }: { clubName: string; avatar?: string | null; items: FeedItem[] }) {
  return (
    <div className="mx-auto w-full max-w-[250px] rounded-[34px] border-2 border-adm-side-line bg-adm-side p-2">
      <div className="flex h-[470px] flex-col overflow-hidden rounded-[26px] bg-adm-surface">
        <div aria-hidden="true" className="flex justify-center pb-0.5 pt-1.5">
          <span className="h-1 w-14 rounded-full bg-adm-line" />
        </div>
        <header className="flex items-center gap-2.5 border-b border-adm-line px-3 py-2">
          <ClubAvatar src={avatar} name={clubName} size={26} />
          <span className="flex min-w-0 flex-col leading-4">
            <strong className="truncate text-[12px]">{clubName}</strong>
            <span className="font-adm-mono text-[10px] text-adm-muted">{formatCount(items.length)} publicações</span>
          </span>
        </header>

        <div
          role="feed"
          tabIndex={0}
          aria-label={`Feed do fã clube ${clubName}`}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]"
        >
          {items.length === 0 ? (
            <p className="m-0 p-6 text-center text-sm text-adm-muted">Nenhuma publicação ainda.</p>
          ) : (
            items.map((p) => (
              <article key={p.id} className="border-b border-adm-line-soft pb-2.5">
                <div className="flex items-center gap-2 px-2.5 py-2">
                  <span
                    aria-hidden="true"
                    className="flex size-6 flex-none items-center justify-center rounded-full bg-adm-blue-soft font-display text-[11px] font-black text-adm-blue-dark"
                  >
                    {p.author.charAt(0).toUpperCase()}
                  </span>
                  <span className="flex min-w-0 flex-col leading-4">
                    <strong className="truncate text-[12px]">{p.author}</strong>
                    <span className="font-adm-mono text-[10px] text-adm-muted">
                      {p.kind === "drop" ? "Oficial · " : ""}
                      {p.timeLabel}
                    </span>
                  </span>
                </div>
                {p.image ? (
                  <img src={p.image} alt="" loading="lazy" className="block aspect-[4/5] w-full object-cover" />
                ) : (
                  <div className="flex aspect-square w-full items-end bg-adm-bg p-3">
                    <p className="m-0 line-clamp-6 font-display text-base font-black leading-5">{p.text}</p>
                  </div>
                )}
                <dl className="m-0 flex items-center gap-3 px-2.5 pt-2 text-[12px]">
                  {(
                    [
                      { icon: "heart", label: "Curtidas", value: p.likes },
                      { icon: "comment", label: "Comentários", value: p.comments },
                      { icon: "eye", label: "Visualizações", value: p.views },
                    ] as const
                  ).map((m) => (
                    <div key={m.label} className="flex items-center gap-1.5">
                      <dt className="sr-only">{m.label}</dt>
                      <Icon name={m.icon} size={15} />
                      <dd className="m-0 font-adm-mono text-[12px] font-semibold">{formatCount(m.value)}</dd>
                    </div>
                  ))}
                </dl>
                {p.image && (
                  <p className="m-0 px-2.5 pt-1 text-[12px] leading-4">
                    <strong>{p.author}</strong> {p.text}
                  </p>
                )}
                {p.comments > 0 && (
                  <div className="flex flex-col gap-1 px-2.5 pt-1.5">
                    {p.comments > p.recentComments.length && (
                      <span className="font-adm-mono text-[10px] text-adm-muted">Ver os {formatCount(p.comments)} comentários</span>
                    )}
                    <ul className="m-0 flex list-none flex-col gap-1 p-0" aria-label="Comentários mais recentes">
                      {p.recentComments.map((c, i) => (
                        <li key={i} className="text-[12px] leading-4">
                          <strong>{c.author}</strong> {c.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
