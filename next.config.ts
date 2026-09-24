import type { NextConfig } from "next";

// Validates environment variables when `next dev` or `next build` starts.
import "./lib/env";

const nextConfig: NextConfig = {
  // Pin the project root so a stray lockfile in a parent folder is never picked up.
  turbopack: { root: __dirname },
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
