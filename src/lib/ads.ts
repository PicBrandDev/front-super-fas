/**
 * Anúncios dentro do app do fã (fora das vitrines de card): um criativo por posição.
 * Sem "use client" de propósito: tipos e exemplos servem no servidor e no cliente.
 *
 * Posições:
 * - `entry`: modal ao abrir o app logo depois do login.
 * - `pickupVideo`: vídeo obrigatório (toca uma vez, na duração real) antes do primeiro giro do período.
 * - `pickupClaim`: vídeo quando o fã toca para pegar o brinde da roleta.
 * - `feed`: post patrocinado do Mural, depois de cada post.
 * - `news`: post patrocinado em posição aleatória entre as notícias da Comunidade.
 * - `shop`: banner em cima da lojinha.
 * - `shopPurchase`: anúncio depois da compra da camiseta.
 * - `pickupLayers` (lista): as camadas da roleta, da 1ª à 4ª (só as alugadas).
 */

export type AdPlacement = "entry" | "pickupVideo" | "pickupClaim" | "feed" | "news" | "shop" | "shopPurchase";

export type InAppAd = {
  id: string;
  sponsor: string;
  title: string;
  text: string;
  cta: string;
  url: string;
  imageUrl?: string | null;
  /** Só no `pickupVideo`. Sem vídeo, o front mostra a arte com contagem regressiva. */
  videoUrl?: string | null;
  /** Tempo mínimo de exibição antes de liberar. No `pickupVideo` vem null: libera no fim do vídeo. */
  minSeconds?: number | null;
};

export type InAppAds = Partial<Record<AdPlacement, InAppAd | null>> & { pickupLayers?: InAppAd[] };

/** O anúncio do Mural entra depois de cada post. */
export const MURAL_AD_EVERY = 1;
/** No feed de cada fã clube (e na Comunidade filtrada por clube), o anúncio entra depois de cada 2 posts. */
export const CLUB_AD_EVERY = 2;

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
  pickupVideo: {
    id: "demo-pickup-video",
    sponsor: "Departamento",
    title: "Toxic: Vintage Culture x Departamento",
    text: "Três anos de estúdio e finalmente saiu. Assista e libere o seu giro.",
    cta: "Ouvir agora",
    url: "https://open.spotify.com/search/Vintage%20Culture%20Departamento%20Toxic",
    imageUrl: "/ads/toxic-departamento.jpg",
    videoUrl: "/ads/toxic-departamento.mp4",
  },
  pickupClaim: {
    id: "demo-pickup-claim",
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
