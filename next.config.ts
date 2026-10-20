import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gera um servidor enxuto em .next/standalone (usado pelo Dockerfile).
  output: "standalone",
};

export default nextConfig;
