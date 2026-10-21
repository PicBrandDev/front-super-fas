import { Icon } from "@/components/icons";
import type { HomeAd } from "@/lib/types";

/**
 * Anúncio patrocinado (vitrine "Card da Home") no padrão `.post`:
 * tag "Patrocinado" apagada, título em serifa, texto e um link `.go` para a marca.
 */
export function AdCard({ ad }: { ad: HomeAd; variant?: "compact" | "wide" }) {
  return (
    <article aria-label={`Anúncio patrocinado: ${ad.title}`} className="border-b border-line py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="tag tag-demo">Patrocinado</span>
        <span className="mono">{ad.sponsor}</span>
      </div>
      <strong className="mt-3 block font-display text-[19px] font-bold leading-[22px]">{ad.title}</strong>
      <p className="mb-3 mt-1 text-[15px] leading-[22px] text-fg-muted">{ad.text}</p>
      <a href={ad.url} rel="sponsored noopener noreferrer" target="_blank" className="go min-h-11">
        {ad.cta}
        <Icon name="external" size={14} />
      </a>
    </article>
  );
}
