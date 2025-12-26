import { promises as fs } from 'fs';
import path from 'path';

export type BlogMdxFrontmatter = {
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  image?: string;
};

export interface BlogPost {
  title: string;
  href: string;
  date: string;
  description?: string;
  author?: string;
  tags?: string[];
  image?: string;
}

// Cache for blog posts to avoid repeated filesystem reads
let blogPostsCache: BlogPost[] | null = null;

/**
 * Extract frontmatter from MDX content using simple regex
 * Expects YAML frontmatter between --- delimiters
 */
function extractFrontmatter(content: string): Record<string, unknown> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const frontmatterStr = match[1];
  const frontmatter: Record<string, unknown> = {};

  // Parse YAML-like frontmatter manually
  const lines = frontmatterStr.split('\n');
  let currentKey: string | null = null;
  let currentValue: string[] = [];

  for (const line of lines) {
    if (line.match(/^\w+:/)) {
      // Save previous key-value
      if (currentKey) {
        const value = currentValue.join('\n').trim();
        frontmatter[currentKey] = parseYAMLValue(value);
      }

      // Parse new key
      const colonIndex = line.indexOf(':');
      currentKey = line.substring(0, colonIndex).trim();
      const restOfLine = line.substring(colonIndex + 1).trim();

      if (restOfLine.startsWith('[')) {
        // Array value
        currentValue = [restOfLine];
      } else if (restOfLine.startsWith('"') || restOfLine.startsWith("'")) {
        // Quoted string
        currentValue = [restOfLine];
      } else {
        // Regular value
        currentValue = [restOfLine];
      }
    } else if (currentKey && line.trim()) {
      // Continuation of array or multiline value
      currentValue.push(line);
    }
  }

  // Save last key-value
  if (currentKey) {
    const value = currentValue.join('\n').trim();
    frontmatter[currentKey] = parseYAMLValue(value);
  }

  return frontmatter;
}

/**
 * Parse YAML value to appropriate JavaScript type
 */
function parseYAMLValue(value: string): unknown {
  // Handle arrays
  if (value.startsWith('[') && value.endsWith(']')) {
    const content = value.slice(1, -1);
    return content.split(',').map(item => {
      item = item.trim();
      if (item.startsWith('"') || item.startsWith("'")) {
        return item.slice(1, -1);
      }
      return item;
    });
  }

  // Handle quoted strings
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  // Return as-is for unquoted strings
  return value;
}

/**
 * Get all blog posts by reading from /contents directory
 */
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  if (blogPostsCache) {
    return blogPostsCache;
  }

  try {
    const contentsDir = path.join(process.cwd(), 'contents');
    const entries = await fs.readdir(contentsDir, { withFileTypes: true });

    const posts: BlogPost[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const slug = entry.name;
      const mdxPath = path.join(contentsDir, slug, 'page.mdx');

      try {
        const content = await fs.readFile(mdxPath, 'utf-8');
        const frontmatter = extractFrontmatter(content) as Partial<BlogMdxFrontmatter>;

        if (frontmatter.title && frontmatter.date) {
          posts.push({
            title: frontmatter.title,
            href: `/${slug}`,
            date: frontmatter.date,
            description: frontmatter.description,
            author: frontmatter.author,
            tags: frontmatter.tags,
            image: frontmatter.image,
          });
        }
      } catch {
        // Skip folders without valid MDX files
        continue;
      }
    }

    // Sort by date descending
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    blogPostsCache = posts;
    return posts;
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

/**
 * Get a specific blog post by slug
 */
export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  const posts = await getAllBlogPosts();
  return posts.find(post => post.href === `/${slug}`);
}

/**
 * Get previous and next blog posts for pagination
 */
export async function getPreviousNext(currentPath: string) {
  const posts = await getAllBlogPosts();
  const currentIndex = posts.findIndex(post => post.href === currentPath);

  return {
    prev: currentIndex > 0 ? posts[currentIndex - 1] : null,
    next: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null
  };
}
