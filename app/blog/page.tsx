import Link from 'next/link';
import { getAllBlogPosts } from '@/lib/markdown';

export const metadata = {
  title: 'Blog',
  description: 'Read my latest blog posts on web development, programming, and tech topics',
};

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Thoughts on web development, programming, and technology
        </p>
      </div>

      <div className="space-y-8">
        {posts.map((post) => (
          <article
            key={post.href}
            className="border-b border-gray-200 dark:border-gray-800 pb-8 last:border-b-0"
          >
            <Link href={`/blog${post.href}`}>
              <h2 className="text-2xl font-bold mb-2 hover:text-gray-600 dark:hover:text-gray-400 transition-colors">
                {post.title}
              </h2>
            </Link>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>

            {post.description && (
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {post.description}
              </p>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-3 py-1 text-sm bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No blog posts found</p>
        </div>
      )}
    </div>
  );
}
