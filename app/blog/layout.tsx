import BlogNav from '@/components/BlogNav';
import Footer from '@/components/Footer';
import BlogPagination from '../components/BlogPagination';

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <BlogNav />
      <main className="flex-grow grid-background">
        {children}
        <BlogPagination />
      </main>
      <Footer />
    </div>
  );
}