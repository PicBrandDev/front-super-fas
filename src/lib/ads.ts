/**
 * Anúncios dentro do app do fã (fora das vitrines de card): um criativo por posição.
 * Sem "use client" de propósito: tipos e exemplos servem no servidor e no cliente.
 *
 * Posições:
 * - `entry`: modal ao abrir o app logo depois do login.
 * - `pickapVideo`: vídeo obrigatório (mín. `minSeconds`) antes do primeiro giro do período.
 * - `pickapClaim`: modal ao resgatar a recompensa da roleta.
 * - `feed`: post pequeno entre os cartazes do Mural.
 */

export type AdPlacement = "entry" | "pickapVideo" | "pickapClaim" | "feed";

export type InAppAd = {
  id: string;
  sponsor: string;
  title: string;
  text: string;
  cta: string;
  url: string;
  imageUrl?: string | null;
  /** Só no `pickapVideo`. Sem vídeo, o front mostra a arte com contagem regressiva. */
  videoUrl?: string | null;
  /** Tempo mínimo de exibição antes de liberar (vídeo: 30s). */
  minSeconds?: number;
};

export type InAppAds = Partial<Record<AdPlacement, InAppAd | null>>;

/** Quanto tempo o vídeo da roleta fica "visto" antes de aparecer de novo (em horas). */
export const PICKAP_VIDEO_PERIOD_HOURS = 24;
export const PICKAP_VIDEO_MIN_SECONDS = 30;
/** O post patrocinado entra depois de cada N cartazes/posts do Mural. */
export const FEED_AD_EVERY = 4;

/**
 * Criativos de exemplo (enquanto o back não tem GET /artists/{slug}/ads/in-app).
 * Marcas que já trabalharam com o Vintage Culture (Von Dutch Loves, Beatport, Pacha);
 * são só exemplos de layout, não campanhas contratadas.
 */
export const exampleInAppAds = (slug: string): InAppAds => ({
  entry: {
    id: "demo-entry",
    sponsor: "Von Dutch Loves",
    title: "Von Dutch Loves × Vintage Culture",
    text: "A coleção cápsula criada pelo Lukas: bonés trucker e oversized para a pista.",
    cta: "Ver a coleção",
    url: "https://www.vondutch.com",
    imageUrl: `/media/${slug}/press-4.webp`,
  },
  pickapVideo: {
    id: "demo-pickap-video",
    sponsor: "Beatport",
    title: "Os sets do Vintage Culture no Beatport",
    text: "Faixas, remixes e charts do artista para baixar em alta qualidade.",
    cta: "Ouvir no Beatport",
    url: "https://www.beatport.com/artist/vintage-culture/541419",
    imageUrl: `/media/${slug}/press-1.webp`,
    videoUrl: null,
    minSeconds: PICKAP_VIDEO_MIN_SECONDS,
  },
  pickapClaim: {
    id: "demo-pickap-claim",
    sponsor: "Pacha",
    title: "Vintage Culture na Pacha",
    text: "Datas da residência e ingressos direto com a casa.",
    cta: "Ver datas",
    url: "https://www.pacha.com",
    imageUrl: `/media/${slug}/press-3.jpg`,
  },
  feed: {
    id: "demo-feed",
    sponsor: "Von Dutch Loves",
    title: "Camiseta VNTG 77",
    text: "Edição limitada da collab.",
    cta: "Comprar",
    url: "https://www.vondutch.com",
    imageUrl: `/media/${slug}/tee-vntg77.jpg`,
  },
});
