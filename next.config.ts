import type { NextConfig } from "next";
import nextMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

// Remark plugin to remove YAML frontmatter
function remarkRemoveFrontmatter() {
  return (tree: any) => {
    // Remove nodes from the beginning until we find content that's not frontmatter
    // Frontmatter is: thematicBreak, then content nodes, then thematicBreak

    if (tree.children.length < 2) return;

    // If starts with thematicBreak, find the closing one
    if (tree.children[0].type === 'thematicBreak') {
      let closingIndex = -1;

      for (let i = 1; i < tree.children.length; i++) {
        if (tree.children[i].type === 'thematicBreak') {
          closingIndex = i;
          break;
        }
      }

      // If we found a closing thematicBreak, remove everything up to and including it
      if (closingIndex > 0) {
        tree.children.splice(0, closingIndex + 1);
      }
    }
  };
}

const withMDX = nextMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkRemoveFrontmatter, remarkGfm],
    rehypePlugins: [rehypeHighlight],
  }
});

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
};

export default withMDX(nextConfig);