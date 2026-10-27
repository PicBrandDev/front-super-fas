/**
 * Arquivos enviados pelo admin (fotos do Drop News, vídeo do anúncio do giro etc.): o front serve na
 * própria origem, buscando na API. Repassa `Range` e devolve 206 com `Content-Range`/`Accept-Ranges`:
 * sem isso o Safari/iOS não toca vídeo.
 */
const PASS = ["content-type", "content-length", "content-range", "accept-ranges", "etag", "last-modified"];

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const base = process.env.API_URL?.replace(/\/$/, "");
  const { path } = await params;
  if (!base || path.some((s) => !/^[A-Za-z0-9._-]+$/.test(s) || s.startsWith("."))) {
    return new Response(null, { status: 404 });
  }

  // `identity`: o fetch do Node descompactaria o corpo e o `content-length`/`content-range` deixariam de bater.
  const ask = new Headers({ "accept-encoding": "identity" });
  for (const h of ["range", "if-range"]) {
    const value = req.headers.get(h);
    if (value) ask.set(h, value);
  }
  // `w` pede a foto reduzida (a API só aceita 96, 256, 720 e 1080; qualquer outro valor entrega o original).
  const w = new URL(req.url).searchParams.get("w");
  const query = w && /^\d{2,4}$/.test(w) ? `?w=${w}` : "";
  const res = await fetch(`${base}/uploads/${path.join("/")}${query}`, { headers: ask, cache: "no-store" });

  if (res.status === 416) {
    // Faixa fora do arquivo: repassa o tamanho real para o player pedir de novo.
    const range = res.headers.get("content-range");
    return new Response(null, { status: 416, headers: range ? { "content-range": range } : undefined });
  }
  if (!res.ok) return new Response(null, { status: res.status === 404 ? 404 : 502 });

  const headers = new Headers({ "cache-control": "public, max-age=31536000, immutable" });
  for (const h of PASS) {
    const value = res.headers.get(h);
    if (value) headers.set(h, value);
  }
  if (!headers.has("content-type")) headers.set("content-type", "application/octet-stream");
  if (!headers.has("accept-ranges")) headers.set("accept-ranges", "bytes");
  return new Response(res.body, { status: res.status, headers });
}
