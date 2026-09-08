import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  eslint: {
    ignoreDuringBuilds: true,
  },
};

// Gives `next dev` the same D1 binding the deployed Worker gets.
void initOpenNextCloudflareForDev();

export default nextConfig;
