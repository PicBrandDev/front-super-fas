import { Icon } from "@/components/icons";
import type { InAppAd } from "@/lib/ads";

/**
 * Post patrocinado do feed (posição `feed`): uma linha só, bem menor que um cartaz.
 * Miniatura 64px, "Patrocinado" + marca em mono, título de uma linha e um link `.go`.
 * Sem manchete em serifa, sem fundo âmbar: o anúncio não disputa com o conteúdo.
 */
export function FeedAd({ ad, className = "" }: { ad: InAppAd; className?: string }) {
  return (
    <aside aria-label={`Anúncio patrocinado: ${ad.title}`} className={`flex items-center gap-3 border-y border-line px-4 py-3 ${className}`}>
      {ad.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ad.imageUrl} alt="" loading="lazy" className="size-16 flex-none rounded-hair bg-surface object-cover" />
      )}
      <div className="grid min-w-0 flex-1 gap-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="tag tag-demo flex-none">Patrocinado</span>
          <span className="mono truncate">{ad.sponsor}</span>
        </div>
        <strong className="truncate text-sm font-semibold leading-5 text-fg">{ad.title}</strong>
      </div>
      <a href={ad.url} rel="sponsored noopener noreferrer" target="_blank" className="go min-h-11 flex-none">
        {ad.cta}
        <Icon name="external" size={14} />
      </a>
    </aside>
  );
}
