import type { NextConfig } from "next";

// Validates environment variables when `next dev` or `next build` starts.
import "./lib/env";
import { securityHeaders } from "./lib/security/headers";

const nextConfig: NextConfig = {
  // Pin the project root so a stray lockfile in a parent folder is never picked up.
  turbopack: { root: __dirname },
  outputFileTracingRoot: __dirname,
  // The chat route reads content/james/*.md from disk at runtime, which tracing can't see.
  outputFileTracingIncludes: {
    "/api/chat": ["./content/james/**/*.md"],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders({
          dev: process.env.NODE_ENV === "development",
          // Vercel serves every deployment over HTTPS; a local `next start` is plain HTTP.
          https: process.env.VERCEL === "1",
        }),
      },
    ];
  },
};

export default nextConfig;
