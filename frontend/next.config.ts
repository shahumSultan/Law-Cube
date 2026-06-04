import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" is only used for Docker self-hosting.
  // Vercel manages its own output, so we skip it there.
  output: process.env.NEXT_STANDALONE === "true" ? "standalone" : undefined,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  },
};

export default nextConfig;
