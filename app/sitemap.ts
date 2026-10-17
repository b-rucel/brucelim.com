import type { MetadataRoute } from 'next';
import { getAllBlogPosts } from '@/lib/markdown';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://brucelim.com';
  const posts = await getAllBlogPosts();

  const blogPosts = posts.map((post) => ({
    url: `${baseUrl}/blog${post.href}`,
    lastModified: post.date,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date().toISOString().split('T')[0],
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date().toISOString().split('T')[0],
    },
    ...blogPosts,
  ];
}
