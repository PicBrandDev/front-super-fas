/** Fotos enviadas pelo admin (Drop News etc.): o front serve na própria origem, buscando na API. */
export async function GET(_: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const base = process.env.API_URL?.replace(/\/$/, "");
  const { path } = await params;
  if (!base || path.some((s) => !/^[A-Za-z0-9._-]+$/.test(s) || s.startsWith("."))) {
    return new Response(null, { status: 404 });
  }
  const res = await fetch(`${base}/uploads/${path.join("/")}`);
  if (!res.ok) return new Response(null, { status: res.status === 404 ? 404 : 502 });
  return new Response(res.body, {
    headers: {
      "content-type": res.headers.get("content-type") ?? "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
