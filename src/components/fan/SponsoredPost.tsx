import { Icon } from "@/components/icons";
import type { InAppAd } from "@/lib/ads";
import { AdMedia, adLinkProps } from "./FeedAd";
import styles from "./SponsoredPost.module.css";

/**
 * Post patrocinado da Comunidade (entra a cada `COMMUNITY_AD_EVERY` posts).
 * Precisa ser reconhecível logo de cara e não se passar por post de fã: fundo um tom acima,
 * régua âmbar de 1px no topo, faixa com "Patrocinado" em âmbar + anunciante e um CTA
 * "Saiba mais". Sem curtir, comentar ou repostar. Mídia e link vêm do `FeedAd` (Mural).
 */
export function SponsoredPost({ ad }: { ad: InAppAd }) {
  const link = adLinkProps(ad.url);
  const newTab = link.target === "_blank";
  const hasArt = !!ad.imageUrl && !ad.videoUrl;
  const media = <AdMedia ad={ad} video className={styles.media} />;

  return (
    <article aria-label={`Patrocinado por ${ad.sponsor}`} className={styles.card}>
      <header className={styles.strip}>
        <span className={styles.badge}>Patrocinado</span>
        <span className={styles.sponsor}>{ad.sponsor}</span>
      </header>

      <div className={styles.body}>
        {/* A arte também leva ao anunciante (fora da ordem do Tab: o CTA é o link de verdade). */}
        {hasArt ? (
          <a {...link} tabIndex={-1} aria-hidden="true" className={styles.mediaLink}>
            {media}
          </a>
        ) : (
          media
        )}
        <h3 className={styles.title}>{ad.title}</h3>
        {ad.text && <p className={styles.text}>{ad.text}</p>}
        <a {...link} aria-label={`Saiba mais sobre ${ad.sponsor}${newTab ? " (abre em nova aba)" : ""}`} className={`btn btn-outline ${styles.cta}`}>
          Saiba mais
          {newTab && <Icon name="external" size={14} />}
        </a>
      </div>
    </article>
  );
}
