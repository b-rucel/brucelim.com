import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Cloudflare Pages compatibility
  output: 'export',
  images: {
    unoptimized: true,
  },
  experimental: {
  }
};

export default nextConfig;
