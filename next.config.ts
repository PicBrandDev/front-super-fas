import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera um servidor enxuto em .next/standalone (usado pelo Dockerfile).
  output: "standalone",
  experimental: {
    // A arte da campanha do patrocinador (até 5 MB) passa por uma server action.
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
