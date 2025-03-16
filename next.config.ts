import type { NextConfig } from "next";
const withMDX = require('@next/mdx')();

const nextConfig: NextConfig = {
  // Enable Cloudflare Pages compatibility
  output: 'export',
  images: {
    unoptimized: true,
  },
  experimental: {
  },
  // Configure pageExtensions to support MDX
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
};

export default withMDX(nextConfig);
