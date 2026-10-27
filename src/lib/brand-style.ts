/** Cor de fundo, do texto e de destaque do banner de cada marca (usado no painel e no app do fã). */
export type BrandStyle = { bg: string; fg: string; accent: string };

const BRAND: Record<string, BrandStyle> = {
  "coca-cola": { bg: "#E41E2B", fg: "#fff", accent: "#fff" },
  sprite: { bg: "#00A650", fg: "#fff", accent: "#F5E216" },
  nike: { bg: "#111111", fg: "#fff", accent: "#F26B21" },
  spotify: { bg: "#1DB954", fg: "#08140c", accent: "#08140c" },
  "red bull": { bg: "#1B2A6B", fg: "#fff", accent: "#E3002B" },
  heineken: { bg: "#00762D", fg: "#fff", accent: "#E3002B" },
  adidas: { bg: "#111111", fg: "#fff", accent: "#fff" },
};
export const FALLBACK_BRAND: BrandStyle = { bg: "#2F5BD3", fg: "#fff", accent: "#fff" };

export const brandStyle = (brand: string): BrandStyle => BRAND[brand.trim().toLowerCase()] ?? FALLBACK_BRAND;
