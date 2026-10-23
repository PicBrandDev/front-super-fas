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
          className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:thin]"
        >
          {items.length === 0 ? (
            <p className="m-0 p-6 text-center text-sm text-adm-muted">Nenhuma publicação ainda.</p>
          ) : (
            items.map((p) => (p.image ? <PhotoPost key={p.id} p={p} /> : <TextPost key={p.id} p={p} />))
          )}
        </div>
      </div>
    </div>
  );
}

type Metric = { icon: "heart" | "comment" | "repost" | "eye"; label: string; value: number };

function Metrics({ p, size, className }: { p: FeedItem; size: number; className: string }) {
  const rows: Metric[] = [
    { icon: "comment", label: "Comentários", value: p.comments },
    { icon: "repost", label: "Reposts", value: p.reposts },
    { icon: "heart", label: "Curtidas", value: p.likes },
    { icon: "eye", label: "Visualizações", value: p.views },
  ];
  return (
    <dl className={className}>
      {rows.map((m) => (
        <div key={m.label} className="flex items-center gap-1.5">
          <dt className="sr-only">{m.label}</dt>
          <Icon name={m.icon} size={size} />
          <dd className="m-0 font-adm-mono text-[12px] font-semibold">{formatCount(m.value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function Replies({ p, className }: { p: FeedItem; className: string }) {
  if (p.comments === 0) return null;
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
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
  );
}

/** Post com foto (estilo Instagram): foto, números, legenda e comentários. */
function PhotoPost({ p }: { p: FeedItem }) {
  return (
    <article className="border-b border-adm-line-soft pb-2.5">
      <div className="flex items-center gap-2 px-2.5 py-2">
        <span aria-hidden="true" className="flex size-6 flex-none items-center justify-center rounded-full bg-adm-blue-soft font-display text-[11px] font-black text-adm-blue-dark">
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
      <img src={p.image ?? ""} alt="" loading="lazy" className="block aspect-[4/5] w-full object-cover" />
      <Metrics p={p} size={15} className="m-0 flex items-center gap-3 px-2.5 pt-2 text-[12px]" />
      <p className="m-0 px-2.5 pt-1 text-[12px] leading-4">
        <strong>{p.author}</strong> {p.text}
      </p>
      <Replies p={p} className="px-2.5 pt-1.5" />
    </article>
  );
}

/** Post só de texto (estilo Twitter): avatar, nome e @, o texto corrido, números e comentários. */
function TextPost({ p }: { p: FeedItem }) {
  return (
    <article className="flex gap-2 border-b border-adm-line-soft px-2.5 py-3">
      <span aria-hidden="true" className="flex size-8 flex-none items-center justify-center rounded-full bg-adm-blue-soft font-display text-[12px] font-black text-adm-blue-dark">
        {p.author.charAt(0).toUpperCase()}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 leading-4">
          <strong className="truncate text-[12px]">{p.author}</strong>
          {p.kind === "drop" && <span className="text-[10px] font-semibold text-adm-blue-dark">Oficial</span>}
          <span className="truncate font-adm-mono text-[10px] text-adm-muted">
            {p.handle ? `${p.handle} · ` : ""}
            {p.timeLabel}
          </span>
        </div>
        <p className="m-0 whitespace-pre-wrap break-words text-[13px] leading-[18px]">{p.text}</p>
        <Metrics p={p} size={14} className="m-0 flex items-center justify-between pr-4 pt-1 text-[12px]" />
        <Replies p={p} className="border-l border-adm-line pl-2" />
      </div>
    </article>
  );
}
