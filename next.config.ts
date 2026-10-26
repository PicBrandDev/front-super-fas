import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera um servidor enxuto em .next/standalone (usado pelo Dockerfile).
  output: "standalone",
  experimental: {
    // A arte da campanha do patrocinador (até 5 MB) e a prova do ingresso da revenda (até 8 MB) passam por server actions.
    serverActions: { bodySizeLimit: "9mb" },
  },
  // O PicKap virou PicKup: links e favoritos antigos continuam funcionando.
  async redirects() {
    return [{ source: "/:artista/pickap/:path*", destination: "/:artista/pickup/:path*", permanent: true }];
  },
};

export default nextConfig;
