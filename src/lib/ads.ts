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
  minSeconds?: number | null;
};

export type InAppAds = Partial<Record<AdPlacement, InAppAd | null>>;

export const PICKAP_VIDEO_MIN_SECONDS = 30;
/** O post patrocinado entra depois de cada N cartazes/posts do Mural. */
export const FEED_AD_EVERY = 4;

/**
 * Criativos de exemplo (enquanto o back não manda GET /artists/{slug}/ads/in-app).
 * As vitrines são vendidas para marcas de fora, que pagam para ocupar o espaço:
 * marcas de fora com arte e vídeo em /public/ads (nada da loja ou do artista).
 */
export const exampleInAppAds = (): InAppAds => ({
  entry: {
    id: "demo-entry",
    sponsor: "Festival Maré",
    title: "Lote 1 do Festival Maré no ar",
    text: "3 dias de praia e pista. Fã clube tem pré-venda com 15% off.",
    cta: "Garantir ingresso",
    url: "https://example.com/mare",
    imageUrl: "/ads/exemplo-mare.svg",
  },
  pickapVideo: {
    id: "demo-pickap-video",
    sponsor: "DJ Mag",
    title: "Vote no Vintage Culture no Top 100 DJs",
    text: "A votação da DJ Mag está aberta. Assista e libere o seu giro.",
    cta: "Votar agora",
    url: "https://top100djsvote.djmag.com",
    imageUrl: "/ads/djmag-top100.jpg",
    videoUrl: "/ads/djmag-top100.mp4",
    minSeconds: PICKAP_VIDEO_MIN_SECONDS,
  },
  pickapClaim: {
    id: "demo-pickap-claim",
    sponsor: "Onda",
    title: "Ganhou? Guarde o prêmio na Onda",
    text: "Conta digital com cartão sem anuidade, Pix na hora e cashback em ingressos.",
    cta: "Abrir minha conta",
    url: "https://example.com/onda",
    imageUrl: "/ads/exemplo-onda.svg",
  },
  feed: {
    id: "demo-feed",
    sponsor: "Spotify",
    title: "Vintage Culture no Spotify",
    text: "Os sets e lançamentos no seu app de música.",
    cta: "Ouvir",
    url: "https://open.spotify.com/search/Vintage%20Culture",
    imageUrl: "/ads/spotify.jpg",
  },
});
