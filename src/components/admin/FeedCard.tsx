import type { ReactNode } from "react";
import { Icon } from "@/components/icons";
import { formatCount } from "@/lib/format";
import type { FeedItem } from "@/lib/types";

/** Card de uma publicação: foto (ou a legenda em destaque), legenda e os números dela. */
export function FeedCard({ item, children }: { item: FeedItem; children?: ReactNode }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-adm-line bg-white">
      {item.image ? (
        <img src={item.image} alt="" loading="lazy" className="block aspect-[4/5] w-full object-cover" />
      ) : (
        <div className="flex aspect-[4/5] w-full items-end bg-adm-bg p-4">
          <p className="m-0 line-clamp-6 font-display text-xl font-black leading-6">{item.text}</p>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {item.image && <p className="m-0 line-clamp-3 text-sm leading-5">{item.text}</p>}
        <span className="font-adm-mono text-[11px] text-adm-muted">
          {item.timeLabel} · {item.kind === "drop" ? `${item.author} (oficial)` : item.author}
        </span>
        <dl className="m-0 mt-auto flex items-center gap-4 border-t border-adm-line-soft pt-2 text-[13px]">
          {(
            [
              { icon: "heart", label: "Curtidas", value: item.likes },
              { icon: "comment", label: "Comentários", value: item.comments },
              { icon: "eye", label: "Visualizações", value: item.views },
            ] as const
          ).map((m) => (
            <div key={m.label} className="flex items-center gap-1.5">
              <dt className="sr-only">{m.label}</dt>
              <Icon name={m.icon} size={16} />
              <dd className="m-0 font-adm-mono font-semibold">{formatCount(m.value)}</dd>
            </div>
          ))}
        </dl>
        {children}
      </div>
    </article>
  );
}

/** Grade de cards (usada no Drop News e no analytics do fã clube). */
export function FeedGrid({ children }: { children: ReactNode }) {
  return <ul className="m-0 grid list-none gap-4 p-0 [grid-template-columns:repeat(auto-fill,minmax(210px,1fr))]">{children}</ul>;
}
