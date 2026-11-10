/**
 * Fotos de pessoas do modo exemplo da Ludmilla (fãs nos posts, nos perfis e nos fã-clubes). Todas do Unsplash, com a
 * licença livre do Unsplash (uso comercial sem pedir autorização; nenhuma é Unsplash+), servidas pelo CDN deles; o
 * crédito fica aqui. Nenhuma é foto da artista nem de pessoa famosa. Só aparecem sem API_URL (modo exemplo).
 */
import type { MediaImage } from "./types";

type Photo = MediaImage & { credit: string };

const AV = "?w=256&h=256&fit=crop&crop=faces&q=80&auto=format";
const PH = "?w=1080&q=80&auto=format&fit=crop";
const un = (id: string, q: string) => `https://images.unsplash.com/photo-${id}${q}`;

/** Avatar de cada fã de exemplo (id do fã em mock-ludmilla.ts). */
export const PEOPLE: Record<string, Photo> = {
  "u-marina": { src: un("1668950594705-a6bff914f5ea", AV), alt: "Mulher sorrindo com a mão no queixo", credit: "Filip Rankovic Grobgaard / Unsplash (unsplash.com/photos/E8tWwvtFcu8)" },
  "u-bia": { src: un("1704579924216-31ef96f7e008", AV), alt: "Mulher de cabelo cacheado sorrindo", credit: "Romario Roges / Unsplash (unsplash.com/photos/uLCaTbqyixg)" },
  "u-thiago": { src: un("1536548665027-b96d34a005ae", AV), alt: "Homem sorrindo de camiseta azul", credit: "Daniel Capelani / Unsplash (unsplash.com/photos/gRslJX1S4h0)" },
  "u-duda": { src: un("1591634616938-1dfa7ee2e617", AV), alt: "Mulher negra sorrindo de regata verde", credit: "Tiry Nelson Gono / Unsplash (unsplash.com/photos/1iiq1scZLfU)" },
  "u-carol": { src: un("1639851020460-b59eee6fbdea", AV), alt: "Mulher de brincos sorrindo", credit: "Studio Michael França / Unsplash (unsplash.com/photos/HrbAkrbAHos)" },
  "u-gabi": { src: un("1606317960132-4f4a0d1c8f48", AV), alt: "Mulher sorrindo de camisa xadrez", credit: "Gui França / Unsplash (unsplash.com/photos/_yeDQX95JeI)" },
  "u-rafa": { src: un("1710357956769-232ef8e9e1aa", AV), alt: "Homem de moletom amarelo sorrindo", credit: "Mike Santos / Unsplash (unsplash.com/photos/L86XoLxEd-I)" },
  "u-juliana": { src: un("1587238607741-e49e70bf8525", AV), alt: "Mulher de cabelo longo com a mão no rosto", credit: "André Ravazzi / Unsplash (unsplash.com/photos/pFHPX3W4Ft4)" },
  "u-leo": { src: un("1521817760127-e15c26f67fd2", AV), alt: "Homem de cabelo cacheado de regata verde", credit: "Caftos / Unsplash (unsplash.com/photos/mgLuffTBCWk)" },
  "u-pedro": { src: un("1729795795561-97daeedfec02", AV), alt: "Homem sorrindo de camiseta preta", credit: "Kawê Rodrigues / Unsplash (unsplash.com/photos/dOh1WEQsyPY)" },
  "u-nanda": { src: un("1662850886700-4ec19bd30d11", AV), alt: "Mulher de cabelo cacheado sorrindo", credit: "Nolan Manning / Unsplash (unsplash.com/photos/Ll9YOG20UFI)" },
  "u-vitor": { src: un("1783434420883-3ad9d6b52207", AV), alt: "Homem sorrindo com camisa amarela", credit: "Olumide Adekunle / Unsplash (unsplash.com/photos/L29at58zVZY)" },
};

/** Fotos dos posts de fã e dos fã-clubes. */
export const SCENES: Partial<Record<"crowd" | "friends" | "samba" | "sunglasses" | "beach" | "carnival" | "sign" | "sunset" | "party", Photo>> = {
  crowd: { src: un("1450044804117-534ccd6e6a3a", PH), alt: "Plateia de mãos para cima sob luzes roxas e rosas no show", credit: "Abigail Lynn / Unsplash (unsplash.com/photos/rdmJc2Os4EM)" },
  party: { src: un("1792323307013-ddf506428d84", PH), alt: "Duas amigas juntas na plateia de um show", credit: "Timofey Radkevich / Unsplash (unsplash.com/photos/a2UZhdOH8yk)" },
  friends: { src: un("1649730749984-d56e45c8335e", PH), alt: "Galera do fã-clube posando junta antes do show", credit: "Abstral Official / Unsplash (unsplash.com/photos/fzgzE5B19aQ)" },
  sunglasses: { src: un("1774582110261-d75196b302b2", PH), alt: "Duas amigas de óculos escuros tirando selfie", credit: "Alexander Ruiz / Unsplash (unsplash.com/photos/abyGnGOi5_g)" },
  beach: { src: un("1705937551985-a83b86342e74", PH), alt: "Praia de Copacabana cheia, com os morros ao fundo", credit: "Daniel de Paola / Unsplash (unsplash.com/photos/Q45J83dZXZ4)" },
  carnival: { src: un("1725287958872-51ac9dbcf89d", PH), alt: "Bloco de rua com gente dançando entre prédios", credit: "Darwin Boaventura / Unsplash (unsplash.com/photos/2pJGGCz84sM)" },
  sign: { src: un("1703194176871-a776be69981e", PH), alt: "Fã segurando cartaz de coração no meio da plateia", credit: "Warre Van de Wouwer / Unsplash (unsplash.com/photos/SN3hR-fDH_4)" },
  sunset: { src: un("1701397166070-9c5b9115daf4", PH), alt: "Pôr do sol em Ipanema com gente na areia", credit: "Jean Carlos / Unsplash (unsplash.com/photos/1vWVozndKGo)" },
  samba: { src: un("1646002836372-df90bac447d0", PH), alt: "Surdo de bateria em desfile de rua", credit: "Mathias Reding / Unsplash (unsplash.com/photos/DpoqARsh514)" },
};
