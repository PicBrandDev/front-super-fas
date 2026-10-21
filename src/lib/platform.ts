/**
 * Marca da plataforma (white label).
 *
 * Os painéis administrativos, o portal do patrocinador e as telas de conta usam
 * esta configuração em vez de textos fixos. Troque pelas variáveis de ambiente
 * NEXT_PUBLIC_PLATFORM_* (ver .env.example) para usar a plataforma com outra marca.
 */

const env = (key: string) => process.env[key]?.trim() || undefined;

const HEX = /^#[0-9a-f]{6}$/i;

export type Platform = {
  name: string; // ex.: "Super Fãs"
  mark: string; // 1–2 letras do selo
  tagline: string; // ex.: "Plataforma de fã clubes"
  description: string; // meta description padrão
  color?: string; // cor principal dos painéis (hex); vazio = azul padrão
};

const name = env("NEXT_PUBLIC_PLATFORM_NAME") ?? "Super Fãs";
const color = env("NEXT_PUBLIC_PLATFORM_COLOR");

export const platform: Platform = {
  name,
  mark: (env("NEXT_PUBLIC_PLATFORM_MARK") ?? name.charAt(0)).slice(0, 2).toUpperCase(),
  tagline: env("NEXT_PUBLIC_PLATFORM_TAGLINE") ?? "Plataforma de fã clubes",
  description: "Plataforma de fã clubes: mural, agenda, sorte, loja, prévias e muito mais.",
  color: color && HEX.test(color) ? color : undefined,
};
