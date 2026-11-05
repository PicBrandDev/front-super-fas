/**
 * Arte pronta para postar no Instagram: a foto do post com a hashtag do ranking e o código do fã em cima, no formato
 * dos Stories (9:16) ou do Feed (4:5). O Instagram não aceita legenda ou hashtag pré-preenchidas por link, então a
 * hashtag vai dentro da própria imagem (e também na legenda copiada).
 */
import type { BrandKey } from "./brands";

export type ShareFormat = "story" | "feed";

const SIZE: Record<ShareFormat, { w: number; h: number }> = {
  story: { w: 1080, h: 1920 },
  feed: { w: 1080, h: 1350 },
};

const SANS = 'Archivo, "Helvetica Neue", Arial, sans-serif';

/** Cores e letra da arte de cada marca (canvas não lê as variáveis --fc-*). */
type Look = {
  bg: string;
  warm: string;
  accent: string;
  fade: string;
  display: string;
  upper: boolean;
  /** Variável CSS da fonte da pele (next/font dá um nome de família próprio; o canvas precisa dele). */
  fontVar?: string;
};
const LOOKS: Record<BrandKey, Look> = {
  vintage: {
    bg: "#120907",
    warm: "#3a1d0c",
    accent: "#FE9900",
    fade: "18,9,7",
    display: '"Playfair Display", Georgia, "Times New Roman", serif',
    upper: false,
  },
  // Departamento: campo azul elétrico chapado (sem degradê), tinta branca, grotesca em caixa alta.
  departamento: { bg: "#0000FF", warm: "#0000FF", accent: "#FFFFFF", fade: "16,16,16", display: SANS, upper: true },
  // Anitta: céu azul-noite chapado, hashtag em ouro, Averia Serif Libre em caixa alta.
  anitta: { bg: "#0A1A31", warm: "#0A1A31", accent: "#EAC62E", fade: "10,26,49", display: "Georgia, serif", upper: true, fontVar: "--font-averia" },
};

async function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // sem isso uma imagem de outro domínio "suja" o canvas e não dá para exportar
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Quebra o texto em linhas que cabem em `maxW` (no máximo `maxLines`, com reticências). */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(next).width <= maxW || !cur) cur = next;
    else {
      lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const cut = lines.slice(0, maxLines);
    cut[maxLines - 1] = `${cut[maxLines - 1].replace(/[\s.,;:!?-]+$/, "")}…`;
    return cut;
  }
  return lines;
}

export async function buildShareArt({
  format,
  imageSrc,
  text,
  hashtag,
  code,
  artistName,
  brand = "vintage",
}: {
  format: ShareFormat;
  imageSrc?: string | null;
  text: string;
  hashtag: string;
  code: string;
  artistName: string;
  brand?: BrandKey;
}): Promise<Blob> {
  const { w, h } = SIZE[format];
  const look = LOOKS[brand];
  const BG = look.bg;
  const SERIF = (look.fontVar && getComputedStyle(document.documentElement).getPropertyValue(look.fontVar).trim()) || look.display;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Seu navegador não conseguiu montar a arte.");

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);

  const img = imageSrc ? await loadImage(imageSrc) : null;
  if (img) {
    // "cover": a foto preenche a arte inteira, cortando as sobras.
    const k = Math.max(w / img.width, h / img.height);
    const dw = img.width * k;
    const dh = img.height * k;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  } else {
    // Sem foto: fundo quente e o texto do post em destaque.
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, look.warm);
    g.addColorStop(1, BG);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#fff";
    ctx.font = `900 72px ${SERIF}`;
    ctx.textBaseline = "top";
    const lines = wrap(ctx, look.upper ? text.toUpperCase() : text, w - 220, 8);
    const top = Math.max(180, h * 0.14);
    lines.forEach((l, i) => ctx.fillText(l, 110, top + i * 92));
  }

  // Degradê escuro embaixo para a hashtag ficar legível sobre qualquer foto.
  const fadeH = h * (format === "story" ? 0.42 : 0.5);
  const fade = ctx.createLinearGradient(0, h - fadeH, 0, h);
  fade.addColorStop(0, `rgba(${look.fade},0)`);
  fade.addColorStop(0.55, `rgba(${look.fade},0.82)`);
  fade.addColorStop(1, `rgba(${look.fade},0.96)`);
  ctx.fillStyle = fade;
  ctx.fillRect(0, h - fadeH, w, fadeH);

  // Nos Stories, o Instagram cobre o topo e a base com a interface: o texto fica na faixa segura.
  const safeBottom = format === "story" ? 250 : 90;
  const x = 90;
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "#fff";
  ctx.font = `600 40px ${SANS}`;
  ctx.fillText(`FÃ CLUBE ${artistName.toUpperCase()}`, x, h - safeBottom - 250);

  // A hashtag em âmbar, quebrada em duas linhas se não couber.
  const tag = `#${hashtag}`;
  let size = 96;
  ctx.font = `900 ${size}px ${SERIF}`;
  while (ctx.measureText(tag).width > w - x * 2 && size > 48) {
    size -= 4;
    ctx.font = `900 ${size}px ${SERIF}`;
  }
  ctx.fillStyle = look.accent;
  ctx.fillText(tag, x, h - safeBottom - 130);

  ctx.fillStyle = "#fff";
  ctx.font = `500 44px ${SANS}`;
  ctx.fillText(code ? `Fã ${code}` : "Fã do clube", x, h - safeBottom - 50);

  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Não deu para gerar a imagem."))), "image/jpeg", 0.92);
  });
}
