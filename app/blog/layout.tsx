import BlogNav from '@/components/BlogNav';
import Footer from '@/components/Footer';

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <BlogNav />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}