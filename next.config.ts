import type { NextConfig } from "next";
import nextMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';

const withMDX = nextMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
  }
});

const nextConfig: NextConfig = {
  // Enable Cloudflare Pages compatibility
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Configure pageExtensions to support MDX
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
};

export default withMDX(nextConfig);