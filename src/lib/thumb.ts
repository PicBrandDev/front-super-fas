/**
 * Foto enviada em tamanho certo: `/uploads/x.jpg` vira `/uploads/x.jpg?w=96` (a API entrega a versão reduzida).
 * Um avatar de 32 px não precisa baixar a foto de 1 MB. Outros endereços (fotos de exemplo, links externos) passam como estão.
 */
export function thumb(src: string | null | undefined, px: number): string {
  if (!src || !src.startsWith("/uploads/") || src.includes("?")) return src ?? "";
  // Mede em pixels do aparelho (2x) e escolhe o menor tamanho que serve.
  const need = px * 2;
  const w = need <= 96 ? 96 : need <= 256 ? 256 : need <= 720 ? 720 : 1080;
  return `${src}?w=${w}`;
}
