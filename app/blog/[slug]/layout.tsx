import BlogNav from '@/components/BlogNav';
import Footer from '@/components/Footer';
import BlogPagination from '@/components/BlogPagination';
import { getPreviousNext } from '@/lib/markdown';
import { WagmiProviders } from '@/app/providers';

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function BlogLayout({ children, params }: LayoutProps) {
  const { slug } = await params;
  const { prev, next } = await getPreviousNext(`/${slug}`);

  return (
    <WagmiProviders>
      <div className="min-h-screen flex flex-col">
        <BlogNav />
        <main className="flex-grow grid-background">
          {children}
          <BlogPagination prev={prev} next={next} />
        </main>
        <Footer />
      </div>
    </WagmiProviders>
  );
}