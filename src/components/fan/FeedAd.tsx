import { Icon } from "@/components/icons";
import type { InAppAd } from "@/lib/ads";

/**
 * Atributos do link de um anúncio. Endereço externo (http/https) abre em nova aba com
 * `rel="sponsored noopener noreferrer"`; o "#" que o back manda sem URL fica na mesma aba.
 */
export function adLinkProps(url: string) {
  const href = url || "#";
  const external = /^https?:\/\//i.test(href);
  return external
    ? { href, target: "_blank" as const, rel: "sponsored noopener noreferrer" }
    : { href, target: undefined, rel: "sponsored" };
}

/**
 * Mídia do criativo: vídeo mudo com a arte de capa (só com `video`) ou a arte.
 * A mídia é decorativa (`alt=""`): título e marca vêm em texto ao lado.
 */
export function AdMedia({ ad, className = "", video = false }: { ad: InAppAd; className?: string; video?: boolean }) {
  if (video && ad.videoUrl) {
    return <video src={ad.videoUrl} poster={ad.imageUrl ?? undefined} muted playsInline controls preload="none" aria-label={`Vídeo de ${ad.sponsor}`} className={className} />;
  }
  if (!ad.imageUrl) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={ad.imageUrl} alt="" loading="lazy" className={className} />;
}

/**
 * Post patrocinado do feed (posição `feed`): uma linha só, bem menor que um cartaz.
 * Miniatura 64px, "Patrocinado" + marca em mono, título de uma linha e um link `.go`.
 * Sem manchete em serifa, sem fundo âmbar: o anúncio não disputa com o conteúdo.
 */
export function FeedAd({ ad, className = "" }: { ad: InAppAd; className?: string }) {
  return (
    <aside aria-label={`Anúncio patrocinado: ${ad.title}`} className={`flex items-center gap-3 border-y border-line px-4 py-3 ${className}`}>
      <AdMedia ad={ad} className="h-[60px] w-24 flex-none rounded-hair bg-surface object-cover" />
      <div className="grid min-w-0 flex-1 gap-1">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span className="tag tag-demo flex-none">Patrocinado</span>
          <span className="mono">{ad.sponsor}</span>
        </div>
        <strong className="truncate text-sm font-semibold leading-5 text-fg">{ad.title}</strong>
      </div>
      <a {...adLinkProps(ad.url)} className="go min-h-11 flex-none">
        {ad.cta}
        <Icon name="external" size={14} />
      </a>
    </aside>
  );
}
