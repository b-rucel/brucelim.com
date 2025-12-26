import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllBlogPosts, getBlogPost } from '@/lib/markdown';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const post = await getBlogPost(params.slug);

  if (!post) {
    return {};
  }

  const baseUrl = 'https://brucelim.com';
  const postUrl = `${baseUrl}/blog${post.href}`;

  return {
    title: post.title,
    description: post.description || post.title,

    // Open Graph tags (Facebook, LinkedIn, etc.)
    openGraph: {
      title: post.title,
      description: post.description || post.title,
      type: 'article',
      url: postUrl,
      publishedTime: post.date,
      authors: post.author ? [post.author] : [],
      images: post.image
        ? [
            {
              url: `${baseUrl}${post.image}`,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
    },

    // Twitter Card tags
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description || post.title,
      images: post.image ? [`${baseUrl}${post.image}`] : [],
    },

    // Keywords and authors
    keywords: post.tags?.join(', '),
    authors: post.author ? [{ name: post.author }] : [],
  };
}

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map(post => ({
    slug: post.href.slice(1), // Remove leading slash
  }));
}

export default async function BlogPost(props: PageProps) {
  const params = await props.params;
  const { slug } = params;

  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  try {
    const { default: Component } = await import(`@/contents/${slug}/page.mdx`);

    return (
      <article className="prose prose-invert max-w-none px-4 py-8 md:px-8">
        <Component />
      </article>
    );
  } catch (error) {
    console.error(`Failed to load blog post: ${slug}`, error);
    notFound();
  }
}
