import { Icon } from "@/components/icons";
import type { InAppAd } from "@/lib/ads";
import { brandStyle } from "@/lib/brand-style";
import { AdTrack } from "./AdTrack";

/** O que o card precisa de uma campanha (serve para `HomeAd`, `FeedAd` da API e `InAppAd`). */
export type AdCreative = {
  id?: string;
  sponsor: string;
  title: string;
  text: string;
  cta: string;
  url: string;
  artUrl?: string | null;
  imageUrl?: string | null;
};

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
 * Anúncio patrocinado no feed e nos cards do app: a arte da marca (ou o fundo na cor dela com o nome),
 * título, texto, botão de chamada e o rótulo "Patrocinado". O clique abre a campanha em outra aba.
 */
export function FeedAd({ ad, className = "" }: { ad: AdCreative; className?: string }) {
  const st = brandStyle(ad.sponsor);
  const art = ad.artUrl ?? ad.imageUrl ?? null;
  return (
    <AdTrack id={ad.id}>
    <aside aria-label={`Anúncio patrocinado: ${ad.title}`} className={`my-4 px-4 ${className}`}>
      <div className="relative overflow-hidden rounded-field" style={{ background: st.bg, color: st.fg }}>
        {art && (
          // eslint-disable-next-line @next/next/no-img-element -- arte do anunciante (/ads ou /uploads)
          <img src={art} alt="" loading="lazy" className="block max-h-64 w-full object-contain" />
        )}
        <div className="grid gap-1.5 p-4">
          {!art && <span className="text-xs font-black uppercase tracking-[0.12em]">{ad.sponsor}</span>}
          <strong className="text-lg font-extrabold leading-[22px]">{ad.title}</strong>
          {ad.text && <p className="m-0 text-sm leading-5 opacity-90">{ad.text}</p>}
          <a
            href={ad.url}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex min-h-11 items-center gap-2 self-start rounded-full px-5 text-sm font-bold no-underline"
            style={{ background: st.accent, color: st.bg }}
          >
            {ad.cta}
            <Icon name="external" size={14} />
          </a>
        </div>
        <span className="mono absolute right-2 top-2 rounded-hair bg-black/60 px-2 py-0.5 !text-[10px] text-white">Patrocinado</span>
      </div>
    </aside>
    </AdTrack>
  );
}
