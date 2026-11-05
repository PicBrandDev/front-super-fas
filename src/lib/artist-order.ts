/** Ambientes de destaque: aparecem primeiro nas listas do admin master; o resto segue a ordem de criação da API. */
const PRIORITY = ["vintage-culture", "departamento", "anitta", "veigh"];
const rank = (slug: string) => (PRIORITY.includes(slug) ? PRIORITY.indexOf(slug) : PRIORITY.length);

export const orderArtists = <T extends { slug: string }>(artists: T[]): T[] => [...artists].sort((a, b) => rank(a.slug) - rank(b.slug));
