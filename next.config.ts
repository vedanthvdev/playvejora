import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone bakes this config into the build, so the container does not
  // need TypeScript at runtime to read next.config.ts.
  output: "standalone",
  serverExternalPackages: ["better-sqlite3"],
  outputFileTracingRoot: process.cwd(),
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
