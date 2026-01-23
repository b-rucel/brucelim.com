import Hero from '@/components/Hero';
import FeaturedWork from '@/components/FeaturedWork';
import WritingList from '@/components/WritingList';
import Footer from '@/components/Footer';
import GridBackground from '@/components/GridBackground';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden">
      <GridBackground />
      <div className="w-full max-w-5xl px-6 lg:px-0">
        <Hero />
        <FeaturedWork />
        <WritingList />
      </div>
      <Footer />
    </main>
  );
}
